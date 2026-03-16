import type { ItineraryData } from "@/types";

export const dummyItinerary: ItineraryData = {
  destination: "Hunza Valley, Gilgit-Baltistan",
  totalDays: 5,
  bestSeason: "April – October",
  totalCost: 50000,

  days: [
    {
      id: 1,
      title: "Day 1 – Arrival & Scenic Drive",
      tagline: "Let the mountains greet you.",
      image: "/pk-spots/faisal-mosque.jpg",
      durationHours: 8,
      distanceKm: 550,
      hotels: [
        {
          name: "Hunza View Resort",
          image: "/pk-spots/hunza-valley.jpg",
          rating: 5,
          address: "Main Karakoram Highway, Karimabad, Hunza",
          pricePerNight: 12000,
          images: [
            "/pk-spots/hunza-valley.jpg",
            "/pk-spots/skardu.jpg",
            "/pk-spots/swat-valley.jpg",
          ],
          rooms: [
            { type: "Deluxe Room", beds: 2, size: "35 sqm", price: 12000 },
            { type: "Executive Suite", beds: 2, size: "55 sqm", price: 20000 },
            { type: "Mountain View Room", beds: 1, size: "28 sqm", price: 9500 },
          ],
          reviews: [
            { user: "Ali Raza", rating: 5, comment: "Breathtaking views and top-notch service. Highly recommended!" },
            { user: "Sara Khan", rating: 5, comment: "Rooms were spotless with an incredible panorama of the valley." },
            { user: "Usman Tariq", rating: 4, comment: "Great food and friendly staff. The mountain suite was worth every rupee." },
          ],
          amenities: ["wifi", "parking", "restaurant", "room_service", "breakfast", "tv", "security"],
        },
        {
          name: "Mountain Breeze Inn",
          image: "/pk-spots/skardu.jpg",
          rating: 4,
          address: "Near Baltit Fort Road, Karimabad",
          pricePerNight: 8000,
          images: [
            "/pk-spots/skardu.jpg",
            "/pk-spots/hunza-valley.jpg",
            "/pk-spots/wazirkhan-mosque.jpg",
          ],
          rooms: [
            { type: "Standard Room", beds: 1, size: "22 sqm", price: 8000 },
            { type: "Family Room", beds: 3, size: "45 sqm", price: 14000 },
          ],
          reviews: [
            { user: "Fatima Noor", rating: 4, comment: "Cozy and budget-friendly. Perfect for a short stay." },
            { user: "Hassan Mir", rating: 4, comment: "Clean rooms and a very welcoming host." },
          ],
          amenities: ["wifi", "parking", "breakfast", "laundry", "security"],
        },
      ],
      places: [
        {
          name: "Karakoram Highway",
          image: "/pk-spots/hunza-valley.jpg",
          description:
            "The world's highest paved international road. Witness breathtaking valley views throughout your drive north.",
        },
        {
          name: "Rakaposhi Viewpoint",
          image: "/pk-spots/skardu.jpg",
          description:
            "Stop for panoramic views of the 7,788 m Rakaposhi peak standing guard over the Nagar Valley.",
        },
      ],
      souvenirs: [
        {
          name: "Dried Apricots",
          description: "Famous Hunza apricots — perfect as a travel snack.",
        },
        {
          name: "Handwoven Shawls",
          description: "Warm woolen shawls crafted by local artisans.",
        },
      ],
    },
    {
      id: 2,
      title: "Day 2 – Altit & Baltit Forts",
      tagline: "Step into 900 years of royal history.",
      image: "/pk-spots/hunza-valley.jpg",
      durationHours: 6,
      distanceKm: 20,
      hotels: [
        {
          name: "Eagle's Nest Hotel",
          image: "/pk-spots/hunza-valley.jpg",
          rating: 5,
          address: "Duikar Village, Upper Hunza",
          pricePerNight: 15000,
          images: [
            "/pk-spots/hunza-valley.jpg",
            "/pk-spots/swat-valley.jpg",
            "/pk-spots/skardu.jpg",
          ],
          rooms: [
            { type: "Panorama Suite", beds: 2, size: "60 sqm", price: 25000 },
            { type: "Deluxe Double", beds: 2, size: "38 sqm", price: 15000 },
            { type: "Single Room", beds: 1, size: "20 sqm", price: 10000 },
          ],
          reviews: [
            { user: "Zara Ahmed", rating: 5, comment: "Waking up above the clouds was magical. Worth every penny!" },
            { user: "Bilal Siddiqui", rating: 5, comment: "The panorama suite offers the best sunrise view in all of Hunza." },
            { user: "Nida Hussain", rating: 4, comment: "Superb location, helpful staff and delicious breakfast." },
          ],
          amenities: ["wifi", "restaurant", "room_service", "breakfast", "spa", "gym", "tv", "security", "laundry"],
        },
      ],
      places: [
        {
          name: "Baltit Fort",
          image: "/pk-spots/hunza-valley.jpg",
          description:
            "A 700-year-old fort that was the seat of Hunza's rulers. Stunning views of the valley from its ramparts.",
        },
        {
          name: "Altit Fort",
          image: "/pk-spots/skardu.jpg",
          description:
            "The oldest fort in Hunza, dating back over 900 years, overlooking the rushing Hunza River below.",
        },
        {
          name: "Karimabad Bazaar",
          image: "/pk-spots/wazirkhan-mosque.jpg",
          description:
            "A vibrant local market where you can shop for gems, lacquer work, and fresh local produce.",
        },
      ],
      souvenirs: [
        {
          name: "Lapis Lazuli Gems",
          description: "Precious stones sourced from the region's mountains.",
        },
        {
          name: "Hunza Pakol Cap",
          description: "Traditional woollen cap worn by locals across the north.",
        },
      ],
    },
    {
      id: 3,
      title: "Day 3 – Attabad Lake & Passu Cones",
      tagline: "Turquoise waters and cathedral spires of rock.",
      image: "/pk-spots/skardu.jpg",
      durationHours: 7,
      distanceKm: 80,
      hotels: [
        {
          name: "Passu Inn",
          image: "/pk-spots/skardu.jpg",
          rating: 4,
          address: "Village Road, Passu, Gojal Valley",
          pricePerNight: 7000,
          images: [
            "/pk-spots/skardu.jpg",
            "/pk-spots/hunza-valley.jpg",
            "/pk-spots/wazirkhan-mosque.jpg",
          ],
          rooms: [
            { type: "Lake View Room", beds: 2, size: "30 sqm", price: 10000 },
            { type: "Standard Room", beds: 1, size: "20 sqm", price: 7000 },
          ],
          reviews: [
            { user: "Kamran Ali", rating: 4, comment: "Lovely little inn with stunning views of Attabad Lake." },
            { user: "Amna Malik", rating: 4, comment: "Simple but clean. Great value for the location." },
          ],
          amenities: ["wifi", "parking", "breakfast", "laundry"],
        },
      ],
      places: [
        {
          name: "Attabad Lake",
          image: "/pk-spots/skardu.jpg",
          description:
            "A stunning turquoise lake formed by a 2010 landslide. Boat rides available across its calm, vivid waters.",
        },
        {
          name: "Passu Cones",
          image: "/pk-spots/hunza-valley.jpg",
          description:
            "Dramatic cathedral-like rock spires rising sharply from the valley floor — a photographer's dream.",
        },
        {
          name: "Hussaini Suspension Bridge",
          image: "/pk-spots/skardu.jpg",
          description:
            "Cross one of the world's most thrilling suspension bridges, swaying over the rushing Hunza River.",
        },
      ],
      souvenirs: [
        {
          name: "Turquoise Jewellery",
          description:
            "Locally crafted pieces inspired by the lake's vivid colour.",
        },
        {
          name: "Pink Rock Salt",
          description: "Premium Himalayan salt from the Karakoram region.",
        },
      ],
    },
    {
      id: 4,
      title: "Day 4 – Eagle's Nest Sunrise & Villages",
      tagline: "Wake up above the clouds.",
      image: "/pk-spots/swat-valley.jpg",
      durationHours: 5,
      distanceKm: 30,
      hotels: [
        {
          name: "Hunza View Resort",
          image: "/pk-spots/hunza-valley.jpg",
          rating: 5,
          address: "Karimabad, Hunza",
          pricePerNight: 12000,
          images: [
            "/pk-spots/hunza-valley.jpg",
            "/pk-spots/skardu.jpg",
            "/pk-spots/swat-valley.jpg",
          ],
          rooms: [
            { type: "Deluxe Room", beds: 2, size: "35 sqm", price: 12000 },
            { type: "Executive Suite", beds: 2, size: "55 sqm", price: 20000 },
            { type: "Mountain View Room", beds: 1, size: "28 sqm", price: 9500 },
          ],
          reviews: [
            { user: "Ali Raza", rating: 5, comment: "Breathtaking views and top-notch service. Highly recommended!" },
            { user: "Sara Khan", rating: 5, comment: "Rooms were spotless with an incredible panorama of the valley." },
          ],
          amenities: ["wifi", "parking", "restaurant", "room_service", "breakfast", "tv", "security"],
        },
      ],
      places: [
        {
          name: "Eagle's Nest Viewpoint",
          image: "/pk-spots/hunza-valley.jpg",
          description:
            "Hike or drive to this iconic viewpoint at dawn for a sunrise stretching across five mountain ranges.",
        },
        {
          name: "Duikar Village",
          image: "/pk-spots/swat-valley.jpg",
          description:
            "A traditional Wakhi village perched above Hunza — enjoy local chai and authentic mountain hospitality.",
        },
      ],
      souvenirs: [
        {
          name: "Walnut Honey",
          description: "Raw honey infused with local wild walnuts — a rare mountain delicacy.",
        },
        {
          name: "Embroidered Bags",
          description: "Hand-embroidered bags featuring traditional Hunza patterns.",
        },
      ],
    },
    {
      id: 5,
      title: "Day 5 – Shopping & Departure",
      tagline: "Carry a piece of Hunza back home.",
      image: "/pk-spots/wazirkhan-mosque.jpg",
      durationHours: 8,
      distanceKm: 550,
      hotels: [],
      places: [
        {
          name: "Central Karimabad Market",
          image: "/pk-spots/wazirkhan-mosque.jpg",
          description:
            "Browse stalls packed with gems, dried fruits, local handicrafts, and traditional Hunzai clothing.",
        },
        {
          name: "KKH Scenic Stops",
          image: "/pk-spots/hunza-valley.jpg",
          description:
            "On the return drive, stop at scenic pullouts along the Karakoram Highway for final photographs.",
        },
      ],
      souvenirs: [
        {
          name: "Gemstone Collection",
          description:
            "Aquamarine, tourmaline, and topaz found in the northern mountains.",
        },
        {
          name: "Hunza Mulberry Jam",
          description: "Locally made jam from wild mulberries — a sweet farewell gift.",
        },
      ],
    },
  ],

  costs: [
    { label: "Hotels", amount: 25000 },
    { label: "Transport", amount: 12000 },
    { label: "Food", amount: 8000 },
    { label: "Activities", amount: 5000 },
  ],

  tips: [
    {
      id: 1,
      text: "Hunza's weather changes rapidly. Always pack warm layers and a windproof jacket, even in summer.",
    },
    {
      id: 2,
      text: "Carry enough cash before leaving Gilgit or Islamabad — ATMs are scarce in remote mountain areas.",
    },
    {
      id: 3,
      text: "Respect local customs and dress modestly, especially when visiting villages and shrines.",
    },
    {
      id: 4,
      text: "Mobile signal is limited in upper Hunza. Download offline maps and inform someone of your schedule.",
    },
  ],
};
