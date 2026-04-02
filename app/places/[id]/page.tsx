import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import { RatingBadge } from "@/components/StarRating";
import {
  MapPin, Phone, Globe, Clock, UtensilsCrossed,
  Wine, Star, ChevronRight, Share2
} from "lucide-react";
import { getPriceRangeLabel, getPlaceTypeLabel } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const SinglePlaceMap = dynamic(
  () => import("@/components/Map").then((m) => m.SinglePlaceMap),
  { ssr: false, loading: () => <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" /> }
);

async function getPlace(id: string) {
  return db.place.findUnique({
    where: { id },
    include: {
      reviews: {
        where: { status: { in: ["APPROVED", "PENDING"] } },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true, nationality: true, birthDate: true } },
        },
      },
      menuItems: { where: { available: true }, orderBy: { category: "asc" } },
      beverages: { where: { available: true }, orderBy: { category: "asc" } },
      owner: { include: { user: { select: { name: true, email: true } } } },
    },
  });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const place = await db.place.findUnique({ where: { id: params.id }, select: { name: true, city: true } });
  if (!place) return {};
  return { title: `${place.name} — ${place.city}` };
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export default async function PlaceDetailPage({ params }: { params: { id: string } }) {
  const place = await getPlace(params.id);
  if (!place) notFound();

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: place.reviews.filter((rev) => rev.rating === r).length,
  }));
  const menuByCategory = groupBy(place.menuItems, "category");
  const beverageByCategory = groupBy(place.beverages, "category");
  const heroImage = place.images?.[0] ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero image */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={heroImage} alt={place.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge bg-turquoise-500 text-white border-0 text-xs font-semibold px-3 py-1">
                {getPlaceTypeLabel(place.type)}
              </span>
              <span className="badge bg-white/20 text-white border-0 text-xs px-3 py-1">
                {getPriceRangeLabel(place.priceRange)}
              </span>
              {place.cuisineType && (
                <span className="badge bg-white/20 text-white border-0 text-xs px-3 py-1">{place.cuisineType}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{place.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{place.address}, {place.city}, {place.country}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
          <a href="/" className="hover:text-turquoise-500 transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/places" className="hover:text-turquoise-500 transition-colors">Places</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 font-medium truncate">{place.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Rating summary */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-extrabold text-gray-800">{place.avgRating.toFixed(1)}</div>
                  <RatingBadge rating={place.avgRating} count={place.reviewCount} />
                  <p className="text-xs text-gray-400 mt-1">{place.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingDist.map(({ rating, count }) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-gray-500 w-4">{rating}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: place.reviewCount ? `${(count / place.reviewCount) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            {place.description && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-800 mb-3">About {place.name}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{place.description}</p>
              </div>
            )}

            {/* Menu */}
            {place.menuItems.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-turquoise-500" /> Menu
                </h2>
                {Object.entries(menuByCategory).map(([category, items]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                          </div>
                          <span className="font-semibold text-turquoise-600 text-sm ml-4 flex-shrink-0">
                            CHF {item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Beverages */}
            {place.beverages.length > 0 && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Wine className="w-5 h-5 text-turquoise-500" /> Drinks
                </h2>
                {Object.entries(beverageByCategory).map(([category, items]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                          </div>
                          <span className="font-semibold text-turquoise-600 text-sm ml-4 flex-shrink-0">
                            CHF {item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-bold text-gray-800 text-xl mb-4">
                Customer Reviews
                <span className="ml-2 text-base font-normal text-gray-400">({place.reviews.length})</span>
              </h2>
              <ReviewForm placeId={place.id} placeName={place.name} />
              <div className="mt-5 space-y-4">
                {place.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review as any} />
                ))}
                {place.reviews.length === 0 && (
                  <div className="card p-8 text-center text-gray-400">
                    <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-5">
            {/* Info card */}
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-800">Contact & Info</h3>
              {place.phone && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${place.phone}`} className="hover:text-turquoise-500 transition-colors">{place.phone}</a>
                </div>
              )}
              {place.website && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={place.website} target="_blank" rel="noopener noreferrer" className="hover:text-turquoise-500 transition-colors truncate">
                    {place.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {place.openingHours && (
                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{place.openingHours}</span>
                </div>
              )}
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{place.address}, {place.city}, {place.country}</span>
              </div>
            </div>

            {/* Map */}
            <div className="card overflow-hidden">
              <SinglePlaceMap lat={place.lat} lng={place.lng} name={place.name} address={place.address} />
            </div>

            {/* Owner info */}
            {place.owner && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Business owner</h3>
                <p className="text-sm text-gray-600">{place.owner.businessName}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
