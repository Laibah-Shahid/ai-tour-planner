"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  quote: string;
}

export default function TestimonialCard({
  name,
  role,
  image,
  quote,
}: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 200 } }}
      className="bg-white rounded-3xl shadow-md p-8 flex flex-col justify-between relative overflow-hidden min-h-[300px] md:min-h-[280px] lg:min-h-[280px]"
    >
      <Quote className="w-8 h-8 text-emerald-500 mb-4 flex-shrink-0" />

      <p className="text-gray-700 italic leading-relaxed mb-6 flex-grow line-clamp-6">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center mt-auto">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-emerald-400 flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
