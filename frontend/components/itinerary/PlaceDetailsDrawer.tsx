"use client";

import Image from "next/image";
import { ImageOff, X } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { ItineraryPlace } from "@/types";

interface PlaceDetailsDrawerProps {
  place: ItineraryPlace | null;
  onClose: () => void;
}

export default function PlaceDetailsDrawer({ place, onClose }: PlaceDetailsDrawerProps) {
  const [erroredSlides, setErroredSlides] = useState<Set<number>>(new Set());

  if (!place) return null;

  const rawImages = place.images?.length ? place.images : place.image ? [place.image] : [];
  const images = rawImages.filter(Boolean);
  const hasImages = images.length > 0;

  function markError(i: number) {
    setErroredSlides((prev) => new Set(prev).add(i));
  }

  return (
    <Sheet open={place !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[420px] max-w-full p-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close place details"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Image slider */}
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {hasImages ? (
                images.map((src, i) => (
                  <div key={i} className="relative flex-shrink-0 w-full h-64 snap-start bg-gray-100">
                    {erroredSlides.has(i) ? (
                      <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                        <ImageOff className="w-8 h-8 text-gray-300" />
                        <span className="text-xs text-gray-400">Image unavailable</span>
                      </div>
                    ) : (
                      <Image
                        src={src}
                        alt={`${place.name} photo ${i + 1}`}
                        fill
                        sizes="420px"
                        className="object-cover"
                        priority={i === 0}
                        onError={() => markError(i)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full h-64 bg-gray-100 flex flex-col items-center justify-center gap-2">
                  <ImageOff className="w-10 h-10 text-gray-300" />
                  <span className="text-sm text-gray-400">No photos available</span>
                </div>
              )}
            </div>

            {/* Slide counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {images.length} photos
              </div>
            )}

            {/* Dot indicators for multiple images */}
            {images.length > 1 && images.length <= 8 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70" />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 space-y-4">
            <SheetHeader className="text-left space-y-1">
              <SheetTitle className="text-xl font-bold text-gray-900 leading-tight">
                {place.name}
              </SheetTitle>
            </SheetHeader>

            {place.description && (
              <>
                <Separator />
                <p className="text-sm text-gray-600 leading-relaxed">
                  {place.description}
                </p>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
