"use client";
import { motion } from "framer-motion";
import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "green" | "blue" | "purple" | "orange" | "red";
  delay?: number;
  className?: string;
}

const colorClasses = {
  green: { bg: "bg-green-100", text: "text-green-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
  delay = 0,
  className = "",
}) => {
  const { bg, text } = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`absolute bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30 hover:shadow-2xl transition-all ${className}`}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${bg} ${text}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
