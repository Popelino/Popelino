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

    const {
      businessName, placeName, type, description, address, city, country,
      lat, lng, phone, website, cuisineType, priceRange, openingHours,
      menuItems = [], beverages = [],
    } = await req.json();

    if (!businessName || !placeName || !type || !description || !address || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert owner record
    let owner = await db.owner.findUnique({ where: { userId: session.user.id } });

    if (!owner) {
      owner = await db.owner.create({
        data: { userId: session.user.id, businessName },
      });

      // Update user role to OWNER
      await db.user.update({
        where: { id: session.user.id },
        data: { role: "OWNER" },
      });
    } else if (owner.businessName !== businessName) {
      owner = await db.owner.update({
        where: { id: owner.id },
        data: { businessName },
      });
    }

    // Create the place
    const place = await db.place.create({
      data: {
        name: placeName,
        type: type as any,
        description,
        address,
        city,
        country: country || "Switzerland",
        lat: typeof lat === "number" ? lat : 47.3769,
        lng: typeof lng === "number" ? lng : 8.5417,
        phone: phone || null,
        website: website || null,
        cuisineType: cuisineType || null,
        priceRange: priceRange as any || "MEDIUM",
        openingHours: openingHours || null,
        ownerId: owner.id,
        images: [],
        menuItems: {
          create: menuItems
            .filter((m: any) => m.name?.trim())
            .map((m: any) => ({
              name: m.name.trim(),
              description: m.description?.trim() || null,
              price: parseFloat(m.price) || 0,
              category: m.category?.trim() || "General",
            })),
        },
        beverages: {
          create: beverages
            .filter((b: any) => b.name?.trim())
            .map((b: any) => ({
              name: b.name.trim(),
              description: b.description?.trim() || null,
              price: parseFloat(b.price) || 0,
              category: b.category?.trim() || "General",
            })),
        },
      },
    });

    return NextResponse.json({ placeId: place.id, ownerId: owner.id }, { status: 201 });
  } catch (error) {
    console.error("Owner register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
