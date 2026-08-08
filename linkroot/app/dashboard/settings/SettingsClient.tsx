"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Crown, Lock, Check } from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface Props {
  user: {
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    theme: string;
    plan: string;
    stripeCurrentPeriodEnd: string | null;
  };
}

export default function SettingsClient({ user }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [theme, setTheme] = useState(user.theme);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const isPro = user.plan === "PRO";

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, avatarUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Couldn't save profile");
      return;
    }
    toast.success("Profile saved");
  }

  async function selectTheme(id: string, free: boolean) {
    if (!free && !isPro) {
      toast.error("That theme is a Pro feature. Upgrade to unlock it.");
      return;
    }
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: id }),
    });
    if (!res.ok) {
      toast.error("Couldn't update theme");
      return;
    }
    setTheme(id);
    toast.success("Theme updated");
  }

  async function upgrade() {
    setBillingLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    setBillingLoading(false);
    if (!res.ok || !data.url) {
      toast.error(data.error || "Couldn't start checkout");
      return;
    }
    window.location.href = data.url;
  }

  async function manageBilling() {
    setBillingLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setBillingLoading(false);
    if (!res.ok || !data.url) {
      toast.error(data.error || "Couldn't open billing portal");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav username={user.username} plan={user.plan} />

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
        {/* Profile */}
        <form onSubmit={saveProfile} className="card space-y-4 p-6">
          <h2 className="font-bold text-gray-900">Profile</h2>
          <div>
            <label className="label">Display name</label>
            <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              className="input resize-none"
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Avatar URL</label>
            <input
              className="input"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>

        {/* Theme */}
        <div className="card space-y-4 p-6">
          <h2 className="font-bold text-gray-900">Theme</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEMES.map((t) => {
              const locked = !t.free && !isPro;
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTheme(t.id, t.free)}
                  className={cn(
                    "relative flex h-20 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold",
                    t.page,
                    t.text,
                    active ? "ring-2 ring-brand-600 ring-offset-2" : "opacity-90 hover:opacity-100"
                  )}
                >
                  {locked && <Lock className="h-3.5 w-3.5" />}
                  {active && !locked && <Check className="h-3.5 w-3.5" />}
                  {t.name}
                </button>
              );
            })}
          </div>
          {!isPro && (
            <p className="text-xs text-gray-400">
              Premium themes are a Pro feature. Upgrade to unlock all 6.
            </p>
          )}
        </div>

        {/* Billing */}
        <div className="card space-y-4 p-6">
          <h2 className="font-bold text-gray-900">Billing</h2>
          {isPro ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Crown className="h-4 w-4 text-amber-500" />
                You&apos;re on the <span className="font-semibold">Pro</span> plan.
                {user.stripeCurrentPeriodEnd && (
                  <span className="text-gray-400">
                    Renews {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button onClick={manageBilling} disabled={billingLoading} className="btn-outline">
                {billingLoading ? "Loading…" : "Manage billing"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                You&apos;re on the Free plan. Upgrade to Pro for unlimited links, all themes, and
                click analytics — $4/mo.
              </p>
              <button onClick={upgrade} disabled={billingLoading} className="btn-primary">
                {billingLoading ? "Loading…" : "Upgrade to Pro"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
