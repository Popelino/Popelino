import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, adminNote } = await req.json();

    if (!["PENDING", "APPROVED", "FLAGGED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const review = await db.review.update({
      where: { id: params.id },
      data: {
        status,
        adminNote: adminNote || null,
      },
      include: { place: { select: { id: true } } },
    });

    // Recalculate place rating if status changes affect visibility
    const allReviews = await db.review.findMany({
      where: { placeId: review.place.id, status: "APPROVED" },
      select: { rating: true },
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length
      : 0;

    await db.place.update({
      where: { id: review.place.id },
      data: { avgRating, reviewCount: allReviews.length },
    });

    return NextResponse.json({ success: true, status: review.status });
  } catch (error) {
    console.error("Admin update review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const review = await db.review.findUnique({
      where: { id: params.id },
      select: { placeId: true },
    });
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.review.delete({ where: { id: params.id } });

    // Recalculate place stats
    const allReviews = await db.review.findMany({
      where: { placeId: review.placeId, status: "APPROVED" },
      select: { rating: true },
    });
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length
      : 0;

    await db.place.update({
      where: { id: review.placeId },
      data: { avgRating, reviewCount: allReviews.length },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
