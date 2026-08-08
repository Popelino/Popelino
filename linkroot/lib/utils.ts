import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const RESERVED_USERNAMES = [
  "login",
  "register",
  "logout",
  "dashboard",
  "pricing",
  "api",
  "r",
  "settings",
  "admin",
  "about",
  "terms",
  "privacy",
  "linkroot",
  "www",
  "app",
  "help",
  "support",
  "static",
  "assets",
  "favicon.ico",
];

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username) && !RESERVED_USERNAMES.includes(username);
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
