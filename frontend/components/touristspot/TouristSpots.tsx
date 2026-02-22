"use client";
import { motion } from "framer-motion";
import TouristSpotCard from "./TouristSpotCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { destinations } from "@/data/destinations";

export default function DestinationsSection() {
  return (
    <section
      id="destinations"
      className="py-20 bg-gradient-to-br from-emerald-50 to-white overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <SectionHeader
            title="Explore Pakistan&apos;s Most Beautiful Destinations"
            subtitle="From majestic mountains to vibrant cities, discover what makes Pakistan extraordinary"
          />
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {destinations.map((destination, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
            >
              <TouristSpotCard {...destination} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
