import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Linkroot — One link for everything you make",
  description:
    "Linkroot turns your Instagram, TikTok, or X bio into a fast, clean landing page for all your links. Free to start, live in 60 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
