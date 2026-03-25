import type { Destination } from "@/types";

export const destinations: Destination[] = [
  {
    id: "hunza",
    name: "Hunza Valley",
    image: "/pk-spots/hunza-valley.jpg",
    description: "Breathtaking mountain scenery and ancient forts",
    rating: 4.9,
    location: "Hunza, Pakistan",
    tag: "Mountains",
  },
  {
    id: "lahore",
    name: "Wazir Khan Mosque",
    image: "/pk-spots/wazirkhan-mosque.jpg",
    description: "Rich Mughal heritage and vibrant food culture",
    rating: 4.8,
    location: "Lahore, Pakistan",
    tag: "History",
  },
  {
    id: "skardu",
    name: "Skardu",
    image: "/pk-spots/skardu.jpg",
    description: "Gateway to world's highest peaks and glacial lakes",
    rating: 4.9,
    location: "Skardu, Pakistan",
    tag: "Adventure",
  },
  {
    id: "karachi",
    name: "Mohatta Palace",
    image: "/pk-spots/mohatta-palace.jpg",
    description: "Bustling metropolis with beautiful coastline",
    rating: 4.6,
    location: "Karachi, Pakistan",
    tag: "Art",
  },
  {
    id: "swat",
    name: "Swat Valley",
    image: "/pk-spots/swat-valley.jpg",
    description: "Switzerland of Pakistan with lush green valleys",
    rating: 4.8,
    location: "Swat, Pakistan",
    tag: "Nature",
  },
  {
    id: "islamabad",
    name: "Shah Faisal Mosque",
    image: "/pk-spots/faisal-mosque.jpg",
    description: "Modern capital nestled in Margalla Hills",
    rating: 4.7,
    location: "Islamabad, Pakistan",
    tag: "Iconic",
  },
];

export const heroImages = destinations.map((d) => d.image);

export const seasonalHighlights = [
  {
    id: 1,
    title: "Winter Wonderland",
    location: "Malam Jabba",
    image: "/pk-spots/swat-valley.jpg",
    tag: "Ski Resort",
  },
  {
    id: 2,
    title: "Cultural Heritage",
    location: "Lahore Fort",
    image: "/pk-spots/wazirkhan-mosque.jpg",
    tag: "History",
  },
  {
    id: 3,
    title: "Architectural Marvel",
    location: "Faisal Mosque",
    image: "/pk-spots/faisal-mosque.jpg",
    tag: "Iconic",
  },
  {
    id: 4,
    title: "Royal Beauty",
    location: "Mohatta Palace",
    image: "/pk-spots/mohatta-palace.jpg",
    tag: "Art",
  },
];
