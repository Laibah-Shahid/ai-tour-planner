import { CalendarDays, Sunrise } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/ui/SectionHeader";
import type { DestinationDetail } from "@/types";

const SEASON_STYLES: Record<string, string> = {
  Spring: "bg-green-100 text-green-700 border-green-200",
  Summer: "bg-amber-100 text-amber-700 border-amber-200",
  Autumn: "bg-orange-100 text-orange-700 border-orange-200",
  Winter: "bg-blue-100 text-blue-700 border-blue-200",
};

interface BestTimeSectionProps {
  destination: DestinationDetail;
}

export default function BestTimeSection({ destination }: BestTimeSectionProps) {
  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <SectionHeader
          badge="Planning"
          title="Best Time to Visit"
          subtitle="Plan your trip around the ideal seasons for the most memorable experience."
          className="mb-10"
          titleClassName="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          subtitleClassName="text-gray-500 text-sm max-w-xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seasons */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Recommended Seasons</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.best_season.map((season) => (
                <Badge
                  key={season}
                  variant="outline"
                  className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                    SEASON_STYLES[season] ?? "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {season}
                </Badge>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Sunrise className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Ideal Trip Duration</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {destination.ideal_duration}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Recommended for a complete experience
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
