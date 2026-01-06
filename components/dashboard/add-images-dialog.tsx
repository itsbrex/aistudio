"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useImageUpload } from "@/hooks/use-image-upload"
import { ROOM_TYPES } from "@/lib/style-templates"

interface UploadedImage {
  id: string
  file: File
  preview: string
  name: string
  roomType: string | null
}

interface AddImagesDialogProps {
  projectId: string
  projectName: string
  currentImageCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddImagesDialog({
  projectId,
  projectName,
  currentImageCount,
  open,
  onOpenChange,
}: AddImagesDialogProps) {
  const router = useRouter()
  const imageUpload = useImageUpload()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const maxImages = 10 - currentImageCount
  const canAddMore = images.length < maxImages

  const handleReset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    imageUpload.reset()
    setIsSubmitting(false)
  }, [images, imageUpload])

  const handleClose = useCallback(() => {
    handleReset()
    onOpenChange(false)
  }, [handleReset, onOpenChange])

  const addImages = useCallback((files: File[]) => {
    const remaining = maxImages - images.length
    const filesToAdd = files.slice(0, remaining)

    const newImages: UploadedImage[] = filesToAdd.map((file, index) => ({
      id: `img_${Date.now()}_${index}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      roomType: null,
    }))

    setImages((prev) => [...prev, ...newImages])
  }, [images.length, maxImages])

  const updateImageRoomType = useCallback((id: string, roomType: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, roomType } : img
      )
    )
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      )
      if (files.length > 0) {
        addImages(files)
      }
    },
    [addImages]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        addImages(files)
      }
      e.target.value = ""
    },
    [addImages]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleSubmit = useCallback(async () => {
    if (images.length === 0) return

    setIsSubmitting(true)

    try {
      const files = images.map((img) => img.file)
      const roomTypes = images.map((img) => img.roomType)
      const uploadSuccess = await imageUpload.uploadImages(projectId, files, roomTypes)

      if (uploadSuccess) {
        handleReset()
        onOpenChange(false)
        router.refresh()
      } else {
        console.error("Failed to upload images:", imageUpload.error)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setIsSubmitting(false)
    }
  }, [images, projectId, imageUpload, handleReset, onOpenChange, router])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="flex max-h-[80vh] flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle>Add More Images</DialogTitle>
            <DialogDescription>
              Add images to &ldquo;{projectName}&rdquo; ({currentImageCount}/10 images used)
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {maxImages <= 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconPhoto className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">
                This project has reached the maximum of 10 images.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all duration-200",
                  isDragging
                    ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5"
                    : "border-foreground/10 bg-muted/30 hover:border-foreground/20 hover:bg-muted/50"
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                    isDragging ? "scale-110" : ""
                  )}
                  style={{
                    backgroundColor: isDragging
                      ? "var(--accent-teal)"
                      : "color-mix(in oklch, var(--accent-teal) 15%, transparent)",
                  }}
                >
                  <IconUpload
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isDragging ? "text-white" : ""
                    )}
                    style={{ color: isDragging ? undefined : "var(--accent-teal)" }}
                  />
                </div>

                <div className="text-center">
                  <p className="font-medium text-foreground">
                    {isDragging ? "Drop your images here" : "Drag & drop images"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    or click to browse • Up to {maxImages} more image{maxImages !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Image preview grid */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {images.length} image{images.length !== 1 ? "s" : ""} selected
                    </p>
                    {canAddMore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClick}
                        className="gap-1.5 text-xs"
                      >
                        <IconPhoto className="h-3.5 w-3.5" />
                        Add more
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="animate-fade-in-up group relative overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Image preview */}
                        <div className="relative aspect-square">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />

                          {/* Remove button */}
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(image.id)
                            }}
                            className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Room type dropdown */}
                        <div className="p-2">
                          <Select
                            value={image.roomType || ""}
                            onValueChange={(value) => updateImageRoomType(image.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_TYPES.map((room) => (
                                <SelectItem key={room.id} value={room.id} className="text-xs">
                                  {room.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={images.length === 0 || isSubmitting}
            className="gap-2 min-w-[120px]"
            style={{ backgroundColor: "var(--accent-teal)" }}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <IconSparkles className="h-4 w-4" />
                Add & Process
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
