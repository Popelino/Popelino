import { formatDate, calculateAge } from "@/lib/utils";
import { Flag, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react";
import StarRating from "./StarRating";
import type { ReviewWithUser } from "@/lib/types";

interface Props {
  review: ReviewWithUser;
  ownerView?: boolean;
  adminView?: boolean;
  onFlag?: (id: string) => void;
}

const statusConfig = {
  PENDING: { icon: <Clock className="w-3.5 h-3.5" />, label: "Pending Review", color: "text-amber-600 bg-amber-50 border-amber-200" },
  APPROVED: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Approved", color: "text-green-600 bg-green-50 border-green-200" },
  FLAGGED: { icon: <Flag className="w-3.5 h-3.5" />, label: "Flagged", color: "text-orange-600 bg-orange-50 border-orange-200" },
  REJECTED: { icon: <XCircle className="w-3.5 h-3.5" />, label: "Rejected", color: "text-red-600 bg-red-50 border-red-200" },
};

export default function ReviewCard({ review, ownerView = false, adminView = false }: Props) {
  const age = calculateAge(review.user.birthDate ?? null);
  const status = statusConfig[review.status as keyof typeof statusConfig];

  // Don't show flagged/rejected reviews to regular users
  if (!ownerView && !adminView && (review.status === "REJECTED")) return null;

  return (
    <div className="card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-turquoise-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-turquoise-700 font-bold text-sm">
              {review.user.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{review.user.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{formatDate(review.createdAt)}</span>
              {review.user.nationality && (
                <>
                  <span>·</span>
                  <span>{review.user.nationality}</span>
                </>
              )}
              {age && (
                <>
                  <span>·</span>
                  <span>{age} years old</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StarRating value={review.rating} readonly size="sm" />
          {(adminView || ownerView) && status && (
            <span className={`badge border text-xs ${status.color} flex items-center gap-1`}>
              {status.icon}
              {status.label}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>

      {/* Admin: Flag reason & AI analysis */}
      {adminView && review.flagReason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-semibold text-orange-700 flex items-center gap-1">
            <Flag className="w-3.5 h-3.5" /> AI Flag Reason
          </p>
          <p className="text-xs text-orange-600">{review.flagReason}</p>
          {review.aiAnalysis && (
            <p className="text-xs text-gray-500 border-t border-orange-200 pt-1.5 mt-1.5">{review.aiAnalysis}</p>
          )}
        </div>
      )}

      {/* Owner reply */}
      {review.ownerReply && (
        <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-3 ml-4">
          <p className="text-xs font-semibold text-turquoise-700 flex items-center gap-1 mb-1">
            <MessageSquare className="w-3.5 h-3.5" /> Owner's Response
            {review.ownerReplyAt && (
              <span className="font-normal text-turquoise-500 ml-1">· {formatDate(review.ownerReplyAt)}</span>
            )}
          </p>
          <p className="text-xs text-turquoise-800">{review.ownerReply}</p>
        </div>
      )}
    </div>
  );
}
