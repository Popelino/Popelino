import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPro } from "@/lib/plan";
import { getTheme, THEMES } from "@/lib/themes";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: { displayName?: string; bio?: string; avatarUrl?: string | null; theme?: string } = {};

  if (typeof body.displayName === "string") {
    data.displayName = body.displayName.trim().slice(0, 60);
  }
  if (typeof body.bio === "string") {
    data.bio = body.bio.trim().slice(0, 200);
  }
  if (typeof body.avatarUrl === "string" || body.avatarUrl === null) {
    data.avatarUrl = body.avatarUrl;
  }
  if (typeof body.theme === "string") {
    const theme = getTheme(body.theme);
    if (!THEMES.some((t) => t.id === body.theme)) {
      return NextResponse.json({ error: "Unknown theme" }, { status: 400 });
    }
    if (!theme.free && !isPro(user)) {
      return NextResponse.json({ error: "That theme is a Pro feature. Upgrade to unlock it." }, { status: 403 });
    }
    data.theme = theme.id;
  }

  const updated = await db.user.update({ where: { id: user.id }, data });
  return NextResponse.json({
    displayName: updated.displayName,
    bio: updated.bio,
    avatarUrl: updated.avatarUrl,
    theme: updated.theme,
  });
}
