import Link from "next/link";
import { db } from "@/lib/db";
import PlaceCard from "@/components/PlaceCard";
import SearchBar from "@/components/SearchBar";
import { Star, Shield, Users, TrendingUp, ArrowRight, MapPin } from "lucide-react";

async function getFeaturedPlaces() {
  return db.place.findMany({
    where: { avgRating: { gte: 4 } },
    orderBy: { avgRating: "desc" },
    take: 6,
    select: {
      id: true, name: true, type: true, address: true, city: true, country: true,
      lat: true, lng: true, images: true, avgRating: true, reviewCount: true,
      priceRange: true, cuisineType: true,
    },
  });
}

async function getStats() {
  const [places, reviews, users] = await Promise.all([
    db.place.count(),
    db.review.count({ where: { status: "APPROVED" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  return { places, reviews, users };
}

export default async function HomePage() {
  const [featuredPlaces, stats] = await Promise.all([getFeaturedPlaces(), getStats()]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-turquoise-600 via-turquoise-500 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Verified Reviews</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
              Real Reviews.<br />
              <span className="text-white opacity-90">Real Trust.</span>
            </h1>
            <p className="text-lg text-white opacity-85 mb-8 max-w-xl">
              Discover restaurants and bars backed by honest, verified customer reviews.
              Every review is checked by AI so you always get the real picture.
            </p>
            <SearchBar />
            <div className="flex items-center gap-6 mt-6 text-sm text-white opacity-80">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-white" />
                <span>{stats.reviews.toLocaleString()} verified reviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{stats.places.toLocaleString()} places listed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{stats.users.toLocaleString()} members</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: "RESTAURANT", label: "Restaurants", emoji: "🍽️", color: "from-orange-400 to-orange-500" },
            { type: "BAR", label: "Bars", emoji: "🍸", color: "from-purple-500 to-purple-600" },
            { type: "CAFE", label: "Cafés", emoji: "☕", color: "from-amber-400 to-amber-500" },
            { type: "BISTRO", label: "Bistros", emoji: "🥐", color: "from-rose-400 to-rose-500" },
          ].map((cat) => (
            <Link
              key={cat.type}
              href={`/places?type=${cat.type}`}
              className={`bg-gradient-to-br ${cat.color} text-white rounded-xl p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-semibold">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Places */}
      {featuredPlaces.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Top Rated Places</h2>
              <p className="text-gray-500 text-sm mt-1">Highest rated by verified customers</p>
            </div>
            <Link href="/places" className="flex items-center gap-1.5 text-turquoise-600 font-semibold text-sm hover:text-turquoise-700 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} featured />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800">How TrustTaste Works</h2>
            <p className="text-gray-500 mt-2">Every review goes through our rigorous verification process</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6 text-turquoise-500" />,
                title: "Real customers review",
                desc: "Only verified account holders can write reviews. Rate from 1–5 stars and share your experience in your own words.",
              },
              {
                icon: <Shield className="w-6 h-6 text-turquoise-500" />,
                title: "AI checks every review",
                desc: "Claude AI analyzes each review for relevance and authenticity — flagging anything suspicious for human review.",
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-turquoise-500" />,
                title: "You get the truth",
                desc: "Only genuine, relevant reviews are published. Owners can respond, and the community stays honest.",
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 bg-turquoise-100 rounded-xl flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-turquoise-500 to-teal-600 rounded-2xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Own a restaurant or bar?</h2>
            <p className="text-white opacity-85">List your business, respond to reviews, and unlock powerful analytics with our premium plan.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/owner/register" className="bg-white text-turquoise-600 hover:bg-turquoise-50 font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-sm">
              List Your Place
            </Link>
            <Link href="/owner/pricing" className="border-2 border-white border-opacity-60 text-white hover:bg-white hover:bg-opacity-10 font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
