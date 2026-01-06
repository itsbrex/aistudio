import type { VideoRoomType } from "@/lib/db/schema"

/**
 * Room type definitions and sequencing logic for property tour videos
 */

// Room type display configuration
export const VIDEO_ROOM_TYPES: Array<{
  id: VideoRoomType
  label: string
  icon: string
  order: number
}> = [
  { id: "exterior-front", label: "Exterior (Front)", icon: "IconBuildingSkyscraper", order: 1 },
  { id: "entryway", label: "Entryway", icon: "IconDoor", order: 2 },
  { id: "living-room", label: "Living Room", icon: "IconSofa", order: 3 },
  { id: "kitchen", label: "Kitchen", icon: "IconToolsKitchen2", order: 4 },
  { id: "dining-room", label: "Dining Room", icon: "IconArmchair", order: 5 },
  { id: "bedroom", label: "Bedroom", icon: "IconBed", order: 6 },
  { id: "bathroom", label: "Bathroom", icon: "IconBath", order: 7 },
  { id: "office", label: "Office", icon: "IconDesk", order: 8 },
  { id: "exterior-back", label: "Exterior (Back)", icon: "IconTree", order: 9 },
  { id: "other", label: "Other", icon: "IconPhoto", order: 10 },
]

// Room sequence order for property tours
export const ROOM_SEQUENCE_ORDER: Record<VideoRoomType, number> = {
  "exterior-front": 1,
  entryway: 2,
  "living-room": 3,
  kitchen: 4,
  "dining-room": 5,
  bedroom: 6,
  bathroom: 7,
  office: 8,
  "exterior-back": 9,
  other: 10,
}

// Get room type config by ID
export function getRoomTypeConfig(roomType: VideoRoomType) {
  return VIDEO_ROOM_TYPES.find((rt) => rt.id === roomType)
}

// Get room type label
export function getRoomTypeLabel(roomType: VideoRoomType): string {
  return getRoomTypeConfig(roomType)?.label ?? roomType
}

// Sort clips by room type sequence order
export interface ClipWithRoom {
  id: string
  roomType: VideoRoomType
  sequenceOrder: number
  [key: string]: unknown
}

export function autoSequenceClips<T extends ClipWithRoom>(clips: T[]): T[] {
  return [...clips].sort((a, b) => {
    const orderA = ROOM_SEQUENCE_ORDER[a.roomType] ?? 100
    const orderB = ROOM_SEQUENCE_ORDER[b.roomType] ?? 100

    // Primary sort: by room type order
    if (orderA !== orderB) {
      return orderA - orderB
    }

    // Secondary sort: by original sequence order (for same room types)
    return a.sequenceOrder - b.sequenceOrder
  })
}

// Update sequence orders after auto-sorting
export function reindexSequenceOrders<T extends ClipWithRoom>(clips: T[]): T[] {
  return clips.map((clip, index) => ({
    ...clip,
    sequenceOrder: index + 1,
  }))
}

// Get room type from common image project room types
export function mapProjectRoomType(projectRoomType: string | null): VideoRoomType {
  const mapping: Record<string, VideoRoomType> = {
    "living-room": "living-room",
    bedroom: "bedroom",
    kitchen: "kitchen",
    bathroom: "bathroom",
    "dining-room": "dining-room",
    office: "office",
  }
  return mapping[projectRoomType ?? ""] ?? "other"
}
