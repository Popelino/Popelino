import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isValidUsername } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = String(body.email || "").toLowerCase().trim();
  const username = String(body.username || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username must be 3-30 characters: lowercase letters, numbers, hyphens." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: existing.email === email ? "Email already registered" : "Username already taken" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: username,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, username: user.username });
}
