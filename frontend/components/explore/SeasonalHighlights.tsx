"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { seasonalHighlights } from "@/data/destinations";

export default function SeasonalHighlights() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Seasonal Highlights
        </h2>
        <p className="text-gray-600">Curated picks for this season.</p>
      </div>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-8 px-4 md:px-8 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {seasonalHighlights.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-80 md:w-96 snap-center bg-white rounded-3xl overflow-hidden shadow-xl"
          >
            <div className="relative h-56">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 320px, 384px"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                {item.tag}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-emerald-600 font-medium mb-2">
                {item.location}
              </p>
              <p className="text-gray-500 text-sm">
                Perfect for visiting this season with mild weather and fewer
                crowds.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
