"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";

interface TouristSpotCardProps {
  name: string;
  image: string;
  description: string;
  rating: number;
  location: string;
}

export default function TouristSpotCard({
  name,
  image,
  description,
  rating,
  location,
}: TouristSpotCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
        transition: { type: "spring", stiffness: 200, damping: 15 },
      }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full min-h-[420px]"
    >
      <div className="relative h-60 w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-t-2xl"
          />
        </motion.div>
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-red-500" />
            {location}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
