"use client";

import { useState } from "react";
import { PenLine, Star } from "lucide-react";
import PlaceSearch from "@/components/contribute/PlaceSearch";
import ReviewForm from "@/components/contribute/ReviewForm";
import ContributeForm from "@/components/contribute/ContributeForm";
import type { PlaceSearchResult } from "@/lib/api";

type Mode = "search" | "review" | "contribute";

export default function ContributePage() {
  const [mode, setMode] = useState<Mode>("search");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [newPlaceName, setNewPlaceName] = useState("");

  function handleSelectExisting(place: PlaceSearchResult) {
    setSelectedPlace(place);
    setMode("review");
  }

  function handleConfirmNew(name: string) {
    setNewPlaceName(name);
    setMode("contribute");
  }

  function reset() {
    setMode("search");
    setSelectedPlace(null);
    setNewPlaceName("");
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <PenLine className="w-3.5 h-3.5" />
            Community Contributions
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Share a Place</h1>
          <p className="text-gray-500 text-sm mt-2">
            Visited somewhere great? Leave a review or add a place that&apos;s missing from our map.
          </p>
        </div>

        {/* Mode tabs — only show when in search mode */}
        {mode === "search" && (
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-white border border-emerald-200 rounded-2xl p-4 text-center">
              <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">Review a place</p>
              <p className="text-xs text-gray-500 mt-0.5">Rate & share your experience</p>
            </div>
            <div className="flex-1 bg-white border border-emerald-200 rounded-2xl p-4 text-center">
              <PenLine className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">Add new place</p>
              <p className="text-xs text-gray-500 mt-0.5">Help others discover it</p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {mode === "search" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Start by searching — we&apos;ll check if the place is already in our database.
              </p>
              <PlaceSearch
                onSelectExisting={handleSelectExisting}
                onConfirmNew={handleConfirmNew}
              />
            </div>
          )}

          {mode === "review" && selectedPlace && (
            <ReviewForm place={selectedPlace} onBack={reset} />
          )}

          {mode === "contribute" && (
            <ContributeForm initialName={newPlaceName} onBack={reset} />
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Submitted places are reviewed before appearing on the platform.
          Reviews are published immediately.
        </p>
      </div>
    </main>
  );
}
