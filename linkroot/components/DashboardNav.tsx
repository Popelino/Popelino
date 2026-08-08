"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Link2, LayoutDashboard, Settings, ExternalLink, LogOut, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardNav({ username, plan }: { username: string; plan: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard", label: "Links", icon: LayoutDashboard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Link2 className="h-4 w-4" />
          </span>
          Linkroot
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === t.href ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </Link>
          ))}
          {plan === "PRO" && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 sm:flex">
              <Crown className="h-3 w-3" /> Pro
            </span>
          )}
          <a
            href={`/${username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">View page</span>
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
