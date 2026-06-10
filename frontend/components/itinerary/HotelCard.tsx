"use client";

import { ExternalLink, Star } from "lucide-react";
import type { Hotel } from "@/types";

interface HotelCardProps {
  hotel: Hotel;
  onClick: (hotel: Hotel) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200"
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

export default function HotelCard({ hotel, onClick }: HotelCardProps) {
  const bookingUrl = hotel.website || hotel.google_url || "";

  return (
    <div
      onClick={() => onClick(hotel)}
      className="w-full text-left bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 cursor-pointer p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="font-semibold text-gray-900 text-sm leading-snug">{hotel.name}</h4>
        <span className="text-xs font-bold text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full">
          ★ {hotel.rating}
        </span>
      </div>

      <StarRating rating={hotel.rating} />

      {hotel.address && (
        <p className="text-xs text-gray-400 mt-1.5 truncate">{hotel.address}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm font-semibold text-emerald-600">
          PKR {hotel.pricePerNight.toLocaleString()}
          <span className="text-xs font-normal text-gray-400"> / night</span>
        </p>
        {bookingUrl ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            Book
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg"
          >
            View Details
          </span>
        )}
      </div>
    </div>
  );
}
