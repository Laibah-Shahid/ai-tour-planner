"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TestimonialCard from "./TestimonialCard";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    if (index + 2 < testimonials.length) setIndex(index + 1);
    else setIndex(0);
  };

  const prevSlide = () => {
    if (index > 0) setIndex(index - 1);
    else setIndex(testimonials.length - 2);
  };

  return (
    <section
      id="testimonials"
      className="bg-emerald-50 py-20 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-6xl mx-auto text-center">
        <p className="uppercase text-sm font-semibold text-emerald-700 tracking-wide mb-3">
          Client Reviews
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
          Trusted by thousands of <br /> people &amp; companies.
        </h2>

        <div className="relative flex items-center justify-center">
          <button
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="absolute -top-12 right-20 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-2 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="absolute -top-12 right-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-2 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="overflow-hidden w-full">
            <motion.div
              key={index}
              className="flex gap-6 justify-center"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {testimonials.slice(index, index + 2).map((t) => (
                <div
                  key={t.id}
                  className="w-full md:w-1/2 flex-shrink-0 transition-transform duration-500"
                >
                  <TestimonialCard
                    name={t.name}
                    role={t.role}
                    image={t.image!}
                    quote={t.quote}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
