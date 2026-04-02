import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getPriceRangeLabel(range: string): string {
  const map: Record<string, string> = {
    BUDGET: "€",
    MEDIUM: "€€",
    EXPENSIVE: "€€€",
    LUXURY: "€€€€",
  };
  return map[range] ?? "€€";
}

export function getPlaceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    RESTAURANT: "Restaurant",
    BAR: "Bar",
    CAFE: "Café",
    BISTRO: "Bistro",
    CLUB: "Club",
  };
  return map[type] ?? type;
}

export function calculateAge(birthDate: Date | string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getAgeGroup(age: number | null): string {
  if (!age) return "Unknown";
  if (age < 18) return "Under 18";
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}
