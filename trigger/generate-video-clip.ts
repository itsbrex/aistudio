import { task, logger, metadata } from "@trigger.dev/sdk/v3"
import { fal, KLING_VIDEO_PRO, type KlingVideoOutput } from "@/lib/fal"
import { getVideoClipById, updateVideoClip, updateVideoProjectCounts } from "@/lib/db/queries"
import { uploadVideo, getVideoPath } from "@/lib/supabase"
import { getMotionPrompt, DEFAULT_NEGATIVE_PROMPT } from "@/lib/video/motion-prompts"
import type { VideoRoomType } from "@/lib/db/schema"

export interface GenerateVideoClipPayload {
  clipId: string
}

export interface VideoClipStatus {
  step: "fetching" | "uploading" | "generating" | "saving" | "completed" | "failed"
  label: string
  progress?: number
}

export const generateVideoClipTask = task({
  id: "generate-video-clip",
  maxDuration: 300, // 5 minutes - Kling can take a while
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 2000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: GenerateVideoClipPayload) => {
    const { clipId } = payload

    try {
      // Step 1: Fetch clip record
      metadata.set("status", {
        step: "fetching",
        label: "Loading clip data…",
        progress: 10,
      } satisfies VideoClipStatus)

      logger.info("Fetching video clip record", { clipId })

      const clip = await getVideoClipById(clipId)
      if (!clip) {
        throw new Error(`Video clip not found: ${clipId}`)
      }

      // Skip if already completed
      if (clip.status === "completed" && clip.clipUrl) {
        logger.info("Clip already processed, skipping", { clipId })
        metadata.set("status", {
          step: "completed",
          label: "Already processed",
          progress: 100,
        } satisfies VideoClipStatus)
        return { success: true, message: "Already processed", clipUrl: clip.clipUrl }
      }

      // Update status to processing
      await updateVideoClip(clipId, { status: "processing" })

      // Step 2: Upload source image to Fal.ai storage
      metadata.set("status", {
        step: "uploading",
        label: "Preparing image…",
        progress: 20,
      } satisfies VideoClipStatus)

      logger.info("Fetching source image", {
        clipId,
        sourceImageUrl: clip.sourceImageUrl,
      })

      const imageResponse = await fetch(clip.sourceImageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch source image: ${imageResponse.status}`)
      }

      const imageBlob = await imageResponse.blob()
      const falImageUrl = await fal.storage.upload(
        new File([imageBlob], "source.jpg", { type: imageBlob.type })
      )

      logger.info("Uploaded to Fal.ai storage", { falImageUrl })

      // Step 3: Generate motion prompt
      const motionPrompt = clip.motionPrompt || getMotionPrompt(clip.roomType as VideoRoomType)

      // Step 4: Call Kling Video API
      metadata.set("status", {
        step: "generating",
        label: "Generating video…",
        progress: 40,
      } satisfies VideoClipStatus)

      logger.info("Calling Kling Video v2.6 Pro", {
        clipId,
        prompt: motionPrompt,
        duration: clip.durationSeconds?.toString() || "5",
      })

      const result = await fal.subscribe(KLING_VIDEO_PRO, {
        input: {
          image_url: falImageUrl,
          prompt: motionPrompt,
          duration: (clip.durationSeconds?.toString() || "5") as "5" | "10",
          aspect_ratio: "16:9", // Default to landscape for real estate
          negative_prompt: DEFAULT_NEGATIVE_PROMPT,
        },
        onQueueUpdate: (update) => {
          logger.info("Kling processing update", { update })
          if (update.status === "IN_PROGRESS") {
            metadata.set("status", {
              step: "generating",
              label: "Generating video…",
              progress: 50,
            } satisfies VideoClipStatus)
          }
        },
      }) as unknown as KlingVideoOutput

      logger.info("Kling result received", { result })

      // Check for result - handle both direct and wrapped response
      const output = (result as { data?: KlingVideoOutput }).data || result
      if (!output.video?.url) {
        logger.error("No video in response", { result })
        throw new Error("No video returned from Kling API")
      }

      const resultVideoUrl = output.video.url

      // Step 5: Save to Supabase
      metadata.set("status", {
        step: "saving",
        label: "Saving video…",
        progress: 80,
      } satisfies VideoClipStatus)

      logger.info("Downloading result video", { resultVideoUrl })

      const resultVideoResponse = await fetch(resultVideoUrl)
      if (!resultVideoResponse.ok) {
        throw new Error("Failed to download result video")
      }

      const resultVideoBuffer = await resultVideoResponse.arrayBuffer()

      // Get videoProject to access workspaceId
      const { getVideoProjectById } = await import("@/lib/db/queries")
      const videoProjectData = await getVideoProjectById(clip.videoProjectId)
      if (!videoProjectData) {
        throw new Error("Video project not found")
      }

      const videoPath = getVideoPath(
        videoProjectData.videoProject.workspaceId,
        clip.videoProjectId,
        `${clipId}.mp4`
      )

      logger.info("Uploading to Supabase", { videoPath })

      const storedVideoUrl = await uploadVideo(
        new Uint8Array(resultVideoBuffer),
        videoPath,
        "video/mp4"
      )

      // Update clip record with result
      await updateVideoClip(clipId, {
        status: "completed",
        clipUrl: storedVideoUrl,
        errorMessage: null,
      })

      // Update project counts
      await updateVideoProjectCounts(clip.videoProjectId)

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies VideoClipStatus)

      logger.info("Video clip generation completed", {
        clipId,
        clipUrl: storedVideoUrl,
      })

      return {
        success: true,
        clipUrl: storedVideoUrl,
        clipId,
      }
    } catch (error) {
      logger.error("Video clip generation failed", {
        clipId,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      metadata.set("status", {
        step: "failed",
        label: "Generation failed",
        progress: 0,
      } satisfies VideoClipStatus)

      // Update status to failed
      await updateVideoClip(clipId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Generation failed",
      })

      // Update project counts
      const clip = await getVideoClipById(clipId)
      if (clip) {
        await updateVideoProjectCounts(clip.videoProjectId)
      }

      throw error
    }
  },
})
