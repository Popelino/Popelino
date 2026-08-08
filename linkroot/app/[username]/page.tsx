import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { getTheme } from "@/lib/themes";
import { isPro } from "@/lib/plan";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username },
    include: { links: { where: { active: true }, orderBy: { position: "asc" } } },
  });

  if (!user) notFound();

  const theme = getTheme(user.theme);
  const showBadge = !isPro(user);

  return (
    <div className={cn("flex min-h-screen flex-col items-center px-4 py-16", theme.page)}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName || user.username}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover shadow-md"
            />
          ) : (
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold",
                theme.card,
                theme.text
              )}
            >
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={cn("mt-4 text-xl font-bold", theme.text)}>
            {user.displayName || user.username}
          </h1>
          <p className={cn("text-sm", theme.subtext)}>@{user.username}</p>
          {user.bio && <p className={cn("mt-3 text-sm", theme.subtext)}>{user.bio}</p>}
        </div>

        <div className="mt-8 space-y-3">
          {user.links.map((link) => (
            <a
              key={link.id}
              href={`/r/${link.id}`}
              className={cn(
                "block rounded-xl px-5 py-3.5 text-center text-sm font-semibold shadow-sm transition-transform hover:scale-[1.01]",
                theme.button
              )}
            >
              {link.title}
            </a>
          ))}
          {user.links.length === 0 && (
            <p className={cn("text-center text-sm", theme.subtext)}>No links yet.</p>
          )}
        </div>

        {showBadge && (
          <div className="mt-10 text-center">
            <a
              href="/"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium opacity-80 hover:opacity-100",
                theme.card,
                theme.text
              )}
            >
              Made with Linkroot
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
