import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate, getAgeGroup, calculateAge } from "@/lib/utils";
import {
  Star, MessageSquare, TrendingUp, Users, Eye, Flag,
  Crown, ChevronRight, Store, Edit, BarChart2, Globe
} from "lucide-react";
import OwnerReviewCard from "@/components/OwnerReviewCard";

async function getOwnerData(userId: string) {
  const owner = await db.owner.findUnique({
    where: { userId },
    include: {
      subscription: true,
      places: {
        include: {
          reviews: {
            include: {
              user: { select: { id: true, name: true, avatar: true, nationality: true, birthDate: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          menuItems: true,
          beverages: true,
        },
      },
    },
  });
  return owner;
}

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/owner/dashboard");
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") redirect("/owner/register");

  const owner = await getOwnerData(session.user.id);
  if (!owner) redirect("/owner/register");

  const isPremium = owner.subscription?.active ?? false;
  const allReviews = owner.places.flatMap((p) => p.reviews.map((r) => ({ ...r, placeName: p.name })));
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0 ? allReviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0;
  const flaggedReviews = allReviews.filter((r) => r.status === "FLAGGED");
  const pendingReplies = allReviews.filter((r) => !r.ownerReply && r.status === "APPROVED");

  // Analytics (premium only)
  let ageGroups: Record<string, number> = {};
  let nationalities: Record<string, number> = {};
  if (isPremium) {
    for (const review of allReviews) {
      const age = calculateAge(review.user.birthDate ?? null);
      const group = getAgeGroup(age);
      ageGroups[group] = (ageGroups[group] ?? 0) + 1;
      if (review.user.nationality) {
        nationalities[review.user.nationality] = (nationalities[review.user.nationality] ?? 0) + 1;
      }
    }
  }

  const topNationalities = Object.entries(nationalities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {session.user.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/owner/register" className="btn-outline text-sm flex items-center gap-1.5">
            <Store className="w-4 h-4" /> Add Place
          </Link>
          {!isPremium && (
            <Link href="/owner/pricing" className="btn-primary text-sm flex items-center gap-1.5">
              <Crown className="w-4 h-4" /> Upgrade to Premium
            </Link>
          )}
        </div>
      </div>

      {/* Premium badge */}
      {isPremium && (
        <div className="bg-gradient-to-r from-turquoise-500 to-teal-500 rounded-xl p-4 mb-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Premium Plan Active</span>
            <span className="text-white/70 text-sm">· Expires {formatDate(owner.subscription!.endDate)}</span>
          </div>
          <span className="text-sm text-white/80">Analytics unlocked</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Reviews", value: totalReviews, icon: <MessageSquare className="w-5 h-5" />, color: "text-turquoise-500" },
          { label: "Average Rating", value: avgRating.toFixed(1), icon: <Star className="w-5 h-5" />, color: "text-amber-500" },
          { label: "Flagged Reviews", value: flaggedReviews.length, icon: <Flag className="w-5 h-5" />, color: "text-orange-500" },
          { label: "Awaiting Reply", value: pendingReplies.length, icon: <Eye className="w-5 h-5" />, color: "text-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Places */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-gray-800">My Places</h2>
          {owner.places.length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">
              <Store className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No places listed yet.
              <Link href="/owner/register" className="block mt-2 text-turquoise-500 font-semibold hover:underline">Add your first place →</Link>
            </div>
          ) : (
            owner.places.map((place) => (
              <div key={place.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{place.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{place.city} · {place.type}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-gray-700">{place.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({place.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <Link href={`/owner/place/${place.id}`} className="p-1.5 text-gray-400 hover:text-turquoise-500 rounded-lg hover:bg-turquoise-50 transition-colors">
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/places/${place.id}`} className="text-xs text-turquoise-600 hover:underline flex items-center gap-0.5">
                    <Eye className="w-3 h-3" /> View page
                  </Link>
                  <span className="text-gray-200">|</span>
                  <Link href={`/owner/place/${place.id}/menu`} className="text-xs text-turquoise-600 hover:underline flex items-center gap-0.5">
                    <Edit className="w-3 h-3" /> Edit menu
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Recent Reviews</h2>
            <span className="text-xs text-gray-400">{totalReviews} total</span>
          </div>
          {allReviews.length === 0 ? (
            <div className="card p-8 text-center text-gray-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No reviews yet on your places.
            </div>
          ) : (
            <div className="space-y-3">
              {allReviews.slice(0, 8).map((review) => (
                <OwnerReviewCard key={review.id} review={review as any} placeName={(review as any).placeName} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium Analytics */}
      {isPremium && totalReviews > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-turquoise-500" />
            <h2 className="font-bold text-gray-800">Customer Analytics</h2>
            <span className="badge bg-turquoise-100 text-turquoise-700 border-0 text-xs">Premium</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age groups */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-turquoise-500" /> Reviewer Age Groups
              </h3>
              <div className="space-y-3">
                {Object.entries(ageGroups).sort(([, a], [, b]) => b - a).map(([group, count]) => {
                  const pct = Math.round((count / totalReviews) * 100);
                  return (
                    <div key={group}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 font-medium">{group}</span>
                        <span className="text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-turquoise-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nationalities */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-turquoise-500" /> Top Nationalities
              </h3>
              <div className="space-y-3">
                {topNationalities.length === 0 ? (
                  <p className="text-sm text-gray-400">No nationality data available yet.</p>
                ) : (
                  topNationalities.map(([nationality, count]) => {
                    const pct = Math.round((count / totalReviews) * 100);
                    return (
                      <div key={nationality}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 font-medium">{nationality}</span>
                          <span className="text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Rating distribution */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-turquoise-500" /> Rating Distribution
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((r) => {
                  const count = allReviews.filter((rev) => rev.rating === r).length;
                  const pct = Math.round((count / totalReviews) * 100);
                  return (
                    <div key={r} className="flex items-center gap-2 text-sm">
                      <span className="w-6 text-gray-500">{r}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade CTA for non-premium */}
      {!isPremium && (
        <div className="mt-8 bg-gradient-to-br from-turquoise-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5" />
                <h3 className="font-bold text-lg">Unlock Premium Analytics</h3>
              </div>
              <p className="text-white/85 text-sm">
                Get insights on your customers: age groups, nationalities, review trends and more.
                Only <strong>10 CHF / 10€ / $12 per month</strong>.
              </p>
            </div>
            <Link href="/owner/pricing" className="bg-white text-turquoise-600 hover:bg-turquoise-50 font-bold px-6 py-3 rounded-xl text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0">
              <Crown className="w-4 h-4" /> Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
