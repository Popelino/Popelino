import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { moderateReview } from "@/lib/claude";
import { sendFlaggedReviewEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "You must be signed in to write a review" }, { status: 401 });
    }

    const { placeId, rating, content } = await req.json();

    // Validation
    if (!placeId || !rating || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    const words = content.trim().split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      return NextResponse.json({ error: "Review must be at least one sentence (5+ words)" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Review cannot exceed 2000 characters" }, { status: 400 });
    }

    // Check place exists
    const place = await db.place.findUnique({
      where: { id: placeId },
      select: { id: true, name: true, type: true, description: true },
    });
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    // Check for duplicate review from same user
    const existing = await db.review.findFirst({
      where: { userId: session.user.id, placeId },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this place" }, { status: 409 });
    }

    // AI moderation via Claude
    const moderation = await moderateReview(
      content,
      rating,
      place.name,
      place.type,
      place.description
    );

    const status = moderation.isFlagged ? "FLAGGED" : "APPROVED";

    // Create review
    const review = await db.review.create({
      data: {
        userId: session.user.id,
        placeId,
        rating,
        content: content.trim(),
        status,
        flagReason: moderation.isFlagged ? moderation.reason : null,
        aiAnalysis: moderation.analysis,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    // Update place stats
    const allReviews = await db.review.findMany({
      where: { placeId, status: "APPROVED" },
      select: { rating: true },
    });
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length
      : 0;

    await db.place.update({
      where: { id: placeId },
      data: { avgRating, reviewCount: allReviews.length },
    });

    // Send email notification for flagged reviews
    if (moderation.isFlagged) {
      try {
        await sendFlaggedReviewEmail({
          reviewId: review.id,
          placeName: place.name,
          placeType: place.type,
          reviewerName: review.user.name,
          reviewContent: content,
          rating,
          flagReason: moderation.reason ?? "AI flagged this review",
          aiAnalysis: moderation.analysis,
          confidence: moderation.confidence,
        });
      } catch (emailError) {
        console.error("Failed to send flagged review email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ review, flagged: moderation.isFlagged }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
