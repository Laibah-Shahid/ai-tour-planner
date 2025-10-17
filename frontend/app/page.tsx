'use client'

import React from 'react'
import {  
  Shield, 
  Sparkles, 
  Globe, 
  Camera, 
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Zap, 
  Brain,
  Compass,
  Rocket,
} from 'lucide-react'
import TouristSpotCard from "@/components/TouristSpotCard";
import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
// import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";



const Homepage = () => {
   const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Smart Itinerary Planning",
      description: "AI analyzes your preferences, budget, and travel style to create perfect day-by-day plans",
      color: "green" as const
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Real-time Safety Alerts",
      description: "Get instant notifications about weather, security, and travel conditions in your area",
      color: "blue" as const
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Local Cultural Insights",
      description: "Discover authentic experiences, hidden gems, and cultural etiquette from local experts",
      color: "purple" as const
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Photo-Perfect Spots",
      description: "AI recommends the best photography locations and optimal timing for stunning shots",
      color: "orange" as const
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "24/7 AI Assistant",
      description: "Get instant answers about your trip, translations, and emergency assistance anytime",
      color: "red" as const
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Dynamic Optimization",
      description: "Your itinerary adapts in real-time based on weather, crowds, and your feedback",
      color: "green" as const
    }
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header/>

      {/* Hero Section */}
      <Hero/>

      {/* Features Section */}
       <section id="features" className="relative py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Powered by Advanced AI Technology
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto mb-24"
        >
          Our intelligent platform combines local expertise with cutting-edge AI to create unforgettable experiences.
        </motion.p>

        {/* Unique Geometric Layout */}
        <div className="relative h-[700px] flex items-center justify-center">
          {/* positions are unique geometric placements */}
          <FeatureCard {...features[0]} className="top-0 left-1/2 -translate-x-1/2" delay={0.1} />
          <FeatureCard {...features[1]} className="top-1/4 right-20" delay={0.2} />
          <FeatureCard {...features[2]} className="top-1/2 left-10" delay={0.3} />
          <FeatureCard {...features[3]} className="bottom-20 left-1/3" delay={0.4} />
          <FeatureCard {...features[4]} className="bottom-10 right-1/3" delay={0.5} />
          <FeatureCard {...features[5]} className="top-1/3 right-1/3" delay={0.6} />
        </div>
      </div>

      {/* Floating background shapes */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
    </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Pakistan&apos;s Most Beautiful Destinations
            </h2>
            <p className="text-xl text-gray-600">
              From majestic mountains to vibrant cities, discover what makes Pakistan extraordinary
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Hunza Valley",
                image: "/pk-spots/hunza-valley.jpg",
                description: "Breathtaking mountain scenery and ancient forts",
                rating: "4.9",
                location: "Hunza, Pakistan",
              },
              {
                name: "Wazir Khan Mosque",
                image: "/pk-spots/wazirkhan-mosque.jpg",
                description: "Rich Mughal heritage and vibrant food culture",
                rating: "4.8",
                location: "Lahore, Pakistan",
              },
              {
                name: "Skardu",
                image: "/pk-spots/skardu.jpg",
                description: "Gateway to world's highest peaks and glacial lakes",
                rating: "4.9",
                location: "Skardu, Pakistan",
              },
              {
                name: "Mohatta Palace",
                image: "/pk-spots/mohatta-palace.jpg",
                description: "Bustling metropolis with beautiful coastline",
                rating: "4.6",
                location: "Karachi, Pakistan",
              },
              {
                name: "Swat Valley",
                image: "/pk-spots/swat-valley.jpg",
                description: "Switzerland of Pakistan with lush green valleys",
                rating: "4.8",
                location: "Swat, Pakistan",
              },
              {
                name: "Shah Faisal Mosque",
                image: "/pk-spots/faisal-mosque.jpg",
                description: "Modern capital nestled in Margalla Hills",
                rating: "4.7",
                location: "Islamabad, Pakistan",
              },
            ].map((destination, index) => (
              <TouristSpotCard
                key={index}
                name={destination.name}
                image={destination.image}
                description={destination.description}
                rating={destination.rating}
                location={destination.location}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials/>

      {/* Pricing
      <Pricing/> */}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Discover Pakistan with AI?
          </h2>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            Join thousands of travelers who&apos;ve unlocked Pakistan&apos;s hidden beauty with our AI-powered platform.
            Start planning your dream journey today.
          </p>
          <button className="bg-white text-green-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-xl flex items-center space-x-2 mx-auto">
            <Zap className="w-6 h-6" />
            <span>Start Your Adventure Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer/>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-110">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
export default Homepage