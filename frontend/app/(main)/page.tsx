import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import TouristSpots from "@/components/touristspot/TouristSpots";
import Features from "@/components/features/Features";
import Hero from "@/components/Hero";
import Testimonials from "@/components/testimonials/Testimonials";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <TouristSpots />
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Discover Pakistan with AI?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join thousands of travelers who&apos;ve unlocked Pakistan&apos;s
            hidden beauty with our AI-powered platform. Start planning your
            dream journey today.
          </p>
          <Link
            href="/build-trip"
            className="bg-white text-emerald-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-xl inline-flex items-center space-x-2"
          >
            <Zap className="w-6 h-6" />
            <span>Start Your Adventure Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/build-trip?mode=chat"
          aria-label="Plan trip via chat"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-full shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-110 block"
        >
          <MessageCircle className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
