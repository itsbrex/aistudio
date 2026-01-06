import type { VideoRoomType } from "@/lib/db/schema"

/**
 * Default motion prompts for Kling Video generation
 * These prompts describe camera movements and visual style for each room type
 */

export const DEFAULT_MOTION_PROMPTS: Record<VideoRoomType, string> = {
  "exterior-front":
    "Slow cinematic pan across the front of the property, showcasing curb appeal, landscaping, and architectural details. Smooth dolly movement, professional real estate photography style.",

  entryway:
    "Gentle forward dolly shot entering through the front door, revealing the interior space. Warm welcoming atmosphere, natural lighting, smooth camera movement.",

  "living-room":
    "Slow sweeping pan across the living room, highlighting furniture arrangement, natural light through windows, and spacious layout. Elegant cinematic movement, luxury real estate style.",

  kitchen:
    "Smooth tracking shot along the kitchen counters and appliances, showcasing the workspace, cabinetry, and modern fixtures. Professional real estate photography, clean lines.",

  "dining-room":
    "Elegant orbit around the dining table, capturing the ambiance, decor, and connection to adjacent spaces. Warm lighting, sophisticated camera movement.",

  bedroom:
    "Soft pan across the bedroom, emphasizing comfort, spaciousness, and natural light. Calm, inviting atmosphere, gentle camera movement highlighting restful space.",

  bathroom:
    "Gentle reveal shot of the bathroom fixtures, finishes, and spa-like features. Clean, bright lighting, smooth professional camera movement.",

  office:
    "Professional pan across the office space, showing desk setup, natural light, and productive environment. Clean, organized, modern style.",

  "exterior-back":
    "Wide cinematic sweep of the backyard, outdoor living space, pool area, or garden. Expansive view, golden hour lighting style, showcase outdoor amenities.",

  other:
    "Smooth panning motion revealing the space and its unique features. Professional real estate photography style, natural lighting, elegant movement.",
}

// Get motion prompt for a room type
export function getMotionPrompt(roomType: VideoRoomType): string {
  return DEFAULT_MOTION_PROMPTS[roomType] ?? DEFAULT_MOTION_PROMPTS.other
}

// Generate a custom motion prompt with room-specific base + user additions
export function generateMotionPrompt(
  roomType: VideoRoomType,
  customAdditions?: string
): string {
  const basePrompt = getMotionPrompt(roomType)

  if (!customAdditions?.trim()) {
    return basePrompt
  }

  return `${basePrompt} ${customAdditions.trim()}`
}

// Common negative prompts to avoid issues
export const DEFAULT_NEGATIVE_PROMPT =
  "blurry, low resolution, distorted, shaky camera, fast movement, jerky motion, overexposed, underexposed, watermark, text overlay"

// Prompt enhancement tips for real estate videos
export const PROMPT_TIPS = [
  "Use 'slow' or 'gentle' for smooth camera movements",
  "Mention 'natural light' for daytime scenes",
  "Include 'golden hour' for warm, inviting atmosphere",
  "Add 'professional real estate' for polished look",
  "Specify 'wide angle' for spacious feel",
]
