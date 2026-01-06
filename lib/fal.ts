import { fal } from "@fal-ai/client"

// Configure Fal.ai client with API key
fal.config({
  credentials: process.env.FAL_API_KEY!,
})

export { fal }

// Correct model endpoint for Nano Banana Pro image editing
export const NANO_BANANA_PRO_EDIT = "fal-ai/nano-banana-pro/edit"

// Input type for Nano Banana Pro edit endpoint
export interface NanoBananaProInput {
  prompt: string
  image_urls: string[] // NOTE: Array, not single string!
  num_images?: number // 1-4, default 1
  aspect_ratio?:
    | "21:9"
    | "16:9"
    | "3:2"
    | "4:3"
    | "5:4"
    | "1:1"
    | "4:5"
    | "3:4"
    | "2:3"
    | "9:16"
  resolution?: "1K" | "2K" | "4K"
  output_format?: "jpeg" | "png" | "webp"
  sync_mode?: boolean
}

// Output type for Nano Banana Pro
export interface NanoBananaProOutput {
  images: Array<{
    url: string
    file_name: string
    content_type: string
    file_size: number
    width: number
    height: number
  }>
  description?: string
}
