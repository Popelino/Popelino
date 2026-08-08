import Link from "next/link";
import { Check, Crown } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { FREE_LINK_LIMIT } from "@/lib/plan";

export default function PricingPage() {
  const freeFeatures = [
    `Up to ${FREE_LINK_LIMIT} links`,
    "2 starter themes",
    "Your custom linkroot.app/you page",
    "Unlimited page views",
  ];

  const proFeatures = [
    "Everything in Free",
    "Unlimited links",
    "All 6 premium themes",
    "Click analytics per link",
    "Remove the Linkroot badge",
    "Priority support",
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Simple, transparent pricing</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Start free, forever. Upgrade only when your page needs to do more.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="card border-2 border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900">Free</h2>
            <div className="my-4 text-4xl font-extrabold text-gray-900">
              $0<span className="text-lg font-normal text-gray-400">/mo</span>
            </div>
            <p className="mb-6 text-sm text-gray-500">Everything you need to launch your page today.</p>
            <ul className="mb-8 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 shrink-0 text-brand-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-outline block w-full text-center">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="card relative overflow-hidden border-2 border-brand-600 p-8">
            <div className="absolute right-0 top-0 rounded-bl-xl bg-brand-600 px-4 py-1 text-xs font-bold text-white">
              MOST POPULAR
            </div>
            <div className="mb-1 flex items-center gap-2">
              <Crown className="h-5 w-5 text-brand-600" />
              <h2 className="text-xl font-bold text-gray-900">Pro</h2>
            </div>
            <div className="my-4 text-4xl font-extrabold text-gray-900">
              $4<span className="text-lg font-normal text-gray-400">/mo</span>
            </div>
            <p className="mb-6 text-sm text-gray-500">For creators and businesses who rely on their page.</p>
            <ul className="mb-8 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 shrink-0 text-brand-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary block w-full text-center">
              Start with Pro
            </Link>
            <p className="mt-3 text-center text-xs text-gray-400">
              Create your free account first, then upgrade anytime from your dashboard.
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          Cancel anytime. No contracts, no hidden fees.
        </p>
      </div>
    </div>
  );
}
