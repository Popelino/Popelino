"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  BarChart3,
  Lock,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { FREE_LINK_LIMIT } from "@/lib/plan";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
}

interface Props {
  user: { username: string; plan: string };
  initialLinks: LinkItem[];
}

export default function DashboardClient({ user, initialLinks }: Props) {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const isPro = user.plan === "PRO";
  const atLimit = !isPro && links.length >= FREE_LINK_LIMIT;

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (atLimit) {
      toast.error(`Free plan is limited to ${FREE_LINK_LIMIT} links. Upgrade to add more.`);
      return;
    }
    setAdding(true);
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      toast.error(data.error || "Couldn't add link");
      return;
    }
    setLinks((prev) => [...prev, { id: data.id, title: data.title, url: data.url, active: data.active, clicks: 0 }]);
    setTitle("");
    setUrl("");
  }

  async function toggleActive(link: LinkItem) {
    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !link.active }),
    });
    if (!res.ok) {
      toast.error("Couldn't update link");
      return;
    }
    setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, active: !l.active } : l)));
  }

  async function removeLink(id: string) {
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete link");
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function move(id: string, direction: "up" | "down") {
    const index = links.findIndex((l) => l.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= links.length) return;

    const next = [...links];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setLinks(next);

    const res = await fetch(`/api/links/${id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) {
      toast.error("Couldn't reorder links");
      setLinks(links);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav username={user.username} plan={user.plan} />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Your links</h1>
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            linkroot.app/{user.username} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {atLimit && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>You&apos;ve hit the {FREE_LINK_LIMIT}-link free limit.</span>
            <Link href="/dashboard/settings" className="font-semibold underline">
              Upgrade to Pro
            </Link>
          </div>
        )}

        <form onSubmit={addLink} className="card mb-8 space-y-3 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              placeholder="Title (e.g. My shop)"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="url"
              required
              placeholder="https://..."
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button type="submit" disabled={adding || atLimit} className="btn-primary w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {adding ? "Adding…" : "Add link"}
          </button>
        </form>

        <div className="space-y-3">
          {links.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No links yet — add your first one above.
            </p>
          )}
          {links.map((link, i) => (
            <div key={link.id} className="card flex items-center gap-3 p-4">
              <div className="flex flex-col">
                <button
                  onClick={() => move(link.id, "up")}
                  disabled={i === 0}
                  className="text-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(link.id, "down")}
                  disabled={i === links.length - 1}
                  className="text-gray-300 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{link.title}</p>
                <p className="truncate text-sm text-gray-400">{link.url}</p>
              </div>

              <div className="flex items-center gap-3 text-gray-400">
                {isPro ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <BarChart3 className="h-3.5 w-3.5" /> {link.clicks}
                  </span>
                ) : (
                  <span title="Upgrade to Pro for click analytics">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}
                <button onClick={() => toggleActive(link)} title={link.active ? "Hide" : "Show"}>
                  {link.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => removeLink(link.id)} title="Delete" className="hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
