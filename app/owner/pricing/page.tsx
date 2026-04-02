import Link from "next/link";
import { Crown, Check, BarChart2, Globe, Users, TrendingUp, MessageSquare, Star } from "lucide-react";

export default function PricingPage() {
  const freeFeatures = [
    "List up to 3 places",
    "Upload food & drink menu",
    "Respond to customer reviews",
    "Public place profile with map",
    "Basic review management",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "Advanced customer analytics",
    "Age group breakdown",
    "Customer nationality data",
    "Review trend charts",
    "Priority listing in search",
    "Premium badge on profile",
    "Unlimited places",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3">Simple, Transparent Pricing</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Manage your business reputation for free, or unlock powerful customer insights with Premium.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="card p-8 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Free</h2>
          <div className="text-4xl font-extrabold text-gray-800 my-4">
            CHF 0<span className="text-lg font-normal text-gray-400">/mo</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">Perfect to get started and build your reputation.</p>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-turquoise-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/owner/register" className="btn-outline w-full text-center block text-sm">
            Get Started Free
          </Link>
        </div>

        {/* Premium */}
        <div className="card p-8 border-2 border-turquoise-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-turquoise-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
            POPULAR
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-turquoise-500" />
            <h2 className="text-xl font-bold text-gray-800">Premium</h2>
          </div>
          <div className="my-4">
            <div className="text-4xl font-extrabold text-gray-800">
              CHF 10<span className="text-lg font-normal text-gray-400">/mo</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Also available at 10€ / $12 / month</p>
          </div>
          <p className="text-gray-500 text-sm mb-6">Unlock the full potential of your business data.</p>
          <ul className="space-y-3 mb-8">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-turquoise-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm opacity-75 cursor-not-allowed" disabled>
            <Crown className="w-4 h-4" /> Coming Soon
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">Payment integration launching soon</p>
        </div>
      </div>

      {/* Analytics preview */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-8">What you get with Premium Analytics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-6 h-6 text-turquoise-500" />, title: "Age Groups", desc: "See which age demographics visit your place most" },
            { icon: <Globe className="w-6 h-6 text-turquoise-500" />, title: "Nationalities", desc: "Understand where your customers come from" },
            { icon: <TrendingUp className="w-6 h-6 text-turquoise-500" />, title: "Trends", desc: "Track rating trends over time" },
            { icon: <MessageSquare className="w-6 h-6 text-turquoise-500" />, title: "Review Insights", desc: "Sentiment analysis on your reviews" },
          ].map((item) => (
            <div key={item.title} className="card p-5 text-center">
              <div className="w-12 h-12 bg-turquoise-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
