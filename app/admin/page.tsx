import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Flag, CheckCircle, XCircle, Clock, Store, Users,
  MessageSquare, Shield, TrendingUp, Star, AlertTriangle
} from "lucide-react";

async function getAdminStats() {
  const [
    totalPlaces, totalUsers, totalReviews,
    flaggedReviews, pendingReviews, approvedReviews
  ] = await Promise.all([
    db.place.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.review.count(),
    db.review.count({ where: { status: "FLAGGED" } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.review.count({ where: { status: "APPROVED" } }),
  ]);

  const recentFlagged = await db.review.findMany({
    where: { status: "FLAGGED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true } },
      place: { select: { name: true, type: true } },
    },
  });

  const recentPlaces = await db.place.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, type: true, city: true, reviewCount: true, createdAt: true },
  });

  return { totalPlaces, totalUsers, totalReviews, flaggedReviews, pendingReviews, approvedReviews, recentFlagged, recentPlaces };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 text-sm">TrustTaste moderation & management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Places", value: stats.totalPlaces, icon: <Store className="w-4 h-4" />, color: "text-turquoise-500", bg: "bg-turquoise-50" },
          { label: "Users", value: stats.totalUsers, icon: <Users className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Total Reviews", value: stats.totalReviews, icon: <MessageSquare className="w-4 h-4" />, color: "text-gray-500", bg: "bg-gray-50" },
          { label: "Approved", value: stats.approvedReviews, icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500", bg: "bg-green-50" },
          { label: "Pending", value: stats.pendingReviews, icon: <Clock className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Flagged", value: stats.flaggedReviews, icon: <Flag className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center ${stat.color} mb-2`}>
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Alert for flagged reviews */}
      {stats.flaggedReviews > 0 && (
        <Link href="/admin/reviews?status=FLAGGED" className="block mb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between hover:bg-orange-100 transition-colors">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-800">
                  {stats.flaggedReviews} review{stats.flaggedReviews !== 1 ? "s" : ""} need your attention
                </p>
                <p className="text-sm text-orange-600">AI has flagged these reviews as potentially irrelevant or fake</p>
              </div>
            </div>
            <span className="text-orange-600 font-semibold text-sm">Review now →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/reviews", icon: <MessageSquare className="w-4 h-4" />, label: "Manage All Reviews", desc: "Approve, reject, or flag reviews", badge: stats.flaggedReviews > 0 ? `${stats.flaggedReviews} flagged` : null, badgeColor: "bg-red-100 text-red-600" },
              { href: "/admin/reviews?status=FLAGGED", icon: <Flag className="w-4 h-4" />, label: "Flagged Reviews", desc: "AI-flagged reviews for deeper review", badge: stats.flaggedReviews > 0 ? String(stats.flaggedReviews) : null, badgeColor: "bg-orange-100 text-orange-600" },
              { href: "/admin/reviews?status=PENDING", icon: <Clock className="w-4 h-4" />, label: "Pending Reviews", desc: "Reviews awaiting moderation", badge: stats.pendingReviews > 0 ? String(stats.pendingReviews) : null, badgeColor: "bg-amber-100 text-amber-600" },
              { href: "/admin/places", icon: <Store className="w-4 h-4" />, label: "Manage Places", desc: "View and edit all listed places", badge: null, badgeColor: "" },
              { href: "/admin/users", icon: <Users className="w-4 h-4" />, label: "Manage Users", desc: "View customers and owners", badge: null, badgeColor: "" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-turquoise-50 rounded-lg flex items-center justify-center text-turquoise-500 group-hover:bg-turquoise-100 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                {item.badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent flagged reviews */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Latest Flagged Reviews</h2>
            <Link href="/admin/reviews?status=FLAGGED" className="text-xs text-turquoise-600 hover:underline">View all</Link>
          </div>

          {stats.recentFlagged.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
              No flagged reviews. Everything looks good!
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentFlagged.map((review) => (
                <Link key={review.id} href={`/admin/reviews/${review.id}`} className="block p-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">{review.place.name}</p>
                      <p className="text-xs text-gray-500">by {review.user.name} · {formatDate(review.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-1.5 line-clamp-2">{review.flagReason}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent places */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Recently Added Places</h2>
          <Link href="/admin/places" className="text-xs text-turquoise-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">City</th>
                <th className="pb-2 font-medium">Reviews</th>
                <th className="pb-2 font-medium">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 font-medium text-gray-800">
                    <Link href={`/places/${place.id}`} className="hover:text-turquoise-500 transition-colors">{place.name}</Link>
                  </td>
                  <td className="py-2.5 text-gray-500">{place.type}</td>
                  <td className="py-2.5 text-gray-500">{place.city}</td>
                  <td className="py-2.5 text-gray-500">{place.reviewCount}</td>
                  <td className="py-2.5 text-gray-400 text-xs">{formatDate(place.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
