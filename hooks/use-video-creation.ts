"use client"

import * as React from "react"
import type { VideoRoomType, VideoAspectRatio, MusicTrack } from "@/lib/db/schema"
import { VIDEO_DEFAULTS, VIDEO_LIMITS } from "@/lib/video/video-constants"

export type VideoCreationStep = "select-images" | "assign-rooms" | "select-music" | "review"

export interface VideoImageItem {
  id: string
  url: string
  imageGenerationId?: string | null
  roomType: VideoRoomType
  roomLabel: string
  sequenceOrder: number
}

export interface VideoCreationState {
  step: VideoCreationStep
  projectName: string
  images: VideoImageItem[]
  aspectRatio: VideoAspectRatio
  selectedMusicTrack: MusicTrack | null
  musicVolume: number
  isSubmitting: boolean
}

const STEP_ORDER: VideoCreationStep[] = ["select-images", "assign-rooms", "select-music", "review"]

export function useVideoCreation() {
  const [state, setState] = React.useState<VideoCreationState>({
    step: "select-images",
    projectName: "",
    images: [],
    aspectRatio: VIDEO_DEFAULTS.ASPECT_RATIO,
    selectedMusicTrack: null,
    musicVolume: VIDEO_DEFAULTS.MUSIC_VOLUME,
    isSubmitting: false,
  })

  const setStep = React.useCallback((step: VideoCreationStep) => {
    setState((prev) => ({ ...prev, step }))
  }, [])

  const setProjectName = React.useCallback((name: string) => {
    setState((prev) => ({ ...prev, projectName: name }))
  }, [])

  const addImages = React.useCallback((newImages: Omit<VideoImageItem, "sequenceOrder">[]) => {
    setState((prev) => {
      const startOrder = prev.images.length
      const imagesWithOrder = newImages.map((img, i) => ({
        ...img,
        sequenceOrder: startOrder + i + 1,
      }))
      const combined = [...prev.images, ...imagesWithOrder]
      // Limit to max images
      return {
        ...prev,
        images: combined.slice(0, VIDEO_LIMITS.MAX_IMAGES_PER_VIDEO),
      }
    })
  }, [])

  const removeImage = React.useCallback((id: string) => {
    setState((prev) => {
      const filtered = prev.images.filter((img) => img.id !== id)
      // Re-index sequence orders
      const reindexed = filtered.map((img, i) => ({
        ...img,
        sequenceOrder: i + 1,
      }))
      return { ...prev, images: reindexed }
    })
  }, [])

  const updateImage = React.useCallback(
    (id: string, updates: Partial<Omit<VideoImageItem, "id" | "url">>) => {
      setState((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === id ? { ...img, ...updates } : img
        ),
      }))
    },
    []
  )

  const reorderImages = React.useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newImages = [...prev.images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      // Re-index sequence orders
      const reindexed = newImages.map((img, i) => ({
        ...img,
        sequenceOrder: i + 1,
      }))
      return { ...prev, images: reindexed }
    })
  }, [])

  const autoArrangeByRoomType = React.useCallback(() => {
    setState((prev) => {
      const { autoSequenceClips, reindexSequenceOrders } = require("@/lib/video/room-sequence")
      const sorted = autoSequenceClips(prev.images)
      const reindexed = reindexSequenceOrders(sorted)
      return { ...prev, images: reindexed }
    })
  }, [])

  const setAspectRatio = React.useCallback((ratio: VideoAspectRatio) => {
    setState((prev) => ({ ...prev, aspectRatio: ratio }))
  }, [])

  const setMusicTrack = React.useCallback((track: MusicTrack | null) => {
    setState((prev) => ({ ...prev, selectedMusicTrack: track }))
  }, [])

  const setMusicVolume = React.useCallback((volume: number) => {
    setState((prev) => ({ ...prev, musicVolume: Math.min(100, Math.max(0, volume)) }))
  }, [])

  const setIsSubmitting = React.useCallback((submitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting: submitting }))
  }, [])

  const goToNextStep = React.useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      if (currentIndex < STEP_ORDER.length - 1) {
        return { ...prev, step: STEP_ORDER[currentIndex + 1] }
      }
      return prev
    })
  }, [])

  const goToPreviousStep = React.useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      if (currentIndex > 0) {
        return { ...prev, step: STEP_ORDER[currentIndex - 1] }
      }
      return prev
    })
  }, [])

  const canProceed = React.useCallback(() => {
    switch (state.step) {
      case "select-images":
        return state.images.length >= VIDEO_LIMITS.MIN_IMAGES_PER_VIDEO
      case "assign-rooms":
        return state.images.every((img) => img.roomType)
      case "select-music":
        return true // Music is optional
      case "review":
        return state.projectName.trim().length > 0 && state.images.length > 0
      default:
        return false
    }
  }, [state])

  const reset = React.useCallback(() => {
    setState({
      step: "select-images",
      projectName: "",
      images: [],
      aspectRatio: VIDEO_DEFAULTS.ASPECT_RATIO,
      selectedMusicTrack: null,
      musicVolume: VIDEO_DEFAULTS.MUSIC_VOLUME,
      isSubmitting: false,
    })
  }, [])

  return {
    ...state,
    setStep,
    setProjectName,
    addImages,
    removeImage,
    updateImage,
    reorderImages,
    autoArrangeByRoomType,
    setAspectRatio,
    setMusicTrack,
    setMusicVolume,
    setIsSubmitting,
    goToNextStep,
    goToPreviousStep,
    canProceed,
    reset,
  }
}
