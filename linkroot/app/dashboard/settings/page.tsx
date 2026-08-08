import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <SettingsClient
      user={{
        username: user.username,
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        theme: user.theme,
        plan: user.plan,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd
          ? user.stripeCurrentPeriodEnd.toISOString()
          : null,
      }}
    />
  );
}
