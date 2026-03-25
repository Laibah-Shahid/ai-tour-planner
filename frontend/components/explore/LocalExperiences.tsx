"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { experiences } from "@/data/experiences";
import SectionHeader from "@/components/ui/SectionHeader";

export default function LocalExperiences() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <SectionHeader
          title="Authentic Hidden Experiences"
          subtitle="Go beyond the postcards with these immersive activities."
          titleClassName="text-3xl font-bold text-gray-900 mb-2"
          subtitleClassName="text-gray-600"
        />

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="relative w-full md:w-48 h-48 md:h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 192px"
                  className="object-cover"
                />
              </div>

              <div className="flex-grow text-center md:text-left">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
                  {exp.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {exp.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 md:mb-0 max-w-lg">
                  {exp.description}
                </p>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto">
                <Link
                  href={exp.destinationId ? `/destination/${exp.destinationId}` : "/explore"}
                  className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
