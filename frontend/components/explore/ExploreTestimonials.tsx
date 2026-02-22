"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { exploreTestimonials } from "@/data/testimonials";
import { TESTIMONIAL_INTERVAL } from "@/config/site";

export default function ExploreTestimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % exploreTestimonials.length);
    }, TESTIMONIAL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-emerald-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div className="mb-12">
          <Quote className="w-12 h-12 text-emerald-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-2">Traveler Stories</h2>
          <p className="text-emerald-200">
            Hear from those who have explored with us.
          </p>
        </div>

        <div className="relative h-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4"
            >
              <p className="text-2xl md:text-4xl font-light italic leading-relaxed mb-8">
                &ldquo;{exploreTestimonials[current].quote}&rdquo;
              </p>
              <div>
                <h4 className="text-xl font-bold text-white">
                  {exploreTestimonials[current].name}
                </h4>
                <span className="text-emerald-400 text-sm tracking-wider uppercase">
                  {exploreTestimonials[current].role}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          {exploreTestimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === idx
                  ? "bg-white scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
