"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Flag, RotateCcw } from "lucide-react";

interface Props {
  reviewId: string;
  currentStatus: string;
}

export default function AdminReviewActions({ reviewId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note || undefined }),
      });

      if (res.ok) {
        toast.success(`Review ${status.toLowerCase()}`);
        setNote("");
        setShowNote(false);
        router.refresh();
      } else {
        toast.error("Failed to update review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional admin note..."
          rows={2}
          className="text-xs border border-gray-200 rounded-lg p-2 w-48 resize-none focus:outline-none focus:ring-1 focus:ring-turquoise-400"
        />
      )}
      <div className="flex gap-1.5 flex-wrap justify-end">
        <button
          onClick={() => setShowNote(!showNote)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Note
        </button>
        {currentStatus !== "APPROVED" && (
          <button
            onClick={() => updateStatus("APPROVED")}
            disabled={loading !== null}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {loading === "APPROVED" ? "..." : "Approve"}
          </button>
        )}
        {currentStatus !== "REJECTED" && (
          <button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading !== null}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            {loading === "REJECTED" ? "..." : "Reject"}
          </button>
        )}
        {currentStatus !== "FLAGGED" && (
          <button
            onClick={() => updateStatus("FLAGGED")}
            disabled={loading !== null}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            <Flag className="w-3.5 h-3.5" />
            {loading === "FLAGGED" ? "..." : "Flag"}
          </button>
        )}
        {currentStatus !== "PENDING" && (
          <button
            onClick={() => updateStatus("PENDING")}
            disabled={loading !== null}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {loading === "PENDING" ? "..." : "Reset"}
          </button>
        )}
      </div>
    </div>
  );
}
