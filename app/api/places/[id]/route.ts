import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const place = await db.place.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, nationality: true } },
          },
        },
        menuItems: { where: { available: true } },
        beverages: { where: { available: true } },
        owner: { include: { user: { select: { name: true } } } },
      },
    });

    if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(place);
  } catch (error) {
    console.error("Get place error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
