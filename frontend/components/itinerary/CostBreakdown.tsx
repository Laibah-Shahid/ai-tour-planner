import { BedDouble, Car, UtensilsCrossed, Compass } from "lucide-react";
import type { CostItem } from "@/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Hotels: <BedDouble className="w-4 h-4" />,
  Transport: <Car className="w-4 h-4" />,
  Food: <UtensilsCrossed className="w-4 h-4" />,
  Activities: <Compass className="w-4 h-4" />,
};

interface CostBreakdownProps {
  costs: CostItem[];
  totalCost: number;
}

export default function CostBreakdown({ costs, totalCost }: CostBreakdownProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Trip Cost Estimate
      </h3>

      <div className="space-y-4">
        {costs.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-emerald-500">
                {ICON_MAP[item.label] ?? <Compass className="w-4 h-4" />}
              </span>
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="font-medium text-gray-900 text-sm">
              PKR {item.amount.toLocaleString()}
            </span>
          </div>
        ))}

        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">Total Estimate</span>
          <span className="font-bold text-emerald-600 text-lg">
            PKR {totalCost.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-5 leading-relaxed">
        * This is an estimated cost. Actual prices may vary depending on season
        and availability.
      </p>
    </div>
  );
}
