"use client";

import { useEffect, useState} from "react";
import { Sparkles, Zap, Play, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence} from "framer-motion";
import Image from "next/image";
import AnimatedStat from "@/lib/AnimatedStat";



export default function Hero() {
  // Background image slideshow
  const images = [
    "/pk-spots/wazirkhan-mosque.jpg", // replace with your images in public folder
    "/pk-spots/hunza-valley.jpg",
    "/pk-spots/skardu.jpg",
    "/pk-spots/faisal-mosque.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically change image every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-20 text-white transition-colors duration-700"
    >
      {/* ===== Background Slideshow ===== */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt="Travel Background"
            fill
            priority={currentIndex === 0}
            className="object-cover"
          />
        </motion.div>
        </AnimatePresence>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* ===== Foreground Content ===== */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-center z-10">
        {/* Left Content */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-green-300 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Travel Planning</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
            Discover
            <span className="bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent">
              {" "}
              Pakistan&apos;s{" "}
            </span>
            Hidden Wonders
          </h1>

          {/* Subtext */}
          <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
            Let our AI craft personalized journeys through Pakistan&apos;s breathtaking
            landscapes, rich culture, and ancient heritage — from the peaks of K2 to
            the shores of Karachi.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-600/40 flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Plan My Adventure</span>
            </button>
            <button className="border-2 border-white/40 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>

         {/* Stats */}
        <div className="flex items-center space-x-8 pt-4">
          <AnimatedStat value={50000} suffix="+" label="Happy Travelers" />
          <AnimatedStat value={200} suffix="+" label="Destinations" />
          <AnimatedStat value={4.9} suffix="★" label="User Rating" />
        </div>

        </motion.div>

        {/* Right Form Card */}
        <motion.div
          className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Plan Your Journey</h3>
          <div className="space-y-4">
            {/* Destination + Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Destination</label>
                <div className="flex items-center space-x-2 p-3 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
                  <MapPin className="w-5 h-5 text-green-300" />
                  <select className="flex-1 bg-transparent outline-none text-white">
                    <option className="text-gray-800">Select destination</option>
                    <option className="text-gray-800">Lahore - Cultural Hub</option>
                    <option className="text-gray-800">Hunza - Mountain Paradise</option>
                    <option className="text-gray-800">Skardu - Adventure Base</option>
                    <option className="text-gray-800">Karachi - Coastal City</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Duration</label>
                <div className="flex items-center space-x-2 p-3 border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-green-300" />
                  <select className="flex-1 bg-transparent outline-none text-white">
                    <option className="text-gray-800">Select duration</option>
                    <option className="text-gray-800">3–5 days</option>
                    <option className="text-gray-800">1 week</option>
                    <option className="text-gray-800">2 weeks</option>
                    <option className="text-gray-800">1 month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Travel Style</label>
              <div className="grid grid-cols-3 gap-2">
                {["Adventure", "Cultural", "Relaxed"].map((style) => (
                  <button
                    key={style}
                    className="p-3 border border-white/30 rounded-lg text-sm text-white hover:border-green-400 hover:bg-white/10 transition-colors"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200">
              Generate AI Itinerary
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
