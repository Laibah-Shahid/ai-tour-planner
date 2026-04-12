"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Trash2,
  ExternalLink,
  Share2,
  Loader2,
  User,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/lib/useUserSession";
import { getMyTrips, deleteItinerary, shareItinerary } from "@/lib/api";
import type { ItineraryResponseData } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUserSession();
  const [trips, setTrips] = useState<ItineraryResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }

    async function loadTrips() {
      try {
        const result = await getMyTrips();
        setTrips(result.trips);
      } catch (err) {
        console.error("Failed to load trips:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;
    setDeleting(id);
    try {
      await deleteItinerary(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const result = await shareItinerary(id);
      const url = `${window.location.origin}${result.share_url}`;
      await navigator.clipboard.writeText(url);
      alert("Share link copied to clipboard!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to share");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-800 text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-bold ring-4 ring-emerald-400/30">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {user.user_metadata?.full_name || user.email}
              </h1>
              <p className="text-emerald-300 mt-1">{user.email}</p>
              <p className="text-emerald-200/70 text-sm mt-1">
                {trips.length} trip{trips.length !== 1 ? "s" : ""} planned
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trips List */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
          <Link href="/build-trip">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Trip
            </Button>
          </Link>
        </div>

        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl border border-gray-100"
          >
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start planning your first trip to Pakistan!
            </p>
            <Link href="/build-trip">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Plan Your First Trip
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/itinerary?id=${trip.id}`}
                      className="group"
                    >
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                        {trip.itinerary.destination}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.itinerary.totalDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {trip.itinerary.destination}
                      </span>
                      {trip.itinerary.totalCost > 0 && (
                        <span className="text-emerald-600 font-medium">
                          PKR {trip.itinerary.totalCost.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          trip.status === "shared"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {trip.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(trip.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/itinerary?id=${trip.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-emerald-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-blue-600"
                      onClick={() => handleShare(trip.id)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDelete(trip.id)}
                      disabled={deleting === trip.id}
                    >
                      {deleting === trip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
