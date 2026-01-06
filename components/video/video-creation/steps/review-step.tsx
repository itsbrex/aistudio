"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconMovie,
  IconMusic,
  IconClock,
  IconCurrencyDollar,
  IconPhoto,
  IconAspectRatio,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VIDEO_ROOM_TYPES } from "@/lib/video/room-sequence"
import { formatVideoCost } from "@/lib/video/video-constants"
import type { VideoImageItem } from "@/hooks/use-video-creation"
import type { MusicTrack, VideoAspectRatio } from "@/lib/db/schema"

interface ReviewStepProps {
  images: VideoImageItem[]
  projectName: string
  onProjectNameChange: (name: string) => void
  aspectRatio: VideoAspectRatio
  musicTrack: MusicTrack | null
  estimatedCost: number
}

export function ReviewStep({
  images,
  projectName,
  onProjectNameChange,
  aspectRatio,
  musicTrack,
  estimatedCost,
}: ReviewStepProps) {
  const totalDuration = images.length * 5

  return (
    <div className="space-y-8">
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="project-name" className="text-base font-medium">
          Video Name
        </Label>
        <Input
          id="project-name"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="e.g., 123 Main Street Property Tour"
          className="text-lg h-12"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-gradient-to-br from-background to-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconPhoto className="h-4 w-4" />
            <span className="text-sm">Clips</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{images.length}</div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-background to-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconClock className="h-4 w-4" />
            <span className="text-sm">Duration</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{totalDuration}s</div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-background to-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconAspectRatio className="h-4 w-4" />
            <span className="text-sm">Aspect</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{aspectRatio}</div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-[var(--accent-amber)]/5 to-[var(--accent-amber)]/10 p-4">
          <div className="flex items-center gap-2 text-[var(--accent-amber)]">
            <IconCurrencyDollar className="h-4 w-4" />
            <span className="text-sm">Est. Cost</span>
          </div>
          <div className="mt-2 text-2xl font-bold" style={{ color: "var(--accent-amber)" }}>
            {formatVideoCost(estimatedCost)}
          </div>
        </div>
      </div>

      {/* Music Info */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            musicTrack ? "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]" : "bg-muted text-muted-foreground"
          )}>
            <IconMusic className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">
              {musicTrack ? musicTrack.name : "No Background Music"}
            </div>
            <div className="text-sm text-muted-foreground">
              {musicTrack ? `${musicTrack.artist} • ${musicTrack.category}` : "Video will have no audio"}
            </div>
          </div>
        </div>
      </div>

      {/* Clip Sequence Preview */}
      <div>
        <h4 className="mb-4 flex items-center gap-2 font-medium">
          <IconMovie className="h-4 w-4" />
          Video Sequence
        </h4>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[var(--accent-teal)] via-[var(--accent-teal)]/50 to-transparent" />

          <div className="space-y-3">
            {images.map((image, index) => {
              const roomConfig = VIDEO_ROOM_TYPES.find((r) => r.id === image.roomType)
              return (
                <div
                  key={image.id}
                  className="flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-teal)] text-sm font-bold text-white shadow-lg shadow-[var(--accent-teal)]/20">
                      {index + 1}
                    </div>
                  </div>

                  {/* Clip Card */}
                  <div className="flex flex-1 items-center gap-4 rounded-xl border bg-card p-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image.url}
                        alt={`Clip ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {image.roomLabel || roomConfig?.label || "Unknown Room"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {roomConfig?.label} • 5 seconds
                      </div>
                    </div>
                    <div className="shrink-0 text-sm text-muted-foreground font-mono">
                      {index * 5}s – {(index + 1) * 5}s
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <h4 className="mb-3 font-medium">Cost Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Video Clips ({images.length} × $0.35)</span>
            <span className="font-medium">{formatVideoCost(images.length * 0.35)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Video Compilation</span>
            <span className="font-medium text-[var(--accent-green)]">Free</span>
          </div>
          <div className="my-2 border-t" />
          <div className="flex justify-between text-base">
            <span className="font-medium">Total Estimated</span>
            <span className="font-bold" style={{ color: "var(--accent-amber)" }}>
              {formatVideoCost(estimatedCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
