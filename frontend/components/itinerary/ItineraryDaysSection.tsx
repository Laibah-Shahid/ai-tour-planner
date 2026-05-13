"use client";

import { useState } from "react";
import DayCard from "@/components/itinerary/DayCard";
import HotelDetailsDrawer from "@/components/itinerary/HotelDetailsDrawer";
import type { Hotel, ItineraryDay, AlternativeCityPool, AlternativeHotel, AlternativePlace } from "@/types";
import type { SwapCategory } from "@/components/itinerary/SwapDrawer";

interface ItineraryDaysSectionProps {
  days: ItineraryDay[];
  editing?: boolean;
  onEditDay?: (dayId: number, field: keyof ItineraryDay, value: string) => void;
  alternativePool?: Record<string, AlternativeCityPool>;
  onSwapItem?: (
    dayId: number,
    category: SwapCategory,
    index: number,
    item: AlternativePlace | AlternativeHotel
  ) => void;
}

function getCityKey(day: ItineraryDay): string {
  const parts = day.title.split(" - ");
  return parts.length > 1 ? parts[1].trim().toLowerCase() : "";
}

export default function ItineraryDaysSection({
  days,
  editing = false,
  onEditDay,
  alternativePool,
  onSwapItem,
}: ItineraryDaysSectionProps) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  return (
    <>
      <div className="relative">
        {days.map((day, index) => {
          const cityKey = getCityKey(day);
          const cityPool = alternativePool?.[cityKey] ?? null;

          return (
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
                  editing={editing}
                  onEditDay={onEditDay}
                  cityPool={cityPool}
                  onSwapItem={onSwapItem}
                />
              </div>
            </div>
          );
        })}
      </div>

      <HotelDetailsDrawer
        selectedHotel={selectedHotel}
        setSelectedHotel={setSelectedHotel}
      />
    </>
  );
}
