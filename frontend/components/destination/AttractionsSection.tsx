"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { DestinationAttraction } from "@/types";

interface AttractionsSectionProps {
  attractions: DestinationAttraction[];
}

export default function AttractionsSection({ attractions }: AttractionsSectionProps) {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <SectionHeader
          badge="Must See"
          title="Top Attractions"
          subtitle="Iconic places and hidden gems that define this destination."
          className="mb-10"
          titleClassName="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          subtitleClassName="text-gray-500 text-sm max-w-xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {attractions.map((attraction, index) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={attraction.image}
                  alt={attraction.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-emerald-600 transition-colors">
                    {attraction.name}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {attraction.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
