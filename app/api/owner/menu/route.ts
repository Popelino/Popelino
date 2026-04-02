import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { placeId, menuItems = [], beverages = [] } = await req.json();
    if (!placeId) return NextResponse.json({ error: "placeId required" }, { status: 400 });

    // Verify ownership
    const owner = await db.owner.findUnique({
      where: { userId: session.user.id },
      include: { places: { select: { id: true } } },
    });
    if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 403 });

    const ownsPlace = owner.places.some((p) => p.id === placeId);
    if (!ownsPlace && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Replace menu items
    await db.menuItem.deleteMany({ where: { placeId } });
    if (menuItems.length > 0) {
      await db.menuItem.createMany({
        data: menuItems
          .filter((m: any) => m.name?.trim())
          .map((m: any) => ({
            placeId,
            name: m.name.trim(),
            description: m.description?.trim() || null,
            price: parseFloat(m.price) || 0,
            category: m.category?.trim() || "General",
            available: m.available !== false,
          })),
      });
    }

    // Replace beverages
    await db.beverage.deleteMany({ where: { placeId } });
    if (beverages.length > 0) {
      await db.beverage.createMany({
        data: beverages
          .filter((b: any) => b.name?.trim())
          .map((b: any) => ({
            placeId,
            name: b.name.trim(),
            description: b.description?.trim() || null,
            price: parseFloat(b.price) || 0,
            category: b.category?.trim() || "General",
            available: b.available !== false,
          })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
