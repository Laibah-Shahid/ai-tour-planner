"use client";

import { useState } from "react";
import { CheckCircle, Loader2, X } from "lucide-react";
import StarRating from "./StarRating";
import { submitReview, type PlaceSearchResult } from "@/lib/api";

interface ReviewFormProps {
  place: PlaceSearchResult;
  onBack: () => void;
}

export default function ReviewForm({ place, onBack }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    if (comment.trim().length < 3) { setError("Please write a short comment."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await submitReview({ place_key: place.key, rating, comment });
      setSuccess(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-10 space-y-3">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        <p className="text-lg font-semibold text-gray-900">Review submitted!</p>
        <p className="text-sm text-gray-500">{success}</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 text-sm underline">
          Review another place
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Place header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{place.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {[place.category, place.district].filter(Boolean).join(" · ")}
          </p>
        </div>
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Star rating */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Your rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Your experience <span className="text-gray-400 font-normal">(required)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share what you liked, tips for visitors, best time to go…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/1000</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}
