import { Suspense } from "react";
import { db } from "@/lib/db";
import PlaceCard from "@/components/PlaceCard";
import SearchBar from "@/components/SearchBar";
import { PlaceType } from "@prisma/client";
import { SlidersHorizontal, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const MultiPlaceMap = dynamic(
  () => import("@/components/Map").then((m) => m.MultiPlaceMap),
  { ssr: false, loading: () => <div className="h-full bg-gray-100 rounded-xl animate-pulse" /> }
);

interface SearchParams {
  q?: string;
  type?: string;
  city?: string;
  page?: string;
}

const PAGE_SIZE = 12;

async function getPlaces(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const where: any = { status: undefined };
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { city: { contains: params.q, mode: "insensitive" } },
      { cuisineType: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.type && Object.values(PlaceType).includes(params.type as PlaceType)) {
    where.type = params.type as PlaceType;
  }
  if (params.city) {
    where.city = { contains: params.city, mode: "insensitive" };
  }

  const [places, total] = await Promise.all([
    db.place.findMany({
      where,
      orderBy: { avgRating: "desc" },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true, name: true, type: true, address: true, city: true, country: true,
        lat: true, lng: true, images: true, avgRating: true, reviewCount: true,
        priceRange: true, cuisineType: true,
      },
    }),
    db.place.count({ where }),
  ]);

  return { places, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function PlacesPage({ searchParams }: { searchParams: SearchParams }) {
  const { places, total, page, totalPages } = await getPlaces(searchParams);
  const activeType = searchParams.type ?? "";
  const query = searchParams.q ?? "";

  const types = [
    { value: "", label: "All" },
    { value: "RESTAURANT", label: "Restaurants" },
    { value: "BAR", label: "Bars" },
    { value: "CAFE", label: "Cafés" },
    { value: "BISTRO", label: "Bistros" },
    { value: "CLUB", label: "Clubs" },
  ];

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (searchParams.q) p.set("q", searchParams.q);
    if (searchParams.type) p.set("type", searchParams.type);
    if (searchParams.city) p.set("city", searchParams.city);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    return `/places?${p.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search + filters */}
      <div className="mb-6">
        <SearchBar defaultValue={query} />
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          {types.map((t) => (
            <a
              key={t.value}
              href={buildUrl({ type: t.value, page: "1" })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeType === t.value
                  ? "bg-turquoise-500 text-white border-turquoise-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-turquoise-400 hover:text-turquoise-600"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{total.toLocaleString()}</span> places found
              {query && <span> for "<span className="font-medium">{query}</span>"</span>}
            </p>
          </div>

          {places.length === 0 ? (
            <div className="card p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No places found</h3>
              <p className="text-gray-400 text-sm">Try a different search or browse all places.</p>
              <a href="/places" className="btn-primary mt-4 inline-block text-sm">Browse All Places</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <a href={buildUrl({ page: String(page - 1) })} className="btn-outline text-sm px-4 py-2">
                  ← Prev
                </a>
              )}
              <span className="text-sm text-gray-500 px-4">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <a href={buildUrl({ page: String(page + 1) })} className="btn-outline text-sm px-4 py-2">
                  Next →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Map sidebar */}
        {places.length > 0 && (
          <div className="lg:w-96 xl:w-[480px]">
            <div className="sticky top-20 h-[600px] rounded-xl overflow-hidden shadow-card border border-gray-200">
              <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse" />}>
                <MultiPlaceMap places={places} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
