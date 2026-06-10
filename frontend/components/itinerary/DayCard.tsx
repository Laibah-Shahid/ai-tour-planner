"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Clock,
  ImageOff,
  MapPin,
  BedDouble,
  Compass,
  ShoppingBag,
  Utensils,
  ArrowLeftRight,
} from "lucide-react";
import HotelCard from "@/components/itinerary/HotelCard";
import PlaceDetailsDrawer from "@/components/itinerary/PlaceDetailsDrawer";
import SwapDrawer, { type SwapCategory } from "@/components/itinerary/SwapDrawer";
import type {
  Hotel,
  ItineraryDay,
  ItineraryPlace,
  AlternativeCityPool,
  AlternativeHotel,
  AlternativePlace,
} from "@/types";

function PlaceCard({ place, onClick }: { place: ItineraryPlace; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const allImages = place.images?.length ? place.images : place.image ? [place.image] : [];
  const firstImage = allImages.filter(Boolean)[0] ?? "";
  const showImage = Boolean(firstImage) && !imgError;
  const hasMultiple = allImages.filter(Boolean).length > 1;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
    >
      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {showImage ? (
          <>
            <Image
              src={firstImage}
              alt={place.name}
              fill
              sizes="80px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
            {hasMultiple && (
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                +{allImages.filter(Boolean).length - 1}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-1">
            <ImageOff className="w-4 h-4 text-gray-300" />
            <span className="text-[9px] text-gray-400 text-center leading-tight px-1">
              No image
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{place.name}</h4>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {place.description || "Tap to view details."}
        </p>
      </div>
    </button>
  );
}

function SwapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title="Replace this item"
      className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
    >
      <ArrowLeftRight className="w-3.5 h-3.5" />
    </button>
  );
}

// ── DayCard ──────────────────────────────────────────────────────────────────

interface DayCardProps {
  day: ItineraryDay;
  defaultOpen?: boolean;
  onHotelClick?: (hotel: Hotel) => void;
  editing?: boolean;
  onEditDay?: (dayId: number, field: keyof ItineraryDay, value: string) => void;
  cityPool?: AlternativeCityPool | null;
  onSwapItem?: (
    dayId: number,
    category: SwapCategory,
    index: number,
    item: AlternativePlace | AlternativeHotel
  ) => void;
}

export default function DayCard({
  day,
  defaultOpen = false,
  onHotelClick,
  editing = false,
  onEditDay,
  cityPool,
  onSwapItem,
}: DayCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedPlace, setSelectedPlace] = useState<ItineraryPlace | null>(null);
  const [swapCategory, setSwapCategory] = useState<SwapCategory | null>(null);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);

  const hasImage = day.image && day.image.length > 0;
  const foodItems = (day as ItineraryDay & { food?: { name: string }[] }).food || [];

  function openSwap(category: SwapCategory, index: number) {
    setSwapCategory(category);
    setSwapIndex(index);
  }

  function closeSwap() {
    setSwapCategory(null);
    setSwapIndex(null);
  }

  function handleSelect(
    category: SwapCategory,
    index: number,
    item: AlternativePlace | AlternativeHotel
  ) {
    onSwapItem?.(day.id, category, index, item);
    closeSwap();
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Clickable header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/80 transition-colors text-left"
          aria-expanded={isOpen}
        >
          {hasImage && (
            <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={day.image} alt={day.title} fill sizes="80px" className="object-cover" />
            </div>
          )}

          <div className="flex-grow min-w-0">
            {editing ? (
              <input
                type="text"
                value={day.title}
                onChange={(e) => onEditDay?.(day.id, "title", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-base md:text-lg font-bold text-gray-900 leading-snug bg-blue-50 border border-blue-200 rounded px-2 py-1 w-full"
              />
            ) : (
              <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug">{day.title}</h3>
            )}
            {editing ? (
              <input
                type="text"
                value={day.tagline}
                onChange={(e) => onEditDay?.(day.id, "tagline", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-emerald-600 italic mt-0.5 bg-blue-50 border border-blue-200 rounded px-2 py-1 w-full"
              />
            ) : (
              <p className="text-sm text-emerald-600 italic mt-0.5">{day.tagline}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {day.date && (
                <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                  <Calendar className="w-3 h-3" />
                  {new Date(day.date + "T00:00:00").toLocaleDateString("en-PK", {
                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              )}
              {day.durationHours > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {day.durationHours} hrs
                </span>
              )}
              {day.distanceKm > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {day.distanceKm} km
                </span>
              )}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 text-gray-400"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 px-5 pb-6 pt-5 space-y-7">

                {/* Places to Visit */}
                {day.places.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      <Compass className="w-4 h-4 text-emerald-500" />
                      Places to Visit
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {day.places.map((place, i) => (
                        <div key={i} className="relative group">
                          <PlaceCard place={place} onClick={() => setSelectedPlace(place)} />
                          {editing && (
                            <div className="absolute top-2 right-2">
                              <SwapButton onClick={() => openSwap("places", i)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Spots */}
                {foodItems.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      <Utensils className="w-4 h-4 text-emerald-500" />
                      Food Spots
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {foodItems.map((item: { name: string; description?: string }, i: number) => (
                        <div key={i} className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2">
                          <p className="text-sm font-medium text-orange-800">{item.name}</p>
                          {editing && (
                            <SwapButton onClick={() => openSwap("food", i)} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Stays */}
                {day.hotels.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      <BedDouble className="w-4 h-4 text-emerald-500" />
                      Suggested Stays
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {day.hotels.map((hotel, i) => (
                        <div key={i} className="relative">
                          <HotelCard hotel={hotel} onClick={onHotelClick ?? (() => {})} />
                          {editing && (
                            <div className="absolute top-2 right-2">
                              <SwapButton onClick={() => openSwap("hotels", i)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Souvenir Suggestions */}
                {day.souvenirs.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      <ShoppingBag className="w-4 h-4 text-emerald-500" />
                      Souvenir Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {day.souvenirs.map((souvenir, i) => (
                        <div key={i} className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
                          <div>
                            <p className="text-sm font-medium text-emerald-800">{souvenir.name}</p>
                            {souvenir.description && (
                              <p className="text-xs text-emerald-600 mt-0.5">{souvenir.description}</p>
                            )}
                          </div>
                          {editing && (
                            <SwapButton onClick={() => openSwap("souvenirs", i)} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Place Details Drawer */}
      <PlaceDetailsDrawer
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />

      {/* Swap Drawer */}
      <SwapDrawer
        open={swapCategory !== null}
        category={swapCategory}
        itemIndex={swapIndex}
        cityPool={cityPool ?? null}
        onSelect={handleSelect}
        onClose={closeSwap}
      />
    </>
  );
}
