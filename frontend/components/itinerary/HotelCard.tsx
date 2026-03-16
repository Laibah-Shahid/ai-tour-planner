"use client";

import Image from "next/image";
import { Star } from "lucide-react";
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
  return (
    <button
      onClick={() => onClick(hotel)}
      className="w-full text-left bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 group"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-emerald-700">
          View Details
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
          {hotel.name}
        </h4>
        <StarRating rating={hotel.rating} />
        <p className="text-xs text-gray-500 mt-1 mb-2 truncate">
          {hotel.address}
        </p>
        <p className="text-sm font-semibold text-emerald-600">
          PKR {hotel.pricePerNight.toLocaleString()}
          <span className="text-xs font-normal text-gray-400"> / night</span>
        </p>
      </div>
    </button>
  );
}
