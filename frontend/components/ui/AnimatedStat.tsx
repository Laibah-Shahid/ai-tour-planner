"use client";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label?: string;
  duration?: number;
}

export default function AnimatedStat({
  value,
  suffix,
  label,
  duration = 2,
}: AnimatedStatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    value >= 5 ? Math.floor(latest).toLocaleString() : latest.toFixed(1)
  );

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, count, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <motion.p className="text-2xl font-bold text-white">
        {displayValue} {suffix}
      </motion.p>
      <div className="text-sm text-gray-300">{label}</div>
    </div>
  );
}
