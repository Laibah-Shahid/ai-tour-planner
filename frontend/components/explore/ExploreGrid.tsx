"use client";

import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { destinations } from "@/data/destinations";
import SectionHeader from "@/components/ui/SectionHeader";

const topDestinations = destinations.slice(0, 3);

export default function ExploreGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader
          title="Top Destinations"
          subtitle="Discover the most visited and highly rated locations tailored for you."
          className="mb-12"
          titleClassName="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topDestinations.map((dest, index) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-semibold shadow-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {dest.rating}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-500 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {dest.description}
                </p>
                <Link
                  href={dest.id ? `/destination/${dest.id}` : "/explore"}
                  className="w-full py-2.5 rounded-xl border border-emerald-500 text-emerald-600 font-medium hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Explore
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
