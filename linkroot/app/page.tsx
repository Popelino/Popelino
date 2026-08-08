import Link from "next/link";
import {
  Link2,
  Zap,
  Palette,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Check,
  MousePointerClick,
  UserPlus,
  Share2,
} from "lucide-react";
import MarketingNav from "@/components/MarketingNav";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Link2 className="h-3.5 w-3.5" />
            One link for everything you make
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Your whole internet.
            <br />
            One link in your bio.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Linkroot turns your Instagram, TikTok, or X bio into a fast, beautiful landing page
            for every link that matters — your shop, your newsletter, your latest video. No code,
            live in under a minute.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary w-full sm:w-auto">
              Claim your Linkroot — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-outline w-full sm:w-auto">
              See pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">No credit card required.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Live in three steps
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { icon: UserPlus, title: "Create your page", desc: "Pick a username — linkroot.app/you — and you're set up in seconds." },
            { icon: Link2, title: "Add your links", desc: "Shop, socials, newsletter, latest drop — add as many as you need." },
            { icon: Share2, title: "Share it everywhere", desc: "Drop it in your bio. Every click is tracked automatically." },
          ].map((s) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Instant setup", desc: "No code, no drag-and-drop builder to fight with. Add a link, hit save." },
              { icon: Palette, title: "Themes that don't look templated", desc: "Six hand-designed themes, from clean and minimal to bold gradients." },
              { icon: BarChart3, title: "Click analytics", desc: "See exactly which links get clicked, so you know what's working." },
              { icon: ShieldCheck, title: "Fast & reliable", desc: "Your page loads instantly, everywhere, on every connection." },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Free to start. $4/mo to grow.</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Every Linkroot page starts free. Upgrade to Pro whenever you outgrow it — cancel
          anytime, no questions asked.
        </p>
        <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2 text-sm text-gray-500">
          <MousePointerClick className="h-4 w-4 text-brand-600" />
          Trusted by creators, freelancers &amp; small brands
        </div>
        <Link href="/pricing" className="btn-primary mt-8 inline-flex">
          View plans &amp; pricing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-400 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Linkroot
          </span>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5" /> Built to be simple. Built to last.
          </div>
        </div>
      </footer>
    </div>
  );
}
