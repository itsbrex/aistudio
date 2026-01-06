"use client"

import { useState, useCallback } from "react"

interface UseInpaintReturn {
  inpaint: (imageId: string, maskDataUrl: string, prompt: string) => Promise<boolean>
  isProcessing: boolean
  error: string | null
  reset: () => void
}

export function useInpaint(): UseInpaintReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setIsProcessing(false)
    setError(null)
  }, [])

  const inpaint = useCallback(async (
    imageId: string,
    maskDataUrl: string,
    prompt: string
  ): Promise<boolean> => {
    if (!imageId || !maskDataUrl || !prompt) {
      setError("Missing required fields")
      return false
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          maskDataUrl,
          prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Inpainting failed")
      }

      setIsProcessing(false)
      return true
    } catch (err) {
      console.error("Inpaint error:", err)
      setError(err instanceof Error ? err.message : "Inpainting failed")
      setIsProcessing(false)
      return false
    }
  }, [])

  return {
    inpaint,
    isProcessing,
    error,
    reset,
  }
}
