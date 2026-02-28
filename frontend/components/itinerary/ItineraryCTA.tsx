"use client";

import { useState } from "react";
import { Bookmark, Check, Download } from "lucide-react";

export default function ItineraryCTA() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mt-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white text-center">
      <h3 className="text-2xl font-bold mb-2">Ready to go?</h3>
      <p className="text-emerald-100 mb-8 max-w-md mx-auto">
        Save your itinerary to your profile or download a PDF copy to take
        offline.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5" />
              Save My Trip
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 border-2 border-white/80 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>

      <p className="text-xs text-emerald-200/70 mt-6">
        Don&apos;t forget to share your itinerary with friends!
      </p>
    </div>
  );
}
