import { TrendingUp, Wallet, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "@/components/ui/SectionHeader";
import type { DestinationDetail, BudgetLevel } from "@/types";

const BUDGET_CONFIG: Record<
  BudgetLevel,
  { label: string; description: string; badgeClass: string }
> = {
  low: {
    label: "Budget Friendly",
    description: "Great value for money. Ideal for backpackers and budget travellers.",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
  },
  medium: {
    label: "Mid-Range",
    description: "Comfortable travel with a balance of quality and value.",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  high: {
    label: "Premium",
    description: "Luxury accommodations and exclusive experiences for discerning travellers.",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

interface CostSectionProps {
  destination: DestinationDetail;
}

export default function CostSection({ destination }: CostSectionProps) {
  const config = BUDGET_CONFIG[destination.budget];
  const perPerson = Math.round(destination.avg_trip_cost / 2);

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <SectionHeader
          badge="Budget"
          title="Trip Cost Estimate"
          subtitle="Transparent cost breakdown to help you plan with confidence."
          className="mb-10"
          titleClassName="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          subtitleClassName="text-gray-500 text-sm max-w-xl mx-auto"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total cost */}
          <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="p-2.5 bg-emerald-100 rounded-xl w-fit mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
                Avg. Total Trip Cost
              </p>
              <p className="text-3xl font-bold text-gray-900">
                PKR {destination.avg_trip_cost.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                For a {destination.ideal_duration} trip
              </p>
            </div>
          </div>

          {/* Per person */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="p-2.5 bg-emerald-100 rounded-xl w-fit mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
                Estimated Per Person
              </p>
              <p className="text-3xl font-bold text-gray-900">
                PKR {perPerson.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Based on 2 travellers</p>
            </div>
          </div>

          {/* Budget level */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="p-2.5 bg-emerald-100 rounded-xl w-fit mb-4">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2">
                Budget Category
              </p>
              <Badge
                variant="outline"
                className={`text-sm font-semibold px-3 py-1 mb-2 ${config.badgeClass}`}
              >
                {config.label}
              </Badge>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
