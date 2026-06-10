"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeftRight, BedDouble, Compass, Utensils, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlternativeCityPool, AlternativeHotel, AlternativePlace } from "@/types";

export type SwapCategory = "places" | "hotels" | "food" | "souvenirs";

interface SwapDrawerProps {
  open: boolean;
  category: SwapCategory | null;
  itemIndex: number | null;
  cityPool: AlternativeCityPool | null;
  onSelect: (category: SwapCategory, index: number, item: AlternativePlace | AlternativeHotel) => void;
  onClose: () => void;
}

const CATEGORY_META: Record<SwapCategory, { label: string; icon: React.ReactNode }> = {
  places: { label: "Places to Visit", icon: <Compass className="w-4 h-4" /> },
  hotels: { label: "Suggested Stays", icon: <BedDouble className="w-4 h-4" /> },
  food: { label: "Food Spots", icon: <Utensils className="w-4 h-4" /> },
  souvenirs: { label: "Souvenir Shops", icon: <ShoppingBag className="w-4 h-4" /> },
};

export default function SwapDrawer({
  open,
  category,
  itemIndex,
  cityPool,
  onSelect,
  onClose,
}: SwapDrawerProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const alternatives = category && cityPool ? cityPool[category] : [];
  const meta = category ? CATEGORY_META[category] : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                <span>Replace {meta?.label}</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {alternatives.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No alternatives available for this item.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-3">
                    Select a replacement from the options retrieved for your trip:
                  </p>
                  {category === "hotels"
                    ? (alternatives as AlternativeHotel[]).map((item, i) => (
                        <HotelOption
                          key={i}
                          item={item}
                          onSelect={() => onSelect(category!, itemIndex!, item)}
                        />
                      ))
                    : (alternatives as AlternativePlace[]).map((item, i) => (
                        <PlaceOption
                          key={i}
                          item={item}
                          onSelect={() => onSelect(category!, itemIndex!, item)}
                        />
                      ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PlaceOption({ item, onSelect }: { item: AlternativePlace; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-xl px-4 py-3 text-left transition-colors group"
    >
      <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 truncate">
        {item.name}
      </span>
      <Button size="sm" variant="outline" className="flex-shrink-0 text-xs h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white">
        Select
      </Button>
    </button>
  );
}

function HotelOption({ item, onSelect }: { item: AlternativeHotel; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-xl px-4 py-3 text-left transition-colors group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 truncate">
          {item.name}
        </p>
        <div className="flex gap-3 mt-0.5">
          {item.pricePerNight > 0 && (
            <span className="text-xs text-gray-500">PKR {item.pricePerNight.toLocaleString()}/night</span>
          )}
          {item.rating > 0 && (
            <span className="text-xs text-amber-600">★ {item.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
      <Button size="sm" variant="outline" className="flex-shrink-0 text-xs h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white">
        Select
      </Button>
    </button>
  );
}
