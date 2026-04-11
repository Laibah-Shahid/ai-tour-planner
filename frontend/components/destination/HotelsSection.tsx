"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, BedDouble, Maximize2, X } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AMENITY_CONFIG } from "@/data/amenities";
import type { DestinationHotel } from "@/types";

interface HotelsSectionProps {
  hotels: DestinationHotel[];
}

export default function HotelsSection({ hotels }: HotelsSectionProps) {
  const [selectedHotel, setSelectedHotel] = useState<DestinationHotel | null>(null);

  return (
    <>
      <section className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <SectionHeader
            badge="Stay"
            title="Where to Stay"
            subtitle="Handpicked accommodations that match your comfort and budget."
            className="mb-10"
            titleClassName="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
            subtitleClassName="text-gray-500 text-sm max-w-xl mx-auto"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotels.map((hotel, index) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                index={index}
                onSelect={() => setSelectedHotel(hotel)}
              />
            ))}
          </div>
        </div>
      </section>

      <HotelDrawer
        hotel={selectedHotel}
        onClose={() => setSelectedHotel(null)}
      />
    </>
  );
}

// ── Hotel Card ────────────────────────────────────────────────────────────────

interface HotelCardProps {
  hotel: DestinationHotel;
  index: number;
  onSelect: () => void;
}

function HotelCard({ hotel, index, onSelect }: HotelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-amber-600 border-amber-200 backdrop-blur-sm text-xs font-semibold gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {hotel.rating}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-white bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-emerald-600 transition-colors">
          {hotel.name}
        </h3>
        {hotel.address && (
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{hotel.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-emerald-600">
              PKR {hotel.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 ml-1">/ night</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Hotel Drawer ──────────────────────────────────────────────────────────────

interface HotelDrawerProps {
  hotel: DestinationHotel | null;
  onClose: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1 font-medium">{rating}</span>
    </div>
  );
}

function HotelDrawer({ hotel, onClose }: HotelDrawerProps) {
  const images = hotel?.images?.length ? hotel.images : hotel ? [hotel.image] : [];

  return (
    <Sheet open={hotel !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[420px] max-w-full p-0 flex flex-col gap-0 overflow-hidden"
      >
        {hotel && (
          <>
            {/* Close button */}
            <button
              type="button"
              aria-label="Close hotel details"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Scrollable area */}
            <div className="overflow-y-auto flex-1">
              {/* Photo gallery */}
              <div className="relative">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-0">
                  {images.map((src, i) => (
                    <div
                      key={i}
                      className="relative flex-shrink-0 w-full h-56 snap-start"
                    >
                      <Image
                        src={src}
                        alt={`${hotel.name} photo ${i + 1}`}
                        fill
                        sizes="420px"
                        className="object-cover"
                        priority={i === 0}
                      />
                    </div>
                  ))}
                </div>
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {images.length} photos
                  </div>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Header */}
                <SheetHeader className="space-y-2 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <SheetTitle className="text-xl font-bold text-gray-900 leading-tight">
                      {hotel.name}
                    </SheetTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">
                      ★ {hotel.rating}
                    </Badge>
                  </div>
                  <StarRating rating={hotel.rating} />
                  {hotel.address && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{hotel.address}</span>
                    </div>
                  )}
                  <p className="text-base font-bold text-emerald-600">
                    PKR {hotel.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400"> / night</span>
                  </p>
                </SheetHeader>

                <Separator />

                {/* Rooms */}
                {hotel.rooms && hotel.rooms.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Available Rooms
                    </h3>
                    <div className="space-y-3">
                      {hotel.rooms.map((room, i) => (
                        <div
                          key={i}
                          className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:border-emerald-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-semibold text-gray-900 text-sm">
                              {room.type}
                            </p>
                            <span className="text-sm font-bold text-emerald-600 shrink-0">
                              PKR {room.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                              {room.beds} {room.beds === 1 ? "Bed" : "Beds"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                              {room.size}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                          >
                            Select Room
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Amenities & Facilities
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {hotel.amenities.map((key) => {
                          const config = AMENITY_CONFIG[key];
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <div
                              key={key}
                              className="flex flex-col items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl py-3 px-2 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-[11px] text-gray-600 text-center leading-tight font-medium">
                                {config.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}

                {/* Reviews */}
                {hotel.reviews && hotel.reviews.length > 0 && (
                  <section>
                    <Separator className="mb-5" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Guest Reviews
                    </h3>
                    <div className="space-y-3">
                      {hotel.reviews.map((review, i) => (
                        <div
                          key={i}
                          className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
                        >
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                              {review.user
                                .split(" ")
                                .filter((n) => n.length > 0)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {review.user}
                              </p>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <Star
                                    key={j}
                                    className={`w-3 h-3 ${
                                      j < review.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-gray-200 fill-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm font-semibold rounded-xl">
                Book Now — PKR {hotel.price.toLocaleString()} / night
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
