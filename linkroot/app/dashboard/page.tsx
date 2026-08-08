import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { links: { orderBy: { position: "asc" } } },
  });
  if (!user) redirect("/login");

  return (
    <DashboardClient
      user={{
        username: user.username,
        plan: user.plan,
      }}
      initialLinks={user.links.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        active: l.active,
        clicks: l.clicks,
      }))}
    />
  );
}
