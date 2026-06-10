"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { searchPlaces, type PlaceSearchResult } from "@/lib/api";

interface PlaceSearchProps {
  onSelectExisting: (place: PlaceSearchResult) => void;
  onConfirmNew: (name: string) => void;
}

export default function PlaceSearch({
  onSelectExisting,
  onConfirmNew,
}: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchPlaces(query.trim());
        setResults(res);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place (e.g. Badshahi Mosque, Attabad Lake…)"
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />
        )}
      </div>

      {/* Results */}
      {searched && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Found in our database — click to leave a review
          </p>
          {results.map((place) => (
            <button
              key={place.key}
              onClick={() => onSelectExisting(place)}
              className="w-full flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{place.name}</p>
                <p className="text-xs text-gray-500">
                  {[place.category, place.district].filter(Boolean).join(" · ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Not found */}
      {searched && results.length === 0 && query.trim().length >= 2 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 space-y-3">
          <p>
            <span className="font-semibold">&quot;{query}&quot;</span> is not in our
            database yet.
          </p>
          <button
            onClick={() => onConfirmNew(query.trim())}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Add this place →
          </button>
        </div>
      )}
    </div>
  );
}
