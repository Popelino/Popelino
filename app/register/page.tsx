"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const NATIONALITIES = [
  "Swiss", "German", "French", "Italian", "Austrian", "British", "American",
  "Spanish", "Portuguese", "Dutch", "Belgian", "Polish", "Romanian",
  "Hungarian", "Czech", "Slovak", "Croatian", "Serbian", "Turkish", "Russian",
  "Ukrainian", "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    birthDate: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          nationality: form.nationality || null,
          birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }

      // Auto sign in
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      toast.success("Account created! Welcome to TrustTaste.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-turquoise-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TT</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">Trust<span className="text-turquoise-500">Taste</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join TrustTaste for free and start reviewing</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Email address *</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nationality</label>
                <select
                  className="input"
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                >
                  <option value="">Select...</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className="input"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-11"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By joining, you agree to write honest reviews and our community guidelines.
            </p>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-turquoise-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
