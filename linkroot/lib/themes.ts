export interface Theme {
  id: string;
  name: string;
  free: boolean;
  page: string;
  card: string;
  text: string;
  subtext: string;
  button: string;
}

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    free: true,
    page: "bg-gray-50",
    card: "bg-white border border-gray-200",
    text: "text-gray-900",
    subtext: "text-gray-500",
    button: "bg-gray-900 text-white hover:bg-gray-800",
  },
  {
    id: "midnight",
    name: "Midnight",
    free: true,
    page: "bg-gradient-to-b from-slate-950 to-slate-800",
    card: "bg-white/5 border border-white/10 backdrop-blur",
    text: "text-white",
    subtext: "text-slate-300",
    button: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
  },
  {
    id: "sunset",
    name: "Sunset",
    free: false,
    page: "bg-gradient-to-b from-orange-400 via-rose-500 to-fuchsia-600",
    card: "bg-white/10 border border-white/20 backdrop-blur",
    text: "text-white",
    subtext: "text-white/80",
    button: "bg-white/20 text-white hover:bg-white/30",
  },
  {
    id: "forest",
    name: "Forest",
    free: false,
    page: "bg-gradient-to-b from-emerald-700 to-teal-950",
    card: "bg-white/5 border border-white/10 backdrop-blur",
    text: "text-white",
    subtext: "text-emerald-100/80",
    button: "bg-emerald-400/20 text-white border border-emerald-300/30 hover:bg-emerald-400/30",
  },
  {
    id: "ocean",
    name: "Ocean",
    free: false,
    page: "bg-gradient-to-b from-cyan-500 to-blue-800",
    card: "bg-white/10 border border-white/20 backdrop-blur",
    text: "text-white",
    subtext: "text-cyan-50/80",
    button: "bg-white/20 text-white hover:bg-white/30",
  },
  {
    id: "mono",
    name: "Mono",
    free: false,
    page: "bg-black",
    card: "bg-transparent border border-white/20",
    text: "text-white",
    subtext: "text-white/60",
    button: "bg-transparent text-white border border-white hover:bg-white hover:text-black",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
