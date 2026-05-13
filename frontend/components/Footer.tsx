import { Phone, Mail } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { CONTACT_PHONE, CONTACT_EMAIL, SITE_NAME } from "@/config/site";

const footerDestinations = [
  { name: "Hunza Valley", id: "hunza" },
  { name: "Skardu", id: "skardu" },
  { name: "Lahore", id: "lahore" },
  { name: "Karachi", id: "karachi" },
  { name: "Swat Valley", id: "swat" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <Logo variant="footer" />
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Discover Pakistan&apos;s beauty through the power of artificial
              intelligence. Your perfect journey awaits.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/build-trip"
                className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
              >
                Plan a Trip
              </Link>
              <Link
                href="/explore"
                className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
              >
                Explore
              </Link>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Destinations</h3>
            <ul className="space-y-3 text-gray-400">
              {footerDestinations.map((dest) => (
                <li key={dest.id}>
                  <Link href={`/destination/${dest.id}`} className="hover:text-white transition-colors">
                    {dest.name}
                  </Link>
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
                <span>{CONTACT_PHONE}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{CONTACT_EMAIL}</span>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link href="/build-trip" className="hover:text-white transition-colors">
                  Plan Your Trip
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
