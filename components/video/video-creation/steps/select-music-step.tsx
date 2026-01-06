"use client"

import * as React from "react"
import {
  IconMusic,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconVolumeOff,
  IconCheck,
  IconAspectRatio,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MUSIC_CATEGORIES, VIDEO_ASPECT_RATIOS } from "@/lib/video/video-constants"
import type { MusicTrack, VideoAspectRatio } from "@/lib/db/schema"

interface SelectMusicStepProps {
  selectedTrack: MusicTrack | null
  onSelectTrack: (track: MusicTrack | null) => void
  volume: number
  onVolumeChange: (volume: number) => void
  aspectRatio: VideoAspectRatio
  onAspectRatioChange: (ratio: VideoAspectRatio) => void
}

// Mock music tracks - in production, these would come from the database
const MOCK_TRACKS: MusicTrack[] = [
  {
    id: "1",
    name: "Elegant Home",
    artist: "Ambient Studios",
    category: "modern",
    mood: "professional",
    audioUrl: "/audio/elegant-home.mp3",
    durationSeconds: 180,
    bpm: 90,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Luxury Living",
    artist: "Cinema Sounds",
    category: "cinematic",
    mood: "elegant",
    audioUrl: "/audio/luxury-living.mp3",
    durationSeconds: 240,
    bpm: 75,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Sunny Spaces",
    artist: "Mood Music",
    category: "upbeat",
    mood: "energetic",
    audioUrl: "/audio/sunny-spaces.mp3",
    durationSeconds: 150,
    bpm: 120,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Peaceful Retreat",
    artist: "Ambient Studios",
    category: "calm",
    mood: "relaxing",
    audioUrl: "/audio/peaceful-retreat.mp3",
    durationSeconds: 200,
    bpm: 60,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Classical Elegance",
    artist: "Orchestra Collection",
    category: "classical",
    mood: "warm",
    audioUrl: "/audio/classical-elegance.mp3",
    durationSeconds: 220,
    bpm: 85,
    previewUrl: null,
    waveformUrl: null,
    licenseType: "royalty-free",
    attribution: null,
    isActive: true,
    createdAt: new Date(),
  },
]

export function SelectMusicStep({
  selectedTrack,
  onSelectTrack,
  volume,
  onVolumeChange,
  aspectRatio,
  onAspectRatioChange,
}: SelectMusicStepProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [playingId, setPlayingId] = React.useState<string | null>(null)

  const filteredTracks = activeCategory === "all"
    ? MOCK_TRACKS
    : MOCK_TRACKS.filter((t) => t.category === activeCategory)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      {/* Aspect Ratio Selection */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <IconAspectRatio className="h-4 w-4" />
          Video Aspect Ratio
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {VIDEO_ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              type="button"
              onClick={() => onAspectRatioChange(ratio.id as VideoAspectRatio)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                aspectRatio === ratio.id
                  ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Aspect Ratio Visual */}
              <div
                className={cn(
                  "rounded border-2 transition-colors",
                  aspectRatio === ratio.id ? "border-[var(--accent-teal)]" : "border-muted-foreground/30"
                )}
                style={{
                  width: ratio.id === "16:9" ? 48 : ratio.id === "9:16" ? 27 : 36,
                  height: ratio.id === "16:9" ? 27 : ratio.id === "9:16" ? 48 : 36,
                }}
              />
              <div className="text-center">
                <div className="text-sm font-medium">{ratio.label}</div>
                <div className="text-xs text-muted-foreground">{ratio.description}</div>
              </div>
              {aspectRatio === ratio.id && (
                <IconCheck className="h-4 w-4 text-[var(--accent-teal)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Music Selection */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <IconMusic className="h-4 w-4" />
          Background Music
          <span className="text-muted-foreground font-normal">(optional)</span>
        </h3>

        {/* Category Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "bg-[var(--accent-teal)] text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {MUSIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-[var(--accent-teal)] text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* No Music Option */}
        <button
          type="button"
          onClick={() => onSelectTrack(null)}
          className={cn(
            "mb-4 flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200",
            selectedTrack === null
              ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5"
              : "border-transparent bg-muted/50 hover:bg-muted"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <IconVolumeOff className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">No Music</div>
            <div className="text-sm text-muted-foreground">Video will have no background audio</div>
          </div>
          {selectedTrack === null && (
            <IconCheck className="h-5 w-5 text-[var(--accent-teal)]" />
          )}
        </button>

        {/* Track List */}
        <div className="space-y-2">
          {filteredTracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => onSelectTrack(track)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200",
                selectedTrack?.id === track.id
                  ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              )}
            >
              {/* Play Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPlayingId(playingId === track.id ? null : track.id)
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/20"
              >
                {playingId === track.id ? (
                  <IconPlayerPause className="h-5 w-5" />
                ) : (
                  <IconPlayerPlay className="h-5 w-5 ml-0.5" />
                )}
              </button>

              {/* Track Info */}
              <div className="flex-1 text-left">
                <div className="font-medium">{track.name}</div>
                <div className="text-sm text-muted-foreground">
                  {track.artist} • {formatDuration(track.durationSeconds)} • {track.bpm} BPM
                </div>
              </div>

              {/* Category Badge */}
              <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
                {track.category}
              </div>

              {selectedTrack?.id === track.id && (
                <IconCheck className="h-5 w-5 text-[var(--accent-teal)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      {selectedTrack && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <IconVolume className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <Slider
                value={[volume]}
                onValueChange={([v]) => onVolumeChange(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            <span className="w-12 text-right text-sm font-medium">{volume}%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Adjust the background music volume relative to the video
          </p>
        </div>
      )}
    </div>
  )
}
