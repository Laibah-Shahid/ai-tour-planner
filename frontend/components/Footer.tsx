import { Facebook, Instagram, Twitter, Phone, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { CONTACT_PHONE, CONTACT_EMAIL, SOCIAL_LINKS, SITE_NAME } from "@/config/site";

const socialIcons = [
  { Icon: Facebook, label: "Facebook", href: SOCIAL_LINKS.facebook },
  { Icon: Instagram, label: "Instagram", href: SOCIAL_LINKS.instagram },
  { Icon: Twitter, label: "Twitter", href: SOCIAL_LINKS.twitter },
];

const footerDestinations = [
  "Hunza Valley",
  "Skardu",
  "Lahore",
  "Karachi",
  "Swat Valley",
];

const footerLinks = ["Help Center", "Privacy Policy", "Terms of Service"];

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
              {socialIcons.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Destinations</h3>
            <ul className="space-y-3 text-gray-400">
              {footerDestinations.map((place) => (
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
                <span>{CONTACT_PHONE}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{CONTACT_EMAIL}</span>
              </li>
              {footerLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
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
