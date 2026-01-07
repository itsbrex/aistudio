"use client";

import Image from "next/image";
import {
  IconMovie,
  IconMusic,
  IconClock,
  IconPhoto,
  IconAspectRatio,
  IconArrowRight,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VIDEO_ROOM_TYPES } from "@/lib/video/room-sequence";
import type { VideoImageItem } from "@/hooks/use-video-creation";
import type { MusicTrack, VideoAspectRatio } from "@/lib/db/schema";

interface ReviewStepProps {
  images: VideoImageItem[];
  projectName: string;
  onProjectNameChange: (name: string) => void;
  aspectRatio: VideoAspectRatio;
  musicTrack: MusicTrack | null;
}

export function ReviewStep({
  images,
  projectName,
  onProjectNameChange,
  aspectRatio,
  musicTrack,
}: ReviewStepProps) {
  const totalDuration = images.length * 5;

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
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-linear-to-br from-background to-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconPhoto className="h-4 w-4" />
            <span className="text-sm">Clips</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{images.length}</div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-background to-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconClock className="h-4 w-4" />
            <span className="text-sm">Duration</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{totalDuration}s</div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-background to-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconAspectRatio className="h-4 w-4" />
            <span className="text-sm">Aspect</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{aspectRatio}</div>
        </div>
      </div>

      {/* Music Info */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              musicTrack
                ? "bg-(--accent-teal)/10 text-(--accent-teal)"
                : "bg-muted text-muted-foreground",
            )}
          >
            <IconMusic className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">
              {musicTrack ? musicTrack.name : "No Background Music"}
            </div>
            <div className="text-sm text-muted-foreground">
              {musicTrack
                ? `${musicTrack.artist} • ${musicTrack.category}`
                : "Video will have no audio"}
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
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-linear-to-b from-(--accent-teal) via-(--accent-teal)/50 to-transparent" />

          <div className="space-y-3">
            {images.map((image, index) => {
              const roomConfig = VIDEO_ROOM_TYPES.find(
                (r) => r.id === image.roomType,
              );
              return (
                <div
                  key={image.id}
                  className="flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent-teal) text-sm font-bold text-white shadow-lg shadow-(--accent-teal)/20">
                      {index + 1}
                    </div>
                  </div>

                  {/* Clip Card */}
                  <div className="flex flex-1 items-center gap-4 rounded-xl border bg-card p-3">
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted flex border">
                      {image.startImageUrl &&
                      image.endImageUrl &&
                      image.startImageUrl !== image.endImageUrl ? (
                        <>
                          <div className="relative flex-1">
                            <Image
                              src={image.startImageUrl}
                              alt={`Clip ${index + 1} start`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                            <div className="absolute top-0.5 left-0.5 px-1 py-0 rounded bg-black/60 text-[7px] font-bold text-white uppercase backdrop-blur-sm z-10">Start</div>
                          </div>
                          <div className="relative flex-1 border-l border-white/20">
                            <Image
                              src={image.endImageUrl}
                              alt={`Clip ${index + 1} end`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                            <div className="absolute top-0.5 right-0.5 px-1 py-0 rounded bg-black/60 text-[7px] font-bold text-white uppercase backdrop-blur-sm z-10">End</div>
                          </div>
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-background border shadow-xs">
                             <IconArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                          </div>
                        </>
                      ) : (
                        <Image
                          src={image.url}
                          alt={`Clip ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      )}
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
