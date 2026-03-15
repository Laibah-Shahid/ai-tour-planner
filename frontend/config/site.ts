export const SITE_NAME = "PakTour AI";
export const SITE_TAGLINE = "Smart Travel Companion";
export const SITE_DESCRIPTION =
  "An AI-powered platform for smarter and safer Tourism in Pakistan";

export const CONTACT_PHONE = "+92 300 1234567";
export const CONTACT_EMAIL = "hello@paktour.ai";

export const SLIDESHOW_INTERVAL = 6000;
export const TESTIMONIAL_INTERVAL = 4000;
export const SIMULATED_DELAY = 1500;

// ── Build Trip ────────────────────────────────────────────────────────────────

export const FORM_REQUIRED_FIELDS = [
  "source",
  "destination",
  "adults",
  "kids",
  "days",
  "start_date",
  "end_date",
] as const;

// ── Chatbot ───────────────────────────────────────────────────────────────────

export const CHATBOT_TYPING_DELAY = 1200;

export const CHATBOT_WELCOME_MESSAGE =
  "Hi! I'm your AI trip planning assistant. Tell me about your dream trip — destination, starting city, number of travelers, budget in PKR, and any spots you'd love to visit. You can share it all in one message or we can go step by step!";

export const CHATBOT_REQUIRED_FIELDS = [
  "destination",
  "source",
  "people",
  "budget",
  "spots",
] as const;

export const CHATBOT_FIELD_PROMPTS: Record<string, string> = {
  destination:
    "Where would you like to travel? Please share your destination.",
  source: "Great choice! Where will you be starting your journey from?",
  people: "How many people will be travelling on this trip?",
  budget: "What is your total budget for this trip? (in PKR)",
  spots:
    "Are there any specific spots or places you'd love to visit? (e.g. Attabad Lake, Altit Fort)",
};

export const CHATBOT_FIELD_LABELS: Record<string, string> = {
  destination: "Destination",
  source: "Starting Point",
  people: "Travelers",
  budget: "Budget (PKR)",
  spots: "Favorite Spots",
};

export const SOCIAL_LINKS = {
  facebook: "#",
  instagram: "#",
  twitter: "#",
} as const;

export const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "features", label: "Features", href: "/#features" },
  { id: "destinations", label: "Destinations", href: "/#destinations" },
  { id: "explore", label: "Explore", href: "/explore" },
  { id: "testimonials", label: "Reviews", href: "/#testimonials" },
];
