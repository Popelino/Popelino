export const FREE_LINK_LIMIT = 5;

export const FREE_THEME_IDS = ["classic", "midnight"];

export function isPro(user: { plan: string }): boolean {
  return user.plan === "PRO";
}
