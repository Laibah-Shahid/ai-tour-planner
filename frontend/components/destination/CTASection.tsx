import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  destinationId: string;
  destinationName: string;
}

export default function CTASection({ destinationId, destinationName }: CTASectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-emerald-100">
          <Sparkles className="w-4 h-4" />
          AI-Powered Trip Planning
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Ready to explore{" "}
          <span className="text-emerald-600">{destinationName}</span>?
        </h2>

        <p className="text-gray-500 text-base mb-8 max-w-xl mx-auto leading-relaxed">
          Let our AI craft a personalized itinerary with hotels, experiences, and
          day-by-day plans tailored to your budget and preferences.
        </p>

        <Button
          asChild
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-13 px-8 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
        >
          <Link href={`/build-trip?destination=${destinationId}`}>
            <Sparkles className="w-5 h-5 mr-2" />
            Plan Trip with AI
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          Free to use · Personalised in seconds · No account required
        </p>
      </div>
    </section>
  );
}
