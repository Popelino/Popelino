import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { reviewId, reply } = await req.json();
    if (!reviewId || !reply?.trim()) {
      return NextResponse.json({ error: "reviewId and reply are required" }, { status: 400 });
    }

    // Verify the review belongs to one of the owner's places
    const owner = await db.owner.findUnique({
      where: { userId: session.user.id },
      include: { places: { select: { id: true } } },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner account not found" }, { status: 403 });
    }

    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { placeId: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const ownsPlace = owner.places.some((p) => p.id === review.placeId);
    if (!ownsPlace && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot respond to this review" }, { status: 403 });
    }

    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        ownerReply: reply.trim(),
        ownerReplyAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Owner respond error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
