"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconPhoto,
  IconHome,
  IconMusic,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconMovie,
  IconLoader2,
  IconSparkles,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useVideoCreation, type VideoCreationStep } from "@/hooks/use-video-creation"
import { createVideoProject, triggerVideoGeneration } from "@/lib/actions/video"
import { calculateVideoCost, formatVideoCost } from "@/lib/video/video-constants"
import { SelectImagesStep } from "./steps/select-images-step"
import { AssignRoomsStep } from "./steps/assign-rooms-step"
import { SelectMusicStep } from "./steps/select-music-step"
import { ReviewStep } from "./steps/review-step"

const STEPS: { id: VideoCreationStep; label: string; icon: React.ReactNode }[] = [
  { id: "select-images", label: "Images", icon: <IconPhoto className="h-4 w-4" /> },
  { id: "assign-rooms", label: "Rooms", icon: <IconHome className="h-4 w-4" /> },
  { id: "select-music", label: "Music", icon: <IconMusic className="h-4 w-4" /> },
  { id: "review", label: "Review", icon: <IconCheck className="h-4 w-4" /> },
]

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS
  currentStep: VideoCreationStep
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = index < currentIndex

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 py-2 text-sm font-medium transition-all duration-300",
                isActive && "bg-[var(--accent-teal)]/15 text-[var(--accent-teal)] shadow-sm shadow-[var(--accent-teal)]/10",
                isCompleted && "text-[var(--accent-teal)]",
                !isActive && !isCompleted && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  isActive && "bg-[var(--accent-teal)] text-white shadow-lg shadow-[var(--accent-teal)]/30",
                  isCompleted && "bg-[var(--accent-teal)] text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <IconCheck className="h-3.5 w-3.5" /> : step.icon}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10 transition-all duration-300",
                  index < currentIndex
                    ? "bg-gradient-to-r from-[var(--accent-teal)] to-[var(--accent-teal)]/50"
                    : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const stepTitles: Record<VideoCreationStep, { title: string; description: string }> = {
  "select-images": {
    title: "Select Images",
    description: "Choose the images for your property video",
  },
  "assign-rooms": {
    title: "Assign Rooms",
    description: "Label each image with its room type and arrange the sequence",
  },
  "select-music": {
    title: "Background Music",
    description: "Add the perfect soundtrack to your property tour",
  },
  review: {
    title: "Review & Generate",
    description: "Finalize your video settings and start generation",
  },
}

export function VideoCreationWizard() {
  const router = useRouter()
  const creation = useVideoCreation()

  const handleSubmit = React.useCallback(async () => {
    if (!creation.canProceed()) return

    creation.setIsSubmitting(true)

    try {
      // Create the video project
      const result = await createVideoProject({
        name: creation.projectName,
        aspectRatio: creation.aspectRatio,
        musicTrackId: creation.selectedMusicTrack?.id ?? null,
        musicVolume: creation.musicVolume,
        clips: creation.images.map((img) => ({
          sourceImageUrl: img.url,
          imageGenerationId: img.imageGenerationId ?? null,
          roomType: img.roomType,
          roomLabel: img.roomLabel || null,
          sequenceOrder: img.sequenceOrder,
        })),
      })

      if (!result.success) {
        throw new Error("Failed to create video project")
      }

      // Trigger video generation
      await triggerVideoGeneration(result.videoProjectId)

      toast.success("Video generation started!", {
        description: "We'll notify you when your video is ready.",
      })

      // Redirect to video detail page
      router.push(`/video/${result.videoProjectId}`)
    } catch (error) {
      console.error("Video creation error:", error)
      toast.error("Failed to create video", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
      creation.setIsSubmitting(false)
    }
  }, [creation, router])

  const currentStepInfo = stepTitles[creation.step]
  const estimatedCost = calculateVideoCost(creation.images.length)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Cinematic Header with Gradient */}
      <div className="relative border-b bg-gradient-to-b from-background via-background to-muted/30">
        {/* Decorative film strip pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, currentColor 20px, currentColor 22px)`,
        }} />

        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {/* Logo/Title */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-teal)] to-[var(--accent-teal)]/70 shadow-lg shadow-[var(--accent-teal)]/20">
              <IconMovie className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Video</h1>
              <p className="text-sm text-muted-foreground">Property Tour Generator</p>
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={creation.step} />

          {/* Step Title */}
          <div className="mt-6 text-center animate-fade-in">
            <h2 className="text-xl font-semibold">{currentStepInfo.title}</h2>
            <p className="mt-1 text-muted-foreground">{currentStepInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="animate-fade-in-up">
            {creation.step === "select-images" && (
              <SelectImagesStep
                images={creation.images}
                onAddImages={creation.addImages}
                onRemoveImage={creation.removeImage}
              />
            )}
            {creation.step === "assign-rooms" && (
              <AssignRoomsStep
                images={creation.images}
                onUpdateImage={creation.updateImage}
                onReorderImages={creation.reorderImages}
                onAutoArrange={creation.autoArrangeByRoomType}
              />
            )}
            {creation.step === "select-music" && (
              <SelectMusicStep
                selectedTrack={creation.selectedMusicTrack}
                onSelectTrack={creation.setMusicTrack}
                volume={creation.musicVolume}
                onVolumeChange={creation.setMusicVolume}
                aspectRatio={creation.aspectRatio}
                onAspectRatioChange={creation.setAspectRatio}
              />
            )}
            {creation.step === "review" && (
              <ReviewStep
                images={creation.images}
                projectName={creation.projectName}
                onProjectNameChange={creation.setProjectName}
                aspectRatio={creation.aspectRatio}
                musicTrack={creation.selectedMusicTrack}
                estimatedCost={estimatedCost}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {creation.step !== "select-images" && (
                <Button
                  variant="ghost"
                  onClick={creation.goToPreviousStep}
                  className="gap-2"
                  disabled={creation.isSubmitting}
                >
                  <IconArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {/* Cost Preview */}
              {creation.images.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--accent-amber)]/10 px-4 py-1.5 text-sm">
                  <span className="text-muted-foreground">Est. cost:</span>
                  <span className="font-semibold" style={{ color: "var(--accent-amber)" }}>
                    {formatVideoCost(estimatedCost)}
                  </span>
                  <span className="text-muted-foreground">
                    ({creation.images.length} clips)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/video")}
                disabled={creation.isSubmitting}
              >
                Cancel
              </Button>

              {creation.step === "review" ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!creation.canProceed() || creation.isSubmitting}
                  className="gap-2 min-w-[160px] shadow-lg shadow-[var(--accent-teal)]/20"
                  style={{ backgroundColor: "var(--accent-teal)" }}
                >
                  {creation.isSubmitting ? (
                    <>
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={creation.goToNextStep}
                  disabled={!creation.canProceed()}
                  className="gap-2 shadow-lg shadow-[var(--accent-teal)]/20"
                  style={{ backgroundColor: "var(--accent-teal)" }}
                >
                  Continue
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
