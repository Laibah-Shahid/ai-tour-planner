import { MapPin, Clock, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { DestinationDetail, BudgetLevel } from "@/types";

interface DestinationOverviewProps {
  destination: DestinationDetail;
}

const BUDGET_STYLES: Record<BudgetLevel, string> = {
  low: "text-green-700 bg-green-50 border-green-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function DestinationOverview({ destination }: DestinationOverviewProps) {
  const budgetLabel =
    destination.budget.charAt(0).toUpperCase() + destination.budget.slice(1);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={MapPin}
            label="District"
            value={destination.district}
          />
          <StatCard
            icon={Clock}
            label="Ideal Duration"
            value={destination.ideal_duration}
          />
          <StatCard
            icon={Wallet}
            label="Budget Level"
            value={budgetLabel}
            valueClassName={BUDGET_STYLES[destination.budget]}
          />
        </div>

        <Separator className="mb-8" />

        {/* Full description */}
        <p className="text-gray-600 leading-relaxed text-base md:text-lg">
          {destination.description}
        </p>
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClassName?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueClassName = "text-gray-900 bg-gray-100 border-gray-200",
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
      <div className="p-2.5 bg-emerald-100 rounded-xl shrink-0">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
          {label}
        </p>
        <span
          className={`inline-block text-sm font-semibold px-2.5 py-0.5 rounded-lg border ${valueClassName}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
