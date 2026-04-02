import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "TrustTaste — Real Reviews You Can Trust",
    template: "%s | TrustTaste",
  },
  description:
    "Discover honest reviews for restaurants and bars. TrustTaste is powered by real customers with AI-verified reviews.",
  keywords: ["restaurant reviews", "bar reviews", "food", "TrustTaste"],
  openGraph: {
    title: "TrustTaste",
    description: "Real Reviews You Can Trust",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-turquoise-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TT</span>
                    </div>
                    <span className="font-bold text-xl text-gray-800">TrustTaste</span>
                  </div>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Real reviews from real people. Every review is AI-verified for authenticity
                    and relevance so you can trust what you read.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Discover</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="/places" className="hover:text-turquoise-500 transition-colors">Browse Places</a></li>
                    <li><a href="/places?type=RESTAURANT" className="hover:text-turquoise-500 transition-colors">Restaurants</a></li>
                    <li><a href="/places?type=BAR" className="hover:text-turquoise-500 transition-colors">Bars</a></li>
                    <li><a href="/places?type=CAFE" className="hover:text-turquoise-500 transition-colors">Cafés</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Business</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="/owner/register" className="hover:text-turquoise-500 transition-colors">List Your Business</a></li>
                    <li><a href="/owner/dashboard" className="hover:text-turquoise-500 transition-colors">Owner Dashboard</a></li>
                    <li><a href="/owner/pricing" className="hover:text-turquoise-500 transition-colors">Pricing</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-xs text-gray-400">© {new Date().getFullYear()} TrustTaste. All rights reserved.</p>
                <p className="text-xs text-gray-400">Reviews verified by Claude AI</p>
              </div>
            </div>
          </footer>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: "10px", background: "#1e293b", color: "#fff" },
              success: { iconTheme: { primary: "#4ECDC4", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
