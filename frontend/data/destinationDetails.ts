import type { DestinationDetail } from "@/types";

const destinationDetails: DestinationDetail[] = [
  {
    id: "hunza",
    name: "Hunza Valley",
    description:
      "A breathtaking valley in the Karakoram range, Hunza is Pakistan's crown jewel. Surrounded by towering peaks, ancient forts, and warm-hearted locals, it offers an unmatched blend of natural grandeur and cultural richness. Every sunrise here paints the mountains gold.",
    rating: 4.9,
    category: "Nature",
    district: "Hunza-Nagar",
    images: [
      "/pk-spots/hunza-valley.jpg",
      "/pk-spots/skardu.jpg",
      "/pk-spots/swat-valley.jpg",
    ],
    best_season: ["Spring", "Summer", "Autumn"],
    budget: "medium",
    avg_trip_cost: 80000,
    ideal_duration: "4–6 days",
    attractions: [
      {
        id: "baltit-fort",
        name: "Baltit Fort",
        description:
          "A 700-year-old fort perched above Karimabad with panoramic views of Hunza Valley and Rakaposhi peak.",
        image: "/pk-spots/hunza-valley.jpg",
      },
      {
        id: "attabad-lake",
        name: "Attabad Lake",
        description:
          "A stunning turquoise lake formed by a 2010 landslide, now a popular spot for boating and photography.",
        image: "/pk-spots/skardu.jpg",
      },
      {
        id: "eagle-nest",
        name: "Eagle's Nest Viewpoint",
        description:
          "A high-altitude viewpoint offering one of Pakistan's most spectacular panoramic mountain vistas.",
        image: "/pk-spots/swat-valley.jpg",
      },
    ],
    hotels: [
      {
        id: "serena-hunza",
        name: "Hunza Serena Hotel",
        rating: 4.7,
        price: 18000,
        address: "Karimabad, Hunza Valley",
        image: "/pk-spots/hunza-valley.jpg",
        images: ["/pk-spots/hunza-valley.jpg", "/pk-spots/skardu.jpg"],
        amenities: ["wifi", "restaurant", "parking", "room_service", "laundry"],
        rooms: [
          { type: "Deluxe Mountain View", beds: 1, size: "28 m²", price: 18000 },
          { type: "Superior Suite", beds: 2, size: "42 m²", price: 28000 },
        ],
        reviews: [
          { user: "Ali Raza", rating: 5, comment: "Breathtaking views right from the window. The hospitality is world-class." },
          { user: "Sara Khan", rating: 4, comment: "Great service and food. A perfect base to explore Hunza." },
        ],
      },
      {
        id: "old-hunza-inn",
        name: "Old Hunza Inn",
        rating: 4.3,
        price: 9500,
        address: "Altit Village, Hunza",
        image: "/pk-spots/swat-valley.jpg",
        images: ["/pk-spots/swat-valley.jpg"],
        amenities: ["wifi", "breakfast", "parking"],
        rooms: [
          { type: "Standard Room", beds: 1, size: "20 m²", price: 9500 },
          { type: "Family Room", beds: 2, size: "32 m²", price: 15000 },
        ],
        reviews: [
          { user: "Usman Malik", rating: 4, comment: "Very cozy and authentic. The owner is incredibly helpful." },
        ],
      },
    ],
    experiences: [
      { id: "cultural-walk", title: "Hunza Cultural Walk", duration: "3 hours", price: 5000 },
      { id: "fort-tour", title: "Baltit & Altit Fort Tour", duration: "4 hours", price: 3500 },
      { id: "apricot-farm", title: "Apricot Farm Visit", duration: "2 hours", price: 2000 },
    ],
  },
  {
    id: "lahore",
    name: "Lahore",
    description:
      "The heart of Pakistan's cultural heritage, Lahore is a city that lives, breathes, and eats with passion. From the grandeur of Mughal architecture to the intoxicating aromas of street food in the Walled City, every lane tells a centuries-old story.",
    rating: 4.8,
    category: "History",
    district: "Lahore",
    images: [
      "/pk-spots/wazirkhan-mosque.jpg",
      "/pk-spots/mohatta-palace.jpg",
      "/pk-spots/faisal-mosque.jpg",
    ],
    best_season: ["Winter", "Spring"],
    budget: "low",
    avg_trip_cost: 35000,
    ideal_duration: "2–4 days",
    attractions: [
      {
        id: "wazir-khan-mosque",
        name: "Wazir Khan Mosque",
        description:
          "A 17th-century Mughal-era mosque renowned for its intricate tile work and stunning calligraphy.",
        image: "/pk-spots/wazirkhan-mosque.jpg",
      },
      {
        id: "lahore-fort",
        name: "Lahore Fort (Shahi Qila)",
        description:
          "A UNESCO World Heritage Site featuring Mughal palaces, gardens, and the iconic Sheesh Mahal.",
        image: "/pk-spots/mohatta-palace.jpg",
      },
      {
        id: "badshahi-mosque",
        name: "Badshahi Mosque",
        description:
          "One of the world's largest mosques, an icon of Mughal grandeur that dominates the Lahore skyline.",
        image: "/pk-spots/faisal-mosque.jpg",
      },
    ],
    hotels: [
      {
        id: "pearl-continental",
        name: "Pearl Continental Lahore",
        rating: 4.8,
        price: 22000,
        address: "Shahrah-e-Quaid-e-Azam, Lahore",
        image: "/pk-spots/wazirkhan-mosque.jpg",
        images: ["/pk-spots/wazirkhan-mosque.jpg", "/pk-spots/mohatta-palace.jpg"],
        amenities: ["wifi", "pool", "gym", "restaurant", "spa", "parking", "room_service"],
        rooms: [
          { type: "Deluxe Room", beds: 1, size: "30 m²", price: 22000 },
          { type: "Executive Suite", beds: 2, size: "55 m²", price: 40000 },
        ],
        reviews: [
          { user: "Fatima Zahra", rating: 5, comment: "Luxurious stay, impeccable service, and great central location." },
          { user: "Hamza Sheikh", rating: 5, comment: "The buffet breakfast is outstanding. Highly recommend!" },
        ],
      },
      {
        id: "hotel-one-lahore",
        name: "Hotel One Lahore",
        rating: 4.2,
        price: 8000,
        address: "Garden Town, Lahore",
        image: "/pk-spots/mohatta-palace.jpg",
        images: ["/pk-spots/mohatta-palace.jpg"],
        amenities: ["wifi", "breakfast", "parking", "ac"],
        rooms: [
          { type: "Standard Room", beds: 1, size: "22 m²", price: 8000 },
        ],
        reviews: [
          { user: "Bilal Ahmed", rating: 4, comment: "Clean, comfortable, and great value for money." },
        ],
      },
    ],
    experiences: [
      { id: "food-tour", title: "Old Lahore Street Food Tour", duration: "3 hours", price: 2500 },
      { id: "mughal-trail", title: "Mughal Heritage Trail", duration: "5 hours", price: 4000 },
      { id: "sufi-night", title: "Sufi Night at Data Darbar", duration: "2 hours", price: 0 },
    ],
  },
  {
    id: "skardu",
    name: "Skardu",
    description:
      "The gateway to the world's highest peaks, Skardu is where the earth meets the sky. Home to K2 base camp treks, crystal-clear lakes like Shangrila and Satpara, and ancient rock carvings, it is a paradise for adventurers and seekers of silence alike.",
    rating: 4.9,
    category: "Adventure",
    district: "Skardu",
    images: [
      "/pk-spots/skardu.jpg",
      "/pk-spots/hunza-valley.jpg",
      "/pk-spots/swat-valley.jpg",
    ],
    best_season: ["Summer", "Autumn"],
    budget: "high",
    avg_trip_cost: 120000,
    ideal_duration: "5–7 days",
    attractions: [
      {
        id: "shangrila-resort",
        name: "Shangrila Resort (Heaven on Earth)",
        description:
          "A stunning lake resort surrounded by weeping willows and mountain reflections — often called 'Heaven on Earth'.",
        image: "/pk-spots/skardu.jpg",
      },
      {
        id: "satpara-lake",
        name: "Satpara Lake",
        description:
          "A pristine natural lake near Skardu city, offering boating, fishing, and breathtaking views.",
        image: "/pk-spots/hunza-valley.jpg",
      },
      {
        id: "deosai-plains",
        name: "Deosai National Park",
        description:
          "One of the world's highest plateaus at 4,114m, home to the Himalayan brown bear and carpeted with wildflowers in summer.",
        image: "/pk-spots/swat-valley.jpg",
      },
    ],
    hotels: [
      {
        id: "shangrila-hotel",
        name: "Shangrila Resort Skardu",
        rating: 4.6,
        price: 25000,
        address: "Kachura, Skardu",
        image: "/pk-spots/skardu.jpg",
        images: ["/pk-spots/skardu.jpg", "/pk-spots/hunza-valley.jpg"],
        amenities: ["wifi", "restaurant", "parking", "room_service", "laundry", "security"],
        rooms: [
          { type: "Lake View Cottage", beds: 1, size: "32 m²", price: 25000 },
          { type: "Family Cottage", beds: 2, size: "48 m²", price: 38000 },
        ],
        reviews: [
          { user: "Nadia Hussain", rating: 5, comment: "Waking up to the lake view was a dream. Truly heaven on earth." },
          { user: "Tariq Mehmood", rating: 4, comment: "The location is unbeatable. Food quality is very good." },
        ],
      },
    ],
    experiences: [
      { id: "k2-basecamp-trek", title: "K2 Base Camp Trek (Intro)", duration: "Full day", price: 15000 },
      { id: "deosai-jeep", title: "Deosai Plains Jeep Safari", duration: "8 hours", price: 12000 },
      { id: "lake-boating", title: "Satpara Lake Boating", duration: "1 hour", price: 1500 },
    ],
  },
  {
    id: "swat",
    name: "Swat Valley",
    description:
      "Called the 'Switzerland of Pakistan', Swat Valley enchants with its emerald forests, roaring rivers, and snow-capped peaks. The valley holds a rich Buddhist heritage alongside a vibrant living culture, making it a destination that feeds both the soul and the curious mind.",
    rating: 4.8,
    category: "Nature",
    district: "Swat",
    images: [
      "/pk-spots/swat-valley.jpg",
      "/pk-spots/hunza-valley.jpg",
      "/pk-spots/skardu.jpg",
    ],
    best_season: ["Spring", "Summer"],
    budget: "low",
    avg_trip_cost: 40000,
    ideal_duration: "3–5 days",
    attractions: [
      {
        id: "malam-jabba",
        name: "Malam Jabba Ski Resort",
        description:
          "Pakistan's premier ski resort offering snow sports in winter and scenic cable car rides in summer.",
        image: "/pk-spots/swat-valley.jpg",
      },
      {
        id: "mingora-bazaar",
        name: "Mingora Green Chowk Bazaar",
        description:
          "A lively bazaar famous for handmade jewelry, Swati embroidery, and local crafts.",
        image: "/pk-spots/hunza-valley.jpg",
      },
      {
        id: "udegram-ruins",
        name: "Udegram Buddhist Ruins",
        description:
          "Ancient stupa and monastery ruins dating back over 2,000 years, a window into Gandhara civilization.",
        image: "/pk-spots/skardu.jpg",
      },
    ],
    hotels: [
      {
        id: "swat-serena",
        name: "Swat Serena Hotel",
        rating: 4.5,
        price: 14000,
        address: "Saidu Sharif, Swat",
        image: "/pk-spots/swat-valley.jpg",
        images: ["/pk-spots/swat-valley.jpg", "/pk-spots/skardu.jpg"],
        amenities: ["wifi", "restaurant", "parking", "gym", "laundry", "room_service"],
        rooms: [
          { type: "Garden View Room", beds: 1, size: "26 m²", price: 14000 },
          { type: "Valley View Suite", beds: 2, size: "40 m²", price: 22000 },
        ],
        reviews: [
          { user: "Zara Anwar", rating: 5, comment: "Peaceful setting by the river. The staff are incredibly warm." },
          { user: "Kamran Ali", rating: 4, comment: "Good food and clean rooms. The garden is beautiful." },
        ],
      },
    ],
    experiences: [
      { id: "river-rafting", title: "Swat River Rafting", duration: "3 hours", price: 3500 },
      { id: "buddhist-tour", title: "Gandhara Heritage Tour", duration: "5 hours", price: 4500 },
      { id: "ski-lesson", title: "Malam Jabba Ski Lesson", duration: "2 hours", price: 5000 },
    ],
  },
  {
    id: "islamabad",
    name: "Islamabad",
    description:
      "Pakistan's purpose-built capital is a rare harmony of modern urban planning and natural serenity. Nestled against the Margalla Hills, Islamabad offers world-class architecture, lush greenery, and a peaceful pace that stands in beautiful contrast to the country's other bustling cities.",
    rating: 4.7,
    category: "Iconic",
    district: "Islamabad Capital Territory",
    images: [
      "/pk-spots/faisal-mosque.jpg",
      "/pk-spots/wazirkhan-mosque.jpg",
      "/pk-spots/mohatta-palace.jpg",
    ],
    best_season: ["Winter", "Spring", "Autumn"],
    budget: "medium",
    avg_trip_cost: 45000,
    ideal_duration: "2–3 days",
    attractions: [
      {
        id: "faisal-mosque",
        name: "Faisal Mosque",
        description:
          "One of the world's largest mosques, an architectural masterpiece nestled at the foot of the Margalla Hills.",
        image: "/pk-spots/faisal-mosque.jpg",
      },
      {
        id: "margalla-hills",
        name: "Margalla Hills National Park",
        description:
          "A forested national park on the city's edge offering hiking trails, diverse wildlife, and panoramic city views.",
        image: "/pk-spots/swat-valley.jpg",
      },
      {
        id: "pakistan-monument",
        name: "Pakistan Monument",
        description:
          "A striking star-shaped national monument symbolizing the four provinces and three territories of Pakistan.",
        image: "/pk-spots/hunza-valley.jpg",
      },
    ],
    hotels: [
      {
        id: "pc-islamabad",
        name: "Pearl Continental Islamabad",
        rating: 4.8,
        price: 28000,
        address: "Club Road, Islamabad",
        image: "/pk-spots/faisal-mosque.jpg",
        images: ["/pk-spots/faisal-mosque.jpg", "/pk-spots/wazirkhan-mosque.jpg"],
        amenities: ["wifi", "pool", "gym", "spa", "restaurant", "parking", "room_service", "laundry"],
        rooms: [
          { type: "Superior Room", beds: 1, size: "34 m²", price: 28000 },
          { type: "Executive Suite", beds: 2, size: "60 m²", price: 50000 },
        ],
        reviews: [
          { user: "Mehreen Qazi", rating: 5, comment: "Absolute luxury. The pool area is stunning and service is flawless." },
          { user: "Asad Javed", rating: 5, comment: "Best hotel in Islamabad. Rooms are spacious and spotless." },
        ],
      },
    ],
    experiences: [
      { id: "margalla-hike", title: "Margalla Hills Trail 3 Hike", duration: "3 hours", price: 0 },
      { id: "monument-tour", title: "National Monument & Museum Tour", duration: "2 hours", price: 500 },
      { id: "sufi-qawwali", title: "Sufi Qawwali Night", duration: "2 hours", price: 1500 },
    ],
  },
  {
    id: "karachi",
    name: "Karachi",
    description:
      "Pakistan's largest city and economic heartbeat is a sensory overload in the best way possible. From the ornate halls of Mohatta Palace to the salt spray of Clifton Beach, Karachi pulses with an energy found nowhere else — a melting pot of cultures, cuisines, and ambitions.",
    rating: 4.6,
    category: "Art",
    district: "Karachi",
    images: [
      "/pk-spots/mohatta-palace.jpg",
      "/pk-spots/wazirkhan-mosque.jpg",
      "/pk-spots/faisal-mosque.jpg",
    ],
    best_season: ["Winter"],
    budget: "medium",
    avg_trip_cost: 55000,
    ideal_duration: "3–4 days",
    attractions: [
      {
        id: "mohatta-palace",
        name: "Mohatta Palace Museum",
        description:
          "A stunning 1920s palace turned museum showcasing Pakistan's rich artistic and historical heritage.",
        image: "/pk-spots/mohatta-palace.jpg",
      },
      {
        id: "clifton-beach",
        name: "Clifton Beach",
        description:
          "Karachi's most popular seafront promenade, lively at sunset with food stalls, camel rides, and sea breeze.",
        image: "/pk-spots/wazirkhan-mosque.jpg",
      },
      {
        id: "quaid-mausoleum",
        name: "Mazar-e-Quaid",
        description:
          "The magnificent white marble mausoleum of Pakistan's founding father, Muhammad Ali Jinnah.",
        image: "/pk-spots/faisal-mosque.jpg",
      },
    ],
    hotels: [
      {
        id: "marriott-karachi",
        name: "Karachi Marriott Hotel",
        rating: 4.7,
        price: 24000,
        address: "9 Abdullah Haroon Road, Karachi",
        image: "/pk-spots/mohatta-palace.jpg",
        images: ["/pk-spots/mohatta-palace.jpg", "/pk-spots/wazirkhan-mosque.jpg"],
        amenities: ["wifi", "pool", "gym", "restaurant", "spa", "parking", "room_service", "laundry", "security"],
        rooms: [
          { type: "Deluxe Room", beds: 1, size: "32 m²", price: 24000 },
          { type: "Junior Suite", beds: 2, size: "52 m²", price: 42000 },
        ],
        reviews: [
          { user: "Sana Mir", rating: 5, comment: "Exceptional service and the pool is fantastic. Very central location." },
          { user: "Omer Farooq", rating: 4, comment: "Comfortable rooms and great dining options within the hotel." },
        ],
      },
    ],
    experiences: [
      { id: "food-street", title: "Burns Road Food Street Tour", duration: "3 hours", price: 2000 },
      { id: "art-gallery", title: "Karachi Art Gallery Circuit", duration: "4 hours", price: 1500 },
      { id: "harbour-cruise", title: "Karachi Harbour Sunset Cruise", duration: "2 hours", price: 3000 },
    ],
  },
];

export function getDestinationById(id: string): DestinationDetail | undefined {
  return destinationDetails.find((d) => d.id === id);
}

export { destinationDetails };
