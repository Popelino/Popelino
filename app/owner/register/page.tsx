"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Store, MapPin, UtensilsCrossed, Wine, Plus, Trash2, Lock } from "lucide-react";

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

interface Beverage {
  name: string;
  description: string;
  price: string;
  category: string;
}

const PLACE_TYPES = ["RESTAURANT", "BAR", "CAFE", "BISTRO", "CLUB"];
const PRICE_RANGES = ["BUDGET", "MEDIUM", "EXPENSIVE", "LUXURY"];
const PRICE_LABELS: Record<string, string> = { BUDGET: "€ Budget", MEDIUM: "€€ Medium", EXPENSIVE: "€€€ Expensive", LUXURY: "€€€€ Luxury" };

export default function OwnerRegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [info, setInfo] = useState({
    businessName: "",
    placeName: "",
    type: "RESTAURANT",
    description: "",
    address: "",
    city: "",
    country: "Switzerland",
    lat: "",
    lng: "",
    phone: "",
    website: "",
    cuisineType: "",
    priceRange: "MEDIUM",
    openingHours: "",
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: "", description: "", price: "", category: "Starters" },
  ]);
  const [beverages, setBeverages] = useState<Beverage[]>([
    { name: "", description: "", price: "", category: "Soft Drinks" },
  ]);

  const addMenuItem = () => setMenuItems([...menuItems, { name: "", description: "", price: "", category: "Main Courses" }]);
  const removeMenuItem = (i: number) => setMenuItems(menuItems.filter((_, idx) => idx !== i));
  const updateMenuItem = (i: number, key: keyof MenuItem, value: string) => {
    setMenuItems(menuItems.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  };

  const addBeverage = () => setBeverages([...beverages, { name: "", description: "", price: "", category: "Cocktails" }]);
  const removeBeverage = (i: number) => setBeverages(beverages.filter((_, idx) => idx !== i));
  const updateBeverage = (i: number, key: keyof Beverage, value: string) => {
    setBeverages(beverages.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...info,
          lat: parseFloat(info.lat) || 47.3769,
          lng: parseFloat(info.lng) || 8.5417,
          menuItems: menuItems.filter((m) => m.name.trim()),
          beverages: beverages.filter((b) => b.name.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }

      toast.success("Your place has been listed! You can now manage it from the dashboard.");
      router.push("/owner/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-sm w-full">
          <Lock className="w-12 h-12 text-turquoise-300 mx-auto mb-4" />
          <h2 className="font-bold text-gray-800 text-xl mb-2">Sign in required</h2>
          <p className="text-gray-500 text-sm mb-5">You need an account to list your business on TrustTaste.</p>
          <div className="flex gap-2">
            <Link href="/login" className="btn-primary flex-1 text-sm text-center">Sign in</Link>
            <Link href="/register" className="btn-outline flex-1 text-sm text-center">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-6 h-6 text-turquoise-500" />
          <h1 className="text-2xl font-bold text-gray-800">List Your Business</h1>
        </div>
        <p className="text-gray-500 text-sm">Add your restaurant or bar to TrustTaste and start engaging with customers.</p>

        {/* Steps */}
        <div className="flex items-center gap-2 mt-5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-turquoise-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-1 rounded-full transition-colors ${step > s ? "bg-turquoise-500" : "bg-gray-200"}`} />}
            </div>
          ))}
          <div className="ml-4 text-sm text-gray-500">
            {step === 1 && "Business Info"}{step === 2 && "Menu"}{step === 3 && "Drinks"}
          </div>
        </div>
      </div>

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Store className="w-4 h-4 text-turquoise-500" /> Business Details</h2>

          <div>
            <label className="label">Your Business / Owner Name *</label>
            <input className="input" placeholder="e.g. Smith Hospitality Group" value={info.businessName}
              onChange={(e) => setInfo({ ...info, businessName: e.target.value })} />
          </div>

          <div>
            <label className="label">Place Name *</label>
            <input className="input" placeholder="e.g. The Golden Fork" value={info.placeName}
              onChange={(e) => setInfo({ ...info, placeName: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type *</label>
              <select className="input" value={info.type} onChange={(e) => setInfo({ ...info, type: e.target.value })}>
                {PLACE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price Range</label>
              <select className="input" value={info.priceRange} onChange={(e) => setInfo({ ...info, priceRange: e.target.value })}>
                {PRICE_RANGES.map((p) => <option key={p} value={p}>{PRICE_LABELS[p]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Cuisine Type</label>
            <input className="input" placeholder="e.g. Italian, Swiss, International" value={info.cuisineType}
              onChange={(e) => setInfo({ ...info, cuisineType: e.target.value })} />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={3} placeholder="Describe your place, atmosphere, specialties..."
              value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} />
          </div>

          <div>
            <label className="label">Street Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" placeholder="Bahnhofstrasse 1" value={info.address}
                onChange={(e) => setInfo({ ...info, address: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City *</label>
              <input className="input" placeholder="Zurich" value={info.city}
                onChange={(e) => setInfo({ ...info, city: e.target.value })} />
            </div>
            <div>
              <label className="label">Country *</label>
              <input className="input" placeholder="Switzerland" value={info.country}
                onChange={(e) => setInfo({ ...info, country: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input className="input" type="number" step="any" placeholder="47.3769" value={info.lat}
                onChange={(e) => setInfo({ ...info, lat: e.target.value })} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input" type="number" step="any" placeholder="8.5417" value={info.lng}
                onChange={(e) => setInfo({ ...info, lng: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Find coordinates at <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-turquoise-500">openstreetmap.org</a> — right-click your location.</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+41 44 000 00 00" value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" placeholder="https://yourplace.ch" value={info.website}
                onChange={(e) => setInfo({ ...info, website: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Opening Hours</label>
            <textarea className="input resize-none" rows={2} placeholder="Mon-Fri: 11:00–22:00&#10;Sat-Sun: 12:00–23:00"
              value={info.openingHours} onChange={(e) => setInfo({ ...info, openingHours: e.target.value })} />
          </div>

          <button
            onClick={() => {
              if (!info.businessName || !info.placeName || !info.description || !info.address || !info.city) {
                toast.error("Please fill in all required fields");
                return;
              }
              setStep(2);
            }}
            className="btn-primary w-full"
          >
            Next: Add Menu →
          </button>
        </div>
      )}

      {/* Step 2: Menu */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-turquoise-500" /> Food Menu</h2>
          <p className="text-sm text-gray-500">Add your menu items. You can edit these any time from your dashboard.</p>

          {menuItems.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative border border-gray-100">
              <button onClick={() => removeMenuItem(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Item Name *</label>
                  <input className="input text-sm" placeholder="Margherita Pizza" value={item.name}
                    onChange={(e) => updateMenuItem(i, "name", e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Category</label>
                  <input className="input text-sm" placeholder="Starters / Main / Desserts" value={item.category}
                    onChange={(e) => updateMenuItem(i, "category", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label text-xs">Description</label>
                  <input className="input text-sm" placeholder="Short description..." value={item.description}
                    onChange={(e) => updateMenuItem(i, "description", e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Price (CHF)</label>
                  <input className="input text-sm" type="number" step="0.1" placeholder="18.50" value={item.price}
                    onChange={(e) => updateMenuItem(i, "price", e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addMenuItem} className="w-full border-2 border-dashed border-gray-200 hover:border-turquoise-400 text-gray-400 hover:text-turquoise-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add menu item
          </button>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">Next: Add Drinks →</button>
          </div>
        </div>
      )}

      {/* Step 3: Beverages */}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Wine className="w-4 h-4 text-turquoise-500" /> Drinks Menu</h2>
          <p className="text-sm text-gray-500">Add your drinks. You can update this any time.</p>

          {beverages.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative border border-gray-100">
              <button onClick={() => removeBeverage(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Drink Name *</label>
                  <input className="input text-sm" placeholder="Espresso / Mojito / House Wine" value={item.name}
                    onChange={(e) => updateBeverage(i, "name", e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Category</label>
                  <input className="input text-sm" placeholder="Coffee / Cocktails / Wine" value={item.category}
                    onChange={(e) => updateBeverage(i, "category", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label text-xs">Description</label>
                  <input className="input text-sm" placeholder="Optional details..." value={item.description}
                    onChange={(e) => updateBeverage(i, "description", e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Price (CHF)</label>
                  <input className="input text-sm" type="number" step="0.1" placeholder="4.50" value={item.price}
                    onChange={(e) => updateBeverage(i, "price", e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addBeverage} className="w-full border-2 border-dashed border-gray-200 hover:border-turquoise-400 text-gray-400 hover:text-turquoise-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add drink
          </button>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1">← Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? "Listing your place..." : "Submit & List Place ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
