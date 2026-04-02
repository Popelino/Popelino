import Link from "next/link";
import { MapPin, Star, UtensilsCrossed, Wine, Coffee, Store } from "lucide-react";
import { getPriceRangeLabel, getPlaceTypeLabel } from "@/lib/utils";
import type { PlaceCard as PlaceCardType } from "@/lib/types";

const typeIcons: Record<string, React.ReactNode> = {
  RESTAURANT: <UtensilsCrossed className="w-3.5 h-3.5" />,
  BAR: <Wine className="w-3.5 h-3.5" />,
  CAFE: <Coffee className="w-3.5 h-3.5" />,
  BISTRO: <UtensilsCrossed className="w-3.5 h-3.5" />,
  CLUB: <Store className="w-3.5 h-3.5" />,
};

const typeColors: Record<string, string> = {
  RESTAURANT: "bg-orange-50 text-orange-600 border-orange-200",
  BAR: "bg-purple-50 text-purple-600 border-purple-200",
  CAFE: "bg-amber-50 text-amber-600 border-amber-200",
  BISTRO: "bg-rose-50 text-rose-600 border-rose-200",
  CLUB: "bg-blue-50 text-blue-600 border-blue-200",
};

interface Props {
  place: PlaceCardType;
  featured?: boolean;
}

export default function PlaceCard({ place, featured = false }: Props) {
  const image = place.images?.[0] ?? `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&auto=format`;

  return (
    <Link href={`/places/${place.id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: featured ? 200 : 160 }}>
          <img
            src={image}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Type badge */}
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeColors[place.type] ?? "bg-white text-gray-600"} bg-opacity-95 backdrop-blur-sm`}>
            {typeIcons[place.type]}
            {getPlaceTypeLabel(place.type)}
          </div>
          {/* Price range */}
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-gray-600 border border-gray-200">
            {getPriceRangeLabel(place.priceRange)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-turquoise-600 transition-colors truncate">
            {place.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{place.city}, {place.country}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-800 text-sm">{place.avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">
                ({place.reviewCount} {place.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
            {place.cuisineType && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                {place.cuisineType}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
