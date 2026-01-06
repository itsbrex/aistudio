import { task, logger, metadata } from "@trigger.dev/sdk/v3"
import { getVideoProjectById, getVideoClips, updateVideoProject, getMusicTrackById } from "@/lib/db/queries"
import { uploadVideo, getVideoPath } from "@/lib/supabase"
import { execSync } from "child_process"
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

export interface CompileVideoPayload {
  videoProjectId: string
}

export interface CompileVideoStatus {
  step: "fetching" | "downloading" | "compiling" | "uploading" | "completed" | "failed"
  label: string
  progress?: number
}

export const compileVideoTask = task({
  id: "compile-video",
  maxDuration: 600, // 10 minutes for FFmpeg compilation
  machine: "medium-1x", // More CPU for FFmpeg
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60000,
    factor: 2,
  },
  run: async (payload: CompileVideoPayload) => {
    const { videoProjectId } = payload
    const workDir = join(tmpdir(), `video-compile-${videoProjectId}`)

    try {
      // Step 1: Fetch video project and clips
      metadata.set("status", {
        step: "fetching",
        label: "Loading video data…",
        progress: 5,
      } satisfies CompileVideoStatus)

      logger.info("Fetching video project", { videoProjectId })

      const projectData = await getVideoProjectById(videoProjectId)
      if (!projectData) {
        throw new Error(`Video project not found: ${videoProjectId}`)
      }

      const { videoProject, musicTrack } = projectData
      const clips = await getVideoClips(videoProjectId)

      // Filter to only completed clips
      const completedClips = clips.filter((c) => c.status === "completed" && c.clipUrl)
      if (completedClips.length === 0) {
        throw new Error("No completed clips to compile")
      }

      logger.info("Found clips to compile", {
        total: clips.length,
        completed: completedClips.length,
      })

      // Create work directory
      if (existsSync(workDir)) {
        rmSync(workDir, { recursive: true })
      }
      mkdirSync(workDir, { recursive: true })

      // Step 2: Download all clips
      metadata.set("status", {
        step: "downloading",
        label: `Downloading ${completedClips.length} clips…`,
        progress: 10,
      } satisfies CompileVideoStatus)

      const clipPaths: string[] = []
      for (let i = 0; i < completedClips.length; i++) {
        const clip = completedClips[i]
        const clipPath = join(workDir, `clip_${String(i).padStart(3, "0")}.mp4`)

        logger.info(`Downloading clip ${i + 1}/${completedClips.length}`, {
          clipId: clip.id,
          clipUrl: clip.clipUrl,
        })

        const response = await fetch(clip.clipUrl!)
        if (!response.ok) {
          throw new Error(`Failed to download clip ${clip.id}: ${response.status}`)
        }

        const buffer = await response.arrayBuffer()
        writeFileSync(clipPath, Buffer.from(buffer))
        clipPaths.push(clipPath)

        metadata.set("status", {
          step: "downloading",
          label: `Downloaded ${i + 1}/${completedClips.length} clips`,
          progress: 10 + Math.round((i / completedClips.length) * 30),
        } satisfies CompileVideoStatus)
      }

      // Download music track if selected
      let musicPath: string | null = null
      if (musicTrack?.audioUrl) {
        logger.info("Downloading music track", { musicTrackId: musicTrack.id })
        const musicResponse = await fetch(musicTrack.audioUrl)
        if (musicResponse.ok) {
          const musicBuffer = await musicResponse.arrayBuffer()
          musicPath = join(workDir, "music.mp3")
          writeFileSync(musicPath, Buffer.from(musicBuffer))
        }
      }

      // Step 3: Compile video with FFmpeg
      metadata.set("status", {
        step: "compiling",
        label: "Compiling video…",
        progress: 45,
      } satisfies CompileVideoStatus)

      const outputPath = join(workDir, "output.mp4")
      const concatListPath = join(workDir, "concat.txt")

      // Create concat file for FFmpeg
      const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n")
      writeFileSync(concatListPath, concatContent)

      logger.info("Running FFmpeg compilation", {
        clipCount: clipPaths.length,
        hasMusic: !!musicPath,
      })

      // Build FFmpeg command
      let ffmpegCmd: string

      if (musicPath) {
        // With music: concatenate clips and add audio
        const musicVolume = (videoProject.musicVolume ?? 50) / 100
        ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -i "${musicPath}" -filter_complex "[1:a]volume=${musicVolume}[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[aout]" -map 0:v -map "[aout]" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -shortest -y "${outputPath}"`
      } else {
        // Without music: just concatenate clips
        ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -y "${outputPath}"`
      }

      try {
        execSync(ffmpegCmd, {
          cwd: workDir,
          stdio: "pipe",
          timeout: 300000, // 5 minute timeout for FFmpeg
        })
      } catch (ffmpegError) {
        logger.error("FFmpeg compilation failed", {
          error: ffmpegError instanceof Error ? ffmpegError.message : "Unknown error",
        })
        throw new Error("Video compilation failed - FFmpeg error")
      }

      if (!existsSync(outputPath)) {
        throw new Error("FFmpeg did not produce output file")
      }

      // Step 4: Upload compiled video
      metadata.set("status", {
        step: "uploading",
        label: "Uploading final video…",
        progress: 80,
      } satisfies CompileVideoStatus)

      const outputBuffer = readFileSync(outputPath)
      const finalVideoPath = getVideoPath(
        videoProject.workspaceId,
        videoProjectId,
        "final.mp4"
      )

      const finalVideoUrl = await uploadVideo(
        new Uint8Array(outputBuffer),
        finalVideoPath,
        "video/mp4"
      )

      // Calculate total duration
      const totalDuration = completedClips.reduce(
        (sum, clip) => sum + (clip.durationSeconds ?? 5),
        0
      )

      // Update video project
      await updateVideoProject(videoProjectId, {
        status: "completed",
        finalVideoUrl,
        durationSeconds: totalDuration,
        thumbnailUrl: completedClips[0]?.sourceImageUrl, // Use first clip's source as thumbnail
      })

      // Cleanup work directory
      rmSync(workDir, { recursive: true })

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies CompileVideoStatus)

      logger.info("Video compilation completed", {
        videoProjectId,
        finalVideoUrl,
        totalDuration,
      })

      return {
        success: true,
        finalVideoUrl,
        durationSeconds: totalDuration,
      }
    } catch (error) {
      logger.error("Video compilation failed", {
        videoProjectId,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      metadata.set("status", {
        step: "failed",
        label: "Compilation failed",
        progress: 0,
      } satisfies CompileVideoStatus)

      // Update project status
      await updateVideoProject(videoProjectId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Compilation failed",
      })

      // Cleanup work directory
      if (existsSync(workDir)) {
        rmSync(workDir, { recursive: true })
      }

      throw error
    }
  },
})
