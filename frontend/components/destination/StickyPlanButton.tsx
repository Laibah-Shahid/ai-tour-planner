"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyPlanButtonProps {
  destinationId: string;
}

export default function StickyPlanButton({ destinationId }: StickyPlanButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/30 rounded-full px-6 h-12 font-semibold text-sm gap-2"
          >
            <Link href={`/build-trip?destination=${destinationId}`}>
              <Sparkles className="w-4 h-4" />
              Plan Trip with AI
            </Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
