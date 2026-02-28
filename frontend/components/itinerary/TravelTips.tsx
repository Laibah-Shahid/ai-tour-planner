import { Thermometer, Wallet, Users, Wifi } from "lucide-react";
import type { ElementType } from "react";
import type { TravelTip } from "@/types";

const TIP_ICONS: ElementType[] = [Thermometer, Wallet, Users, Wifi];

interface TravelTipsProps {
  tips: TravelTip[];
}

export default function TravelTips({ tips }: TravelTipsProps) {
  return (
    <div className="bg-emerald-950 rounded-2xl p-6 text-white h-full">
      <h3 className="text-xl font-bold mb-6">Tips for Your Trip</h3>

      <div className="space-y-5">
        {tips.map((tip, index) => {
          const Icon = TIP_ICONS[index % TIP_ICONS.length];
          return (
            <div key={tip.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-800/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-sm text-emerald-100 leading-relaxed">
                {tip.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
