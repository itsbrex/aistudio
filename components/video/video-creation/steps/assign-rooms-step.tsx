"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconGripVertical,
  IconWand,
  IconChevronDown,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VIDEO_ROOM_TYPES } from "@/lib/video/room-sequence"
import type { VideoImageItem } from "@/hooks/use-video-creation"
import type { VideoRoomType } from "@/lib/db/schema"

interface AssignRoomsStepProps {
  images: VideoImageItem[]
  onUpdateImage: (id: string, updates: Partial<Omit<VideoImageItem, "id" | "url">>) => void
  onReorderImages: (fromIndex: number, toIndex: number) => void
  onAutoArrange: () => void
}

export function AssignRoomsStep({
  images,
  onUpdateImage,
  onReorderImages,
  onAutoArrange,
}: AssignRoomsStepProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorderImages(draggedIndex, dragOverIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{images.length}</span> clips in sequence
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAutoArrange}
          className="gap-2"
        >
          <IconWand className="h-4 w-4" />
          Auto-arrange by room type
        </Button>
      </div>

      {/* Image List */}
      <div className="space-y-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group flex items-center gap-4 rounded-xl border bg-card p-3 transition-all duration-200",
              "hover:border-[var(--accent-teal)]/30 hover:shadow-md",
              draggedIndex === index && "opacity-50 scale-[0.98]",
              dragOverIndex === index && "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Drag Handle */}
            <div className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
              <IconGripVertical className="h-5 w-5" />
            </div>

            {/* Sequence Number */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
              {index + 1}
            </div>

            {/* Image Thumbnail */}
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={image.url}
                alt={`Clip ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            {/* Room Type Selector */}
            <div className="flex flex-1 items-center gap-3">
              <div className="relative min-w-[180px]">
                <select
                  value={image.roomType}
                  onChange={(e) => onUpdateImage(image.id, { roomType: e.target.value as VideoRoomType })}
                  className={cn(
                    "w-full appearance-none rounded-lg border bg-background px-3 py-2 pr-10 text-sm",
                    "focus:border-[var(--accent-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)]/20"
                  )}
                >
                  {VIDEO_ROOM_TYPES.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.label}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Custom Label */}
              <Input
                value={image.roomLabel}
                onChange={(e) => onUpdateImage(image.id, { roomLabel: e.target.value })}
                placeholder="Custom label (optional)"
                className="max-w-[200px] text-sm"
              />
            </div>

            {/* Duration Badge */}
            <div className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              5 sec
            </div>
          </div>
        ))}
      </div>

      {/* Sequence Preview */}
      <div className="mt-8 rounded-xl border bg-muted/30 p-4">
        <h4 className="mb-3 text-sm font-medium">Sequence Preview</h4>
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => {
            const roomConfig = VIDEO_ROOM_TYPES.find((r) => r.id === image.roomType)
            return (
              <div
                key={image.id}
                className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm"
              >
                <span className="text-muted-foreground">{index + 1}.</span>
                <span>{image.roomLabel || roomConfig?.label || "Unknown"}</span>
                {index < images.length - 1 && (
                  <span className="ml-1 text-muted-foreground">→</span>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Total duration: {images.length * 5} seconds ({images.length} clips × 5 sec)
        </p>
      </div>
    </div>
  )
}
