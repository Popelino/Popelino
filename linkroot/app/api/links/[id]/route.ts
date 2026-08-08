import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidUrl } from "@/lib/utils";

async function requireOwnedLink(id: string, userId: string) {
  const link = await db.link.findUnique({ where: { id } });
  if (!link || link.userId !== userId) return null;
  return link;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await requireOwnedLink(id, session.user.id);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: { title?: string; url?: string; icon?: string | null; active?: boolean } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title || title.length > 80) {
      return NextResponse.json({ error: "Title is required (max 80 characters)" }, { status: 400 });
    }
    data.title = title;
  }
  if (typeof body.url === "string") {
    if (!isValidUrl(body.url)) {
      return NextResponse.json({ error: "Enter a valid http(s) URL" }, { status: 400 });
    }
    data.url = body.url.trim();
  }
  if (typeof body.icon === "string" || body.icon === null) {
    data.icon = body.icon;
  }
  if (typeof body.active === "boolean") {
    data.active = body.active;
  }

  const updated = await db.link.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await requireOwnedLink(id, session.user.id);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.link.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
