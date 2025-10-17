"use client";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function AnimatedStat({ value, suffix, label, duration = 2 }: { value: number; suffix?: string; label?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    value >= 5 ? Math.floor(latest).toLocaleString() : latest.toFixed(1)
  );

  // 👇 local state to store the readable string
  const [displayValue, setDisplayValue] = useState("0");

  // 👇 Subscribe to motion value changes
  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [rounded]);

  // 👇 Start counting animation when in view
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

export default AnimatedStat;
