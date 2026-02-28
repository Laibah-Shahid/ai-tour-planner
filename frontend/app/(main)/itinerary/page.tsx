import Link from "next/link";
import { Calendar, MapPin, Sun, ArrowLeft } from "lucide-react";
import { dummyItinerary } from "@/data/itinerary";
import DayCard from "@/components/itinerary/DayCard";
import CostBreakdown from "@/components/itinerary/CostBreakdown";
import TravelTips from "@/components/itinerary/TravelTips";
import ItineraryCTA from "@/components/itinerary/ItineraryCTA";

export default function ItineraryPage() {
  const { destination, totalDays, bestSeason, totalCost, days, costs, tips } =
    dummyItinerary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-800 text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/build-trip"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Refine My Plan
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
            Your Trip to{" "}
            <span className="text-emerald-300">{destination}</span>
          </h1>
          <p className="text-emerald-200 text-lg mb-8">
            Here&apos;s your personalized day-by-day travel plan. Every detail,
            planned for you.
          </p>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-emerald-300" />
              {totalDays} Days
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-emerald-300" />
              {destination}
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <Sun className="w-4 h-4 text-emerald-300" />
              Best Season: {bestSeason}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Day-by-Day Itinerary */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Day-by-Day Itinerary
          </h2>
          <div className="relative">
            {days.map((day, index) => (
              <div key={day.id} className="relative flex gap-5">
                {/* Timeline track */}
                <div className="flex flex-col items-center">
                  {/* Node */}
                  <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200 ring-4 ring-emerald-100 flex-shrink-0">
                    {index + 1}
                  </div>
                  {/* Connector line */}
                  {index < days.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-400 to-emerald-200 my-1" />
                  )}
                </div>

                {/* Card */}
                <div className={`flex-1 ${index < days.length - 1 ? "pb-5" : ""}`}>
                  <DayCard day={day} defaultOpen={index === 0} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips + Cost Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <TravelTips tips={tips} />
          <CostBreakdown costs={costs} totalCost={totalCost} />
        </section>

        {/* CTA */}
        <ItineraryCTA />

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          This itinerary is AI-generated sample data for demonstration purposes.
          Real itineraries will be tailored to your specific inputs once the AI
          backend is live.
        </p>
      </div>
    </div>
  );
}
