"use client";

import { ExternalLink, MapPin, Maximize2, BedDouble, Star, X } from "lucide-react";
import { AMENITY_CONFIG } from "@/data/amenities";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Hotel } from "@/types";

interface HotelDetailsDrawerProps {
  selectedHotel: Hotel | null;
  setSelectedHotel: (hotel: Hotel | null) => void;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
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

export default function HotelDetailsDrawer({
  selectedHotel,
  setSelectedHotel,
}: HotelDetailsDrawerProps) {
  const hotel = selectedHotel;
  const bookingUrl = hotel?.website || hotel?.google_url || "";
  const encodedName = hotel ? encodeURIComponent(hotel.name) : "";
  const bookingComUrl = `https://www.booking.com/search.html?ss=${encodedName}`;
  const agodaUrl = `https://www.agoda.com/search?searchText=${encodedName}`;

  return (
    <Sheet open={hotel !== null} onOpenChange={(open) => !open && setSelectedHotel(null)}>
      <SheetContent
        side="right"
        className="w-[420px] max-w-full p-0 flex flex-col gap-0 overflow-hidden"
      >
        {hotel && (
          <>
            {/* Custom close button */}
            <button
              type="button"
              aria-label="Close hotel details"
              onClick={() => setSelectedHotel(null)}
              className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-5 space-y-5">
                {/* Hotel Header */}
                <SheetHeader className="space-y-2 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <SheetTitle className="text-xl font-bold text-gray-900 leading-tight">
                      {hotel.name}
                    </SheetTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">
                      ★ {hotel.rating}
                    </Badge>
                  </div>

                  {/* Lodging type badge */}
                  {hotel.lodging_type && (
                    <Badge variant="outline" className="w-fit text-gray-600 border-gray-200 bg-gray-50">
                      {hotel.lodging_type}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3">
                    <StarRating rating={hotel.rating} size="md" />
                    {hotel.num_reviews ? (
                      <span className="text-xs text-gray-400">({hotel.num_reviews.toLocaleString()} reviews)</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{hotel.address || "Address not available"}</span>
                  </div>
                  <p className="text-base font-bold text-emerald-600">
                    {hotel.pricePerNight > 0
                      ? <>PKR {hotel.pricePerNight.toLocaleString()}<span className="text-sm font-normal text-gray-400"> / night</span></>
                      : <span className="text-sm font-normal text-gray-400">Price not available</span>
                    }
                  </p>
                </SheetHeader>

                <Separator />

                {/* Available Rooms */}
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

                {/* Guest Reviews */}
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

            {/* Footer — Booking links */}
            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {bookingUrl ? (
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm font-semibold rounded-xl gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Book Now{hotel.pricePerNight > 0 ? ` — PKR ${hotel.pricePerNight.toLocaleString()} / night` : ""}
                  </Button>
                </a>
              ) : null}

              {/* Permanent booking site links */}
              <div className="flex gap-2">
                <a
                  href={bookingComUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Booking.com
                  </Button>
                </a>
                <a
                  href={agodaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Agoda
                  </Button>
                </a>
              </div>

              {hotel.google_url && (
                <a
                  href={hotel.google_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  View on Google Maps
                </a>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
