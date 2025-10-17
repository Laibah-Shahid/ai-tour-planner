"use client";

import { TestimonialCard } from "@/components/TestimonialCard";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Adventure Photographer",
    image: "/avatars/thumb-1.jpg", 
    text: "PakTour AI helped me discover hidden photography spots in Hunza that I would never have found on my own. The AI's recommendations were spot-on!",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Travel Blogger",
    image: "/avatars/thumb-3.jpg",
    text: "As a Pakistani, I thought I knew my country well. PakTour AI showed me places and experiences I never knew existed. Truly impressive!",
    rating: 5,
  },
  {
    name: "Emma Chen",
    role: "Solo Traveler",
    image: "/avatars/thumb-2.jpg",
    text: "Traveling solo in Pakistan felt safe and easy with PakTour AI's real-time updates and local insights. An incredible experience!",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Travelers Worldwide
          </h2>
          <p className="text-xl text-gray-600">
            See what our community says about their PakTour AI experiences
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
