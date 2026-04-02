"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.role === "OWNER";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-turquoise-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-turquoise-600 transition-colors">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <span className="font-bold text-xl text-gray-800">
              Trust<span className="text-turquoise-500">Taste</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/places" className="btn-ghost text-sm">Browse Places</Link>
            <Link href="/places?type=RESTAURANT" className="btn-ghost text-sm">Restaurants</Link>
            <Link href="/places?type=BAR" className="btn-ghost text-sm">Bars</Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-turquoise-100 rounded-full flex items-center justify-center">
                    <span className="text-turquoise-700 font-semibold text-sm">
                      {session.user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{session.user?.name}</span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    {isOwner && (
                      <Link href="/owner/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Owner Dashboard
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm">Join Free</Link>
              </>
            )}

            <Link
              href="/owner/register"
              className="text-sm font-semibold text-turquoise-600 border border-turquoise-300 hover:bg-turquoise-50 px-4 py-2 rounded-lg transition-colors"
            >
              List a Place
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          <Link href="/places" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Browse Places</Link>
          <Link href="/places?type=RESTAURANT" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Restaurants</Link>
          <Link href="/places?type=BAR" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Bars</Link>
          {session ? (
            <>
              {isAdmin && <Link href="/admin" className="block py-2 text-red-600 font-medium" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
              {isOwner && <Link href="/owner/dashboard" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>Owner Dashboard</Link>}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block py-2 text-gray-500 w-full text-left">Sign out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn-outline text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/register" className="btn-primary text-sm flex-1 text-center" onClick={() => setMobileOpen(false)}>Join Free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
