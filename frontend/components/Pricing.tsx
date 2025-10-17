"use client";

import PricingCard from "./PricingCard";

export default function Pricing() {
  const plans = [
    {
      name: "Explorer",
      price: "Free",
      description: "Perfect for trying out our AI travel planning",
      features: [
        "Basic AI itinerary planning",
        "5 destinations per month",
        "Community support",
        "Standard safety alerts",
      ],
      popular: false,
    },
    {
      name: "Adventurer",
      price: "$19",
      period: "/month",
      description: "Ideal for frequent travelers and digital nomads",
      features: [
        "Unlimited AI planning",
        "Premium destinations",
        "Real-time optimization",
        "24/7 AI assistant",
        "Photo recommendations",
        "Offline access",
      ],
      popular: true,
    },
    {
      name: "Explorer Pro",
      price: "$49",
      period: "/month",
      description: "For travel agencies and professional guides",
      features: [
        "Everything in Adventurer",
        "Multiple client management",
        "Custom branding",
        "API access",
        "Analytics dashboard",
        "Priority support",
      ],
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-to-br from-green-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your travel needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
