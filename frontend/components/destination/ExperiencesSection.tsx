"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Banknote, ArrowRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/badge";
import type { DestinationExperience } from "@/types";

interface ExperiencesSectionProps {
  experiences: DestinationExperience[];
}

export default function ExperiencesSection({ experiences }: ExperiencesSectionProps) {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <SectionHeader
          badge="Activities"
          title="Local Experiences"
          subtitle="Immersive activities curated to help you connect deeply with this destination."
          className="mb-10"
          titleClassName="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          subtitleClassName="text-gray-500 text-sm max-w-xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/experience/${exp.id}`}
                className="group flex flex-col bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 h-full"
              >
                {/* Price badge */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium uppercase tracking-wide"
                  >
                    Experience
                  </Badge>
                  <span className="text-xs text-gray-400 group-hover:text-emerald-600 transition-colors font-medium">
                    {exp.price === 0 ? "Free" : `PKR ${exp.price.toLocaleString()}`}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-3 leading-snug group-hover:text-emerald-600 transition-colors flex-grow">
                  {exp.title}
                </h3>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    {exp.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                    {exp.price === 0 ? "No charge" : `PKR ${exp.price.toLocaleString()}`}
                  </span>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  <span>View Experience</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
