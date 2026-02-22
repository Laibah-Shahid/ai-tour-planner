"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/config/site";

export default function Header() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.6 }
    );

    NAV_ITEMS.forEach((item) => {
      if (item.href.startsWith("/#")) {
        const section = document.getElementById(item.id);
        if (section) observer.observe(section);
      }
    });

    return () => {
      NAV_ITEMS.forEach((item) => {
        if (item.href.startsWith("/#")) {
          const section = document.getElementById(item.id);
          if (section) observer.unobserve(section);
        }
      });
    };
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="fixed w-full z-50 border-gray-100">
      <div className="max-w-7xl mx-auto px-2 py-4 flex items-center justify-between">
        <Logo variant="header" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {NAV_ITEMS.map((item) => (
            <motion.a
              key={item.id}
              href={item.href}
              onClick={() => {
                if (item.href.startsWith("/#")) {
                  setActiveSection(item.id);
                }
              }}
              className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`relative z-10 ${
                  activeSection === item.id
                    ? "text-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </span>
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full -z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            href="/signin"
            className="text-white hover:text-emerald-400 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/build-trip"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25"
          >
            Start Planning
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Slide-in Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 bg-emerald-950 z-50 p-6 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="flex justify-end mb-8">
                <button
                  onClick={closeMobile}
                  className="text-white p-2"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-2">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      if (item.href.startsWith("/#")) {
                        setActiveSection(item.id);
                      }
                      closeMobile();
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-emerald-600 text-white"
                        : "text-white/80 hover:bg-emerald-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col space-y-3 pt-8 border-t border-emerald-800">
                <Link
                  href="/signin"
                  onClick={closeMobile}
                  className="text-center text-white hover:text-emerald-300 transition-colors font-medium py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/build-trip"
                  onClick={closeMobile}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium text-center hover:from-emerald-600 hover:to-emerald-700 transition-all"
                >
                  Start Planning
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
