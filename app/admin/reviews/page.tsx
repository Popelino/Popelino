import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import AdminReviewActions from "./AdminReviewActions";
import { Flag, Clock, CheckCircle, XCircle, MessageSquare, Star, ChevronLeft } from "lucide-react";

interface SearchParams {
  status?: string;
  page?: string;
}

const PAGE_SIZE = 20;

async function getReviews(status?: string, page = 1) {
  const where: any = {};
  if (status && ["PENDING", "APPROVED", "FLAGGED", "REJECTED"].includes(status)) {
    where.status = status;
  }

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, nationality: true } },
        place: { select: { id: true, name: true, type: true, city: true } },
      },
    }),
    db.review.count({ where }),
  ]);

  return { reviews, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

const statusConfig = {
  PENDING: { icon: <Clock className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Pending" },
  APPROVED: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600 bg-green-50 border-green-200", label: "Approved" },
  FLAGGED: { icon: <Flag className="w-4 h-4" />, color: "text-orange-600 bg-orange-50 border-orange-200", label: "Flagged" },
  REJECTED: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 border-red-200", label: "Rejected" },
};

export default async function AdminReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const { reviews, total, totalPages } = await getReviews(searchParams.status, page);
  const activeStatus = searchParams.status ?? "";

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (searchParams.status) p.set("status", searchParams.status);
    Object.entries(overrides).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k); });
    return `/admin/reviews?${p.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="btn-ghost p-2">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Review Moderation</h1>
          <p className="text-gray-500 text-sm">{total.toLocaleString()} reviews total</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "", label: "All Reviews" },
          { value: "FLAGGED", label: "Flagged" },
          { value: "PENDING", label: "Pending" },
          { value: "APPROVED", label: "Approved" },
          { value: "REJECTED", label: "Rejected" },
        ].map((f) => (
          <a
            key={f.value}
            href={buildUrl({ status: f.value, page: "1" })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeStatus === f.value
                ? "bg-turquoise-500 text-white border-turquoise-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-turquoise-400"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Reviews table */}
      <div className="card overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No reviews match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => {
              const st = statusConfig[review.status as keyof typeof statusConfig];
              return (
                <div key={review.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: info */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/places/${review.place.id}`} className="font-semibold text-gray-800 hover:text-turquoise-500 transition-colors text-sm">
                          {review.place.name}
                        </Link>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{review.place.type}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{review.place.city}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500">by <strong>{review.user.name}</strong></span>
                        {review.user.nationality && <span className="text-xs text-gray-400">({review.user.nationality})</span>}
                        <span className="text-gray-300">·</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{review.content}</p>

                      {review.flagReason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                          <p className="text-xs font-semibold text-orange-700 mb-0.5 flex items-center gap-1">
                            <Flag className="w-3 h-3" /> AI Flag Reason
                          </p>
                          <p className="text-xs text-orange-600">{review.flagReason}</p>
                          {review.aiAnalysis && (
                            <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-orange-200">{review.aiAnalysis}</p>
                          )}
                        </div>
                      )}

                      {review.adminNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                          <p className="text-xs font-semibold text-blue-700 mb-0.5">Admin Note</p>
                          <p className="text-xs text-blue-600">{review.adminNote}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: status + actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                      {st && (
                        <span className={`badge border text-xs flex items-center gap-1 ${st.color}`}>
                          {st.icon} {st.label}
                        </span>
                      )}
                      <AdminReviewActions reviewId={review.id} currentStatus={review.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && <a href={buildUrl({ page: String(page - 1) })} className="btn-outline text-sm px-4 py-2">← Prev</a>}
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          {page < totalPages && <a href={buildUrl({ page: String(page + 1) })} className="btn-outline text-sm px-4 py-2">Next →</a>}
        </div>
      )}
    </div>
  );
}
