"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Send, Flag, CheckCircle, Clock } from "lucide-react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";
import type { ReviewWithUser } from "@/lib/types";

interface Props {
  review: ReviewWithUser & { placeName?: string };
}

const statusBadge: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-50 text-amber-600 border-amber-200" },
  APPROVED: { label: "Approved", color: "bg-green-50 text-green-600 border-green-200" },
  FLAGGED: { label: "Flagged by AI", color: "bg-orange-50 text-orange-600 border-orange-200" },
  REJECTED: { label: "Rejected", color: "bg-red-50 text-red-600 border-red-200" },
};

export default function OwnerReviewCard({ review }: Props) {
  const [reply, setReply] = useState(review.ownerReply ?? "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, reply: reply.trim() }),
      });
      if (res.ok) {
        toast.success("Reply posted!");
        setEditing(false);
      } else {
        toast.error("Failed to post reply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const badge = statusBadge[review.status ?? "PENDING"];

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-turquoise-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-turquoise-700 font-bold text-xs">{review.user.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{review.user.name}</p>
            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StarRating value={review.rating} readonly size="sm" />
          {badge && (
            <span className={`badge border text-xs ${badge.color}`}>{badge.label}</span>
          )}
        </div>
      </div>

      {(review as any).placeName && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> {(review as any).placeName}
        </p>
      )}

      <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>

      {review.flagReason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-orange-600 flex items-center gap-1 mb-0.5">
            <Flag className="w-3 h-3" /> AI Flag
          </p>
          <p className="text-xs text-orange-500">{review.flagReason}</p>
        </div>
      )}

      {/* Reply section */}
      {review.ownerReply && !editing ? (
        <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-turquoise-700 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Your Reply
            </p>
            <button onClick={() => setEditing(true)} className="text-xs text-turquoise-500 hover:underline">Edit</button>
          </div>
          <p className="text-xs text-turquoise-800">{review.ownerReply}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {!editing && !review.ownerReply && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-turquoise-600 hover:text-turquoise-700 font-medium flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Reply to this review
            </button>
          )}
          {editing && (
            <>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                placeholder="Thank you for your review..."
                className="input text-sm resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                <button onClick={handleReply} disabled={loading || !reply.trim()} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Send className="w-3 h-3" /> {loading ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
