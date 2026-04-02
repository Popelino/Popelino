import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PlaceType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const type = searchParams.get("type") ?? "";
    const city = searchParams.get("city") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "12"));

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { cuisineType: { contains: q, mode: "insensitive" } },
      ];
    }
    if (type && Object.values(PlaceType).includes(type as PlaceType)) {
      where.type = type;
    }
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    const [places, total] = await Promise.all([
      db.place.findMany({
        where,
        orderBy: { avgRating: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true, name: true, type: true, address: true, city: true, country: true,
          lat: true, lng: true, images: true, avgRating: true, reviewCount: true,
          priceRange: true, cuisineType: true,
        },
      }),
      db.place.count({ where }),
    ]);

    return NextResponse.json({ places, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get places error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
