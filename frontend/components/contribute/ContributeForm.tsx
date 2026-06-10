"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, LocateFixed, MapPin, X } from "lucide-react";
import { getCategories, submitContribution } from "@/lib/api";

interface ContributeFormProps {
  initialName: string;
  onBack: () => void;
}

export default function ContributeForm({ initialName, onBack }: ContributeFormProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: initialName,
    category: "",
    description: "",
    city: "",
    area: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "detecting" | "detected" | "denied"
  >("idle");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {});
  }, []);

  function set(field: string, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude);
        set("longitude", pos.coords.longitude);
        setLocationStatus("detected");
      },
      () => setLocationStatus("denied")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Place name is required."); return; }
    if (!form.category) { setError("Please select a category."); return; }
    if (!form.city.trim()) { setError("City is required."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await submitContribution(form);
      setSuccess(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-10 space-y-3">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        <p className="text-lg font-semibold text-gray-900">Submission received!</p>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">{success}</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 text-sm underline">
          Contribute another place
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Add a new place</h3>
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Place name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Rani Kot Fort"
          maxLength={200}
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-400">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Select a category…</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Brief description — history, what to expect, highlights…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Location <span className="text-red-400">*</span>
        </label>

        {/* Geolocation button */}
        {locationStatus !== "detected" && (
          <button
            type="button"
            onClick={detectLocation}
            disabled={locationStatus === "detecting"}
            className="flex items-center gap-2 text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-60"
          >
            {locationStatus === "detecting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
            {locationStatus === "detecting" ? "Detecting…" : "Use my current location"}
          </button>
        )}

        {locationStatus === "detected" && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
            <MapPin className="w-4 h-4" />
            Location detected ({form.latitude?.toFixed(4)}, {form.longitude?.toFixed(4)})
            <button
              type="button"
              onClick={() => { set("latitude", null); set("longitude", null); setLocationStatus("idle"); }}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* City + Area fallback (always shown; required if no geolocation) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">City <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Lahore"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Area / Neighbourhood</label>
            <input
              type="text"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="e.g. Walled City"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit for Review
      </button>
    </form>
  );
}
