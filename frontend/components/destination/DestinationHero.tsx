"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DestinationDetail } from "@/types";

interface DestinationHeroProps {
  destination: DestinationDetail;
}

export default function DestinationHero({ destination }: DestinationHeroProps) {
  return (
    <div className="relative h-[75vh] min-h-[520px] overflow-hidden">
      <Image
        src={destination.images[0]}
        alt={destination.name}
        fill
        priority
        sizes="100vw"
        className="object-cover scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12 md:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 uppercase tracking-widest text-xs font-semibold px-3 py-1">
              {destination.category}
            </Badge>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm border border-white/20">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold">{destination.rating}</span>
              <span className="text-white/60 text-xs">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm border border-white/20">
              <span className="text-emerald-400 text-xs">✦</span>
              <span className="text-xs font-medium">AI Recommended</span>
            </div>
          </div>

          {/* Destination name */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight tracking-tight">
            {destination.name}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-2 text-white/75 mb-4">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-base md:text-lg">
              {destination.district}, Pakistan
            </span>
          </div>

          {/* Tagline */}
          <p className="text-white/85 text-base md:text-lg max-w-2xl leading-relaxed">
            {destination.description.split(".")[0]}.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
