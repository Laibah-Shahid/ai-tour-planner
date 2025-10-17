"use client";

import { Mountain, Facebook, Instagram, Twitter, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-40">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">PakTour AI</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Discover Pakistan&apos;s beauty through the power of artificial intelligence.
              Your perfect journey awaits.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <Icon
                  key={i}
                  className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors"
                />
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Destinations</h3>
            <ul className="space-y-3 text-gray-400">
              {["Hunza Valley", "Skardu", "Lahore", "Karachi", "Swat Valley"].map((place) => (
                <li key={place}>
                  <a href="#" className="hover:text-white transition-colors">
                    {place}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>hello@paktour.ai</span>
              </li>
              {["Help Center", "Privacy Policy", "Terms of Service"].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} PakTour AI. All rights reserved. Made with ❤️ for
            Pakistan&apos;s travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}
