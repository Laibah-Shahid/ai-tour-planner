"use client";

import { motion } from "framer-motion";

export default function ExploreHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('/images/explore-hero.png')" }}
        />
        <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg"
        >
          Explore Pakistan’s <br/>
          <span className="text-emerald-400">Hidden Gems</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-100 mb-10 font-light max-w-2xl mx-auto drop-shadow-md"
        >
          Find your next adventure with personalized recommendations tailored just for you.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, backgroundColor: "#059669" }} // emerald-600
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="px-8 py-4 bg-emerald-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all"
          onClick={() => {
            const element = document.getElementById("explore-filters");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Discover Now
        </motion.button>
      </div>
    </section>
  );
}
