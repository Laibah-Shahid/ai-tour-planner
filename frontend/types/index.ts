import type { ReactNode } from "react";

export interface Destination {
  name: string;
  image: string;
  description: string;
  rating: number;
  location: string;
  tag?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  image?: string;
  quote: string;
  rating?: number;
}

export interface Experience {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

export interface SeasonalHighlight {
  id: number;
  title: string;
  location: string;
  image: string;
  tag: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}
