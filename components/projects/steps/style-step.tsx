"use client"

import * as React from "react"
import Image from "next/image"
import { IconCheck, IconClock } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { STYLE_TEMPLATES, type StyleTemplate } from "@/lib/style-templates"

interface StyleStepProps {
  selectedTemplate: StyleTemplate | null
  onSelectTemplate: (template: StyleTemplate) => void
}

export function StyleStep({ selectedTemplate, onSelectTemplate }: StyleStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Choose a style to apply to your photos. Each style uses AI to transform your images.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STYLE_TEMPLATES.map((template, index) => {
          const isSelected = selectedTemplate?.id === template.id
          const isComingSoon = template.comingSoon

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => !isComingSoon && onSelectTemplate(template)}
              disabled={isComingSoon}
              className={cn(
                "animate-fade-in-up group relative flex flex-col overflow-hidden rounded-xl text-left ring-2 transition-all duration-200",
                isComingSoon
                  ? "cursor-not-allowed opacity-60 ring-transparent"
                  : isSelected
                    ? "ring-[var(--accent-teal)] shadow-lg"
                    : "ring-transparent hover:ring-foreground/10"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-300",
                    isComingSoon
                      ? "grayscale"
                      : isSelected
                        ? "scale-105"
                        : "group-hover:scale-105"
                  )}
                  sizes="(max-width: 640px) 50vw, 33vw"
                />

                {/* Selected checkmark */}
                {isSelected && !isComingSoon && (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-teal)] shadow-md">
                    <IconCheck className="h-4 w-4 text-white" />
                  </div>
                )}

                {/* Coming Soon badge */}
                {isComingSoon && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    <IconClock className="h-3 w-3" />
                    Soon
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Category badge */}
                {!isComingSoon && (
                  <div className="absolute bottom-2 left-2">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                      {template.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-1 p-3">
                <h3 className={cn(
                  "font-semibold leading-tight",
                  isComingSoon ? "text-muted-foreground" : "text-foreground"
                )}>
                  {template.name}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {template.description}
                </p>
              </div>

              {/* Selected border indicator */}
              {isSelected && !isComingSoon && (
                <div
                  className="absolute inset-0 rounded-xl ring-2 ring-inset"
                  style={{ borderColor: "var(--accent-teal)" }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
