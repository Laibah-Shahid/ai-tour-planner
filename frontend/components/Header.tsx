"use client";

import { useEffect, useState } from "react";
import { Mountain } from "lucide-react";

const navItems = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "destinations", label: "Destinations" },
  { id: "testimonials", label: "Reviews" },
  // { id: "pricing", label: "Pricing" },
];

export default function Header() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.6, // 60% visible triggers active
      }
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => {
      navItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-sm fixed w-full z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              PakTour AI
            </span>
            <div className="text-xs text-gray-500">Smart Travel Companion</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`font-medium transition-colors ${
                activeSection === item.id
                  ? "text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-green-600 transition-colors font-medium">
            Sign In
          </button>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-green-500/25">
            Start Planning
          </button>
        </div>
      </div>
    </header>
  );
}
