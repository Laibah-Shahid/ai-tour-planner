import Image from "next/image";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string; // now avatar path from /public
  text: string;
  rating: number;
}

export function TestimonialCard({ name, role, image, text, rating }: TestimonialCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100 hover:shadow-md transition">
      {/* Stars */}
      <div className="flex items-center space-x-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>

      {/* Text */}
      <p className="text-gray-700 mb-6 leading-relaxed">&quot;{text}&quot;</p>

      {/* Author */}
      <div className="flex items-center space-x-3">
        <Image
          src={image}
          alt={name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
    </div>
  );
}
