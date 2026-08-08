import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const direction = body?.direction === "up" || body?.direction === "down" ? body.direction : null;
  if (!direction) {
    return NextResponse.json({ error: "direction must be 'up' or 'down'" }, { status: 400 });
  }

  const links = await db.link.findMany({
    where: { userId: session.user.id },
    orderBy: { position: "asc" },
  });

  const index = links.findIndex((l) => l.id === id);
  if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= links.length) {
    return NextResponse.json({ ok: true });
  }

  const a = links[index];
  const b = links[swapIndex];

  await db.$transaction([
    db.link.update({ where: { id: a.id }, data: { position: b.position } }),
    db.link.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);

  return NextResponse.json({ ok: true });
}
