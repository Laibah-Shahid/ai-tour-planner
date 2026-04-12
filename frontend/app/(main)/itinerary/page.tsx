"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Sun,
  ArrowLeft,
  Share2,
  Check,
  Copy,
  AlertTriangle,
  Loader2,
  Pencil,
  X,
  Save,
} from "lucide-react";
import ItineraryDaysSection from "@/components/itinerary/ItineraryDaysSection";
import CostBreakdown from "@/components/itinerary/CostBreakdown";
import TravelTips from "@/components/itinerary/TravelTips";
import ItineraryCTA from "@/components/itinerary/ItineraryCTA";
import { dummyItinerary } from "@/data/itinerary";
import type { ItineraryData, ItineraryDay } from "@/types";
import {
  getItinerary,
  getSharedItinerary,
  updateItinerary,
  shareItinerary,
  checkDisasters,
} from "@/lib/api";
import type { ItineraryResponseData, DisasterAlert } from "@/lib/api";

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <ItineraryPageContent />
    </Suspense>
  );
}

function ItineraryPageContent() {
  const searchParams = useSearchParams();
  const itineraryId = searchParams.get("id");
  const shareId = searchParams.get("shared");

  const [data, setData] = useState<ItineraryData | null>(null);
  const [responseData, setResponseData] = useState<ItineraryResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sharing
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Disaster alerts
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [checkingAlerts, setCheckingAlerts] = useState(false);

  // Editing
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ItineraryData | null>(null);
  const [saving, setSaving] = useState(false);

  // Load itinerary data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Try to load from API by ID
        if (itineraryId) {
          const result = await getItinerary(itineraryId);
          setResponseData(result);
          setData(result.itinerary);
          if (result.share_id) {
            setShareUrl(`${window.location.origin}/itinerary?shared=${result.share_id}`);
          }
          setLoading(false);
          return;
        }

        // Try to load shared itinerary
        if (shareId) {
          const result = await getSharedItinerary(shareId);
          setResponseData(result);
          setData(result.itinerary);
          setLoading(false);
          return;
        }

        // Try to load from localStorage (from generation)
        const stored = localStorage.getItem("itineraryResult");
        if (stored) {
          const parsed = JSON.parse(stored);
          setResponseData(parsed);
          setData(parsed.itinerary);
          localStorage.removeItem("itineraryResult");
          setLoading(false);
          return;
        }

        // Fallback to dummy data
        setData(dummyItinerary);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load itinerary:", err);
        // Fallback to dummy data on error
        setData(dummyItinerary);
        setLoading(false);
      }
    }

    loadData();
  }, [itineraryId, shareId]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!responseData?.id || sharing) return;
    setSharing(true);
    try {
      const result = await shareItinerary(responseData.id);
      const url = `${window.location.origin}${result.share_url}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create share link";
      alert(message);
    } finally {
      setSharing(false);
    }
  }, [responseData, sharing]);

  // Copy share URL
  const handleCopyShare = useCallback(async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  }, [shareUrl]);

  // Check for disaster alerts
  const handleCheckDisasters = useCallback(async () => {
    if (!data || checkingAlerts) return;
    setCheckingAlerts(true);
    try {
      const cities = [
        ...new Set(
          data.days.map((d) => {
            const parts = d.title.split(" - ");
            return parts.length > 1 ? parts[1].trim() : data.destination;
          })
        ),
      ];
      const result = await checkDisasters(cities, [], responseData?.id);
      setAlerts(result.alerts);
    } catch (err) {
      console.error("Disaster check failed:", err);
    } finally {
      setCheckingAlerts(false);
    }
  }, [data, responseData, checkingAlerts]);

  // Edit mode
  const handleStartEdit = useCallback(() => {
    if (!data) return;
    setEditData(JSON.parse(JSON.stringify(data)));
    setEditing(true);
  }, [data]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setEditData(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editData || !responseData?.id || saving) return;
    setSaving(true);
    try {
      const result = await updateItinerary(responseData.id, { itinerary: editData });
      setData(result.itinerary);
      setResponseData(result);
      setEditing(false);
      setEditData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes";
      alert(message);
    } finally {
      setSaving(false);
    }
  }, [editData, responseData, saving]);

  // Edit handlers for day fields
  const handleEditDay = useCallback(
    (dayId: number, field: keyof ItineraryDay, value: string) => {
      if (!editData) return;
      setEditData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((d) =>
            d.id === dayId ? { ...d, [field]: value } : d
          ),
        };
      });
    },
    [editData]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Preparing your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">No itinerary found.</p>
          <Link
            href="/build-trip"
            className="text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Build a new trip
          </Link>
        </div>
      </div>
    );
  }

  const displayData = editing && editData ? editData : data;
  const { destination, totalDays, bestSeason, totalCost, days, costs, tips } = displayData;
  const isSharedView = !!shareId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-800 text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/build-trip"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isSharedView ? "Build My Own" : "Refine My Plan"}
            </Link>

            {/* Action buttons */}
            {!isSharedView && (
              <div className="flex items-center gap-2">
                {/* Edit button */}
                {responseData?.id && !editing && (
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}

                {/* Save / Cancel edit */}
                {editing && (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 text-sm bg-emerald-500 hover:bg-emerald-400 rounded-full px-4 py-2 transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}

                {/* Share button */}
                {responseData?.id && (
                  <button
                    onClick={shareUrl ? handleCopyShare : handleShare}
                    disabled={sharing}
                    className="inline-flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 transition-colors"
                  >
                    {sharing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : shareCopied ? (
                      <Check className="w-4 h-4 text-green-300" />
                    ) : shareUrl ? (
                      <Copy className="w-4 h-4" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    {shareCopied ? "Copied!" : shareUrl ? "Copy Link" : "Share"}
                  </button>
                )}

                {/* Disaster check */}
                <button
                  onClick={handleCheckDisasters}
                  disabled={checkingAlerts}
                  className="inline-flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 transition-colors"
                >
                  {checkingAlerts ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  Check Alerts
                </button>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
            {isSharedView ? "Shared Trip to " : "Your Trip to "}
            <span className="text-emerald-300">{destination}</span>
          </h1>
          <p className="text-emerald-200 text-lg mb-8">
            {isSharedView
              ? "Someone shared their personalized travel plan with you."
              : "Here's your personalized day-by-day travel plan. Every detail, planned for you."}
          </p>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-emerald-300" />
              {totalDays} Days
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-emerald-300" />
              {destination}
            </div>
            {bestSeason && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium">
                <Sun className="w-4 h-4 text-emerald-300" />
                Best Season: {bestSeason}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Disaster Alerts Banner */}
      {alerts.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">
                  Travel Alerts ({alerts.length})
                </h3>
                <ul className="space-y-1">
                  {alerts.map((alert, i) => (
                    <li key={i} className="text-sm text-amber-700">
                      <span className="font-medium">{alert.city}</span>
                      {alert.date && ` (${alert.date})`}: {alert.event} —{" "}
                      {alert.impact}
                      {alert.severity === "high" && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          High Risk
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Editing Banner */}
        {editing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Pencil className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              You are editing this itinerary. Click on day titles and taglines
              to modify them. Click <strong>Save</strong> when done.
            </p>
          </div>
        )}

        {/* Day-by-Day Itinerary */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Day-by-Day Itinerary
          </h2>
          <ItineraryDaysSection
            days={days}
            editing={editing}
            onEditDay={handleEditDay}
          />
        </section>

        {/* Tips + Cost Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <TravelTips tips={tips} />
          <CostBreakdown costs={costs} totalCost={totalCost} />
        </section>

        {/* CTA */}
        <ItineraryCTA />

        {/* Info text */}
        <p className="text-center text-xs text-gray-400 pb-4">
          {responseData?.id
            ? "This itinerary was generated by PakTour AI based on your preferences."
            : "This itinerary is sample data for demonstration purposes."}
        </p>
      </div>
    </div>
  );
}
