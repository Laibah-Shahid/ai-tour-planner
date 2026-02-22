"use client";
import { motion } from "framer-motion";
import { features } from "@/data/features";

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 bg-gradient-to-b from-emerald-950 to-emerald-900 text-white overflow-hidden rounded-[2rem] mx-4 md:mx-8 mt-20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-emerald-800/40 border border-emerald-500/40 rounded-full text-emerald-300 text-sm font-medium mb-4">
            HOW IT WORKS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Explore Amazing Journeys in{" "}
            <span className="text-emerald-400">6 Simple Steps</span>
          </h2>
          <p className="text-lg text-emerald-200 max-w-2xl mx-auto">
            Our AI-powered travel process makes your trip effortless from
            planning to experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 relative">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="relative bg-emerald-800/40 backdrop-blur-sm border border-emerald-600/30 rounded-3xl p-8 hover:border-emerald-400/60 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)] transition-all duration-500 group"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-700/50 text-emerald-300 group-hover:bg-emerald-500/70 group-hover:text-white transition-all duration-500 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-emerald-100/90 leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-emerald-800 font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-lg border border-emerald-300">
                {String(index + 1).padStart(2, "0")}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]"
          animate={{ y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px]"
          animate={{ y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}
