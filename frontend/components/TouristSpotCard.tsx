
import Image from "next/image";
import { Star, MapPin } from "lucide-react";

interface TouristSpotCardProps {
  name: string;
  image: string;
  description: string;
  rating: string;
  location: string; 
}

export default function TouristSpotCard({
  name,
  image,
  description,
  rating,
  location,
}: TouristSpotCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer flex flex-col">
      <div className="relative h-60 w-full">
        {image.startsWith("/") ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
            <span className="text-6xl">{image}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-red-500" />
            {location}
          </div>
        </div>
      </div>
    </div>
  );
}
