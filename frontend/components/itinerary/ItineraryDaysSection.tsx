"use client";

import { useState } from "react";
import DayCard from "@/components/itinerary/DayCard";
import HotelDetailsDrawer from "@/components/itinerary/HotelDetailsDrawer";
import type { Hotel, ItineraryDay } from "@/types";

interface ItineraryDaysSectionProps {
  days: ItineraryDay[];
}

export default function ItineraryDaysSection({ days }: ItineraryDaysSectionProps) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  return (
    <>
      <div className="relative">
        {days.map((day, index) => (
          <div key={day.id} className="relative flex gap-5">
            {/* Timeline track */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200 ring-4 ring-emerald-100 flex-shrink-0">
                {index + 1}
              </div>
              {index < days.length - 1 && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-400 to-emerald-200 my-1" />
              )}
            </div>

            {/* Card */}
            <div className={`flex-1 ${index < days.length - 1 ? "pb-5" : ""}`}>
              <DayCard
                day={day}
                defaultOpen={index === 0}
                onHotelClick={setSelectedHotel}
              />
            </div>
          </div>
        ))}
      </div>

      <HotelDetailsDrawer
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
      />
    </>
  );
}
