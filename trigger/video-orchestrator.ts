import { task, logger, metadata } from "@trigger.dev/sdk/v3"
import {
  getVideoProjectById,
  getVideoClips,
  updateVideoProject,
  updateVideoProjectCounts,
} from "@/lib/db/queries"
import { generateVideoClipTask } from "./generate-video-clip"
import { compileVideoTask } from "./compile-video"
import { VIDEO_PRICING } from "@/lib/video/video-constants"

export interface GenerateVideoPayload {
  videoProjectId: string
}

export interface GenerateVideoStatus {
  step: "starting" | "generating" | "compiling" | "completed" | "failed"
  label: string
  clipIndex?: number
  totalClips?: number
  progress?: number
}

export const generateVideoTask = task({
  id: "generate-video",
  maxDuration: 1800, // 30 minutes total
  retry: {
    maxAttempts: 1, // Don't retry the orchestrator itself
  },
  run: async (payload: GenerateVideoPayload) => {
    const { videoProjectId } = payload

    try {
      // Step 1: Fetch video project and clips
      metadata.set("status", {
        step: "starting",
        label: "Starting video generation…",
        progress: 5,
      } satisfies GenerateVideoStatus)

      logger.info("Starting video generation", { videoProjectId })

      const projectData = await getVideoProjectById(videoProjectId)
      if (!projectData) {
        throw new Error(`Video project not found: ${videoProjectId}`)
      }

      const { videoProject } = projectData
      const clips = await getVideoClips(videoProjectId)

      if (clips.length === 0) {
        throw new Error("No clips to generate")
      }

      // Update project status to generating
      await updateVideoProject(videoProjectId, {
        status: "generating",
        clipCount: clips.length,
        estimatedCost: Math.round(clips.length * VIDEO_PRICING.COST_PER_5_SECOND_CLIP * 100),
      })

      // Step 2: Generate all clips in parallel
      metadata.set("status", {
        step: "generating",
        label: `Generating ${clips.length} clips…`,
        clipIndex: 0,
        totalClips: clips.length,
        progress: 10,
      } satisfies GenerateVideoStatus)

      logger.info("Triggering clip generation tasks", { clipCount: clips.length })

      // Trigger all clip generation tasks and wait for them
      const clipResults = await generateVideoClipTask.batchTriggerAndWait(
        clips.map((clip) => ({ payload: { clipId: clip.id } }))
      )

      // Check results
      const successfulClips = clipResults.runs.filter((r) => r.ok)
      const failedClips = clipResults.runs.filter((r) => !r.ok)

      logger.info("Clip generation completed", {
        successful: successfulClips.length,
        failed: failedClips.length,
      })

      // Update counts
      await updateVideoProjectCounts(videoProjectId)

      // If all clips failed, mark as failed
      if (successfulClips.length === 0) {
        throw new Error("All clip generations failed")
      }

      // If some clips failed, log warning but continue with successful ones
      if (failedClips.length > 0) {
        logger.warn("Some clips failed to generate", {
          failedCount: failedClips.length,
          failedClipIds: failedClips.map((r) => r.taskIdentifier),
        })
      }

      // Step 3: Compile video
      metadata.set("status", {
        step: "compiling",
        label: "Compiling video…",
        progress: 70,
      } satisfies GenerateVideoStatus)

      // Update project status to compiling
      await updateVideoProject(videoProjectId, {
        status: "compiling",
      })

      logger.info("Triggering video compilation", { videoProjectId })

      // Trigger and wait for compilation
      const compileResult = await compileVideoTask.triggerAndWait({
        videoProjectId,
      })

      if (!compileResult.ok) {
        throw new Error("Video compilation failed")
      }

      // Calculate actual cost
      const actualCost = Math.round(
        successfulClips.length * VIDEO_PRICING.COST_PER_5_SECOND_CLIP * 100
      )

      // Update final status
      await updateVideoProject(videoProjectId, {
        actualCost,
      })

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies GenerateVideoStatus)

      logger.info("Video generation completed", {
        videoProjectId,
        successfulClips: successfulClips.length,
        failedClips: failedClips.length,
        actualCost,
      })

      return {
        success: true,
        videoProjectId,
        finalVideoUrl: compileResult.output?.finalVideoUrl,
        successfulClips: successfulClips.length,
        failedClips: failedClips.length,
        actualCost,
      }
    } catch (error) {
      logger.error("Video generation failed", {
        videoProjectId,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      metadata.set("status", {
        step: "failed",
        label: "Generation failed",
        progress: 0,
      } satisfies GenerateVideoStatus)

      // Update project status
      await updateVideoProject(videoProjectId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Generation failed",
      })

      throw error
    }
  },
})
