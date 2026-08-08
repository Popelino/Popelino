import Link from "next/link";
import { Link2 } from "lucide-react";

export default function MarketingNav() {
  return (
    <header className="border-b border-gray-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Link2 className="h-4 w-4" />
          </span>
          Linkroot
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/pricing" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link href="/register" className="btn-primary !px-4 !py-2 text-sm">
            Get started free
          </Link>
        </div>
      </nav>
    </header>
  );
}
