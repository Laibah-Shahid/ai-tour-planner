import {
  Wifi,
  Car,
  UtensilsCrossed,
  ConciergeBell,
  Dumbbell,
  Waves,
  Sparkles,
  Wind,
  WashingMachine,
  Coffee,
  ShieldCheck,
  Tv,
  type LucideIcon,
} from "lucide-react";

export interface AmenityConfig {
  label: string;
  icon: LucideIcon;
}

/**
 * Global amenity registry.
 * Keys are stored in Hotel.amenities[], icons/labels live here.
 * Add new amenities here once; they're automatically available everywhere.
 */
export const AMENITY_CONFIG: Record<string, AmenityConfig> = {
  wifi:          { label: "Free WiFi",       icon: Wifi          },
  parking:       { label: "Free Parking",    icon: Car           },
  restaurant:    { label: "Restaurant",      icon: UtensilsCrossed },
  room_service:  { label: "Room Service",    icon: ConciergeBell },
  gym:           { label: "Fitness Centre",  icon: Dumbbell      },
  pool:          { label: "Swimming Pool",   icon: Waves         },
  spa:           { label: "Spa & Wellness",  icon: Sparkles      },
  ac:            { label: "Air Conditioning",icon: Wind          },
  laundry:       { label: "Laundry",         icon: WashingMachine },
  breakfast:     { label: "Breakfast",       icon: Coffee        },
  security:      { label: "24 / 7 Security", icon: ShieldCheck   },
  tv:            { label: "Smart TV",        icon: Tv            },
} as const;

export type AmenityKey = keyof typeof AMENITY_CONFIG;
