import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const link = await db.link.findUnique({ where: { id: linkId } });

  if (!link || !link.active) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await db.link.update({ where: { id: linkId }, data: { clicks: { increment: 1 } } });

  return NextResponse.redirect(link.url);
}
