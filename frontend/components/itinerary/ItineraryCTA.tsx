"use client";

import { useState } from "react";
import { Bookmark, Check, Download, Share2, Copy } from "lucide-react";
import Link from "next/link";

interface ItineraryCTAProps {
  itineraryId?: string;
  shareUrl?: string | null;
  onShare?: () => void;
}

export default function ItineraryCTA({ itineraryId, shareUrl, onShare }: ItineraryCTAProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!shareUrl) {
      onShare?.();
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mt-10 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white text-center">
      <h3 className="text-2xl font-bold mb-2">Ready to go?</h3>
      <p className="text-emerald-100 mb-8 max-w-md mx-auto">
        Share your itinerary with friends or download a PDF copy to take
        offline.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Link Copied!
            </>
          ) : shareUrl ? (
            <>
              <Copy className="w-5 h-5" />
              Copy Share Link
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Share Trip
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
        <Link href="/profile" className="underline hover:text-white">
          View all your saved trips
        </Link>
      </p>
    </div>
  );
}
