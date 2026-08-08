import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { FREE_LINK_LIMIT, isPro } from "@/lib/plan";
import { isValidUrl } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = String(body?.title || "").trim();
  const url = String(body?.url || "").trim();

  if (!title || title.length > 80) {
    return NextResponse.json({ error: "Title is required (max 80 characters)" }, { status: 400 });
  }
  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "Enter a valid http(s) URL" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await db.link.count({ where: { userId: user.id } });
  if (!isPro(user) && count >= FREE_LINK_LIMIT) {
    return NextResponse.json(
      { error: `Free plan is limited to ${FREE_LINK_LIMIT} links. Upgrade to Pro for unlimited links.` },
      { status: 403 }
    );
  }

  const link = await db.link.create({
    data: { userId: user.id, title, url, position: count },
  });

  return NextResponse.json(link);
}
