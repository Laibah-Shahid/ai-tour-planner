import {
  Brain,
  Globe,
  Compass,
  Sparkles,
  Shield,
  Rocket,
} from "lucide-react";
import { createElement } from "react";
import type { Feature } from "@/types";

export const features: Feature[] = [
  {
    icon: createElement(Brain, { className: "w-8 h-8" }),
    title: "AI Trip Planning",
    description:
      "Generate smart itineraries personalized to your travel style using AI insights.",
  },
  {
    icon: createElement(Globe, { className: "w-8 h-8" }),
    title: "Real-time Insights",
    description:
      "Stay updated with live weather, traffic, and event data to plan smoothly.",
  },
  {
    icon: createElement(Compass, { className: "w-8 h-8" }),
    title: "Personalized Routes",
    description:
      "Find scenic, hidden, and cultural routes tailored just for you.",
  },
  {
    icon: createElement(Sparkles, { className: "w-8 h-8" }),
    title: "Smart Recommendations",
    description:
      "Our AI curates top attractions, food spots, and local experiences.",
  },
  {
    icon: createElement(Shield, { className: "w-8 h-8" }),
    title: "Secure Booking",
    description:
      "Book your journeys safely with encrypted payments and verified vendors.",
  },
  {
    icon: createElement(Rocket, { className: "w-8 h-8" }),
    title: "Lightning Fast",
    description:
      "Experience minimal delays and quick responses powered by advanced algorithms.",
  },
];
