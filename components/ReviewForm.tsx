"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Send, Lock } from "lucide-react";
import StarRating from "./StarRating";

interface Props {
  placeId: string;
  placeName: string;
}

export default function ReviewForm({ placeId, placeName }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="card p-6 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 bg-turquoise-100 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-turquoise-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">Sign in to write a review</p>
          <p className="text-sm text-gray-500 mt-1">Share your experience at {placeName}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="btn-primary text-sm">Sign in</Link>
          <Link href="/register" className="btn-outline text-sm">Join Free</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const words = content.trim().split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      toast.error("Please write at least a sentence (5+ words) in your review");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, rating, content: content.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit review");
        return;
      }

      if (data.flagged) {
        toast.success("Your review was submitted and is being reviewed by our moderation team.", { duration: 5000 });
      } else {
        toast.success("Review published! Thank you for your feedback.");
      }

      setRating(0);
      setContent("");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-bold text-gray-800">Write a Review</h3>

      {/* Star rating */}
      <div>
        <label className="label">Your Rating *</label>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-sm text-gray-500">
              {["", "Terrible", "Poor", "Average", "Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review text */}
      <div>
        <label className="label">Your Review *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience in detail. What did you like or dislike? Help others make a decision..."
          rows={4}
          className="input resize-none"
          maxLength={2000}
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-400">Minimum one sentence required. Reviews are AI-verified for authenticity.</p>
          <span className="text-xs text-gray-400">{content.length}/2000</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0 || content.trim().length < 10}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
