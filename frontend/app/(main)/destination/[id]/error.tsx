"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DestinationError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-2xl mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          We couldn&apos;t load this destination. Please try again or go back to
          explore other destinations.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/explore">
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
