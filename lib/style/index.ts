/**
 * Styles — the design-language layer that sits on top of colour themes.
 * A theme only swaps colours; a style changes the whole look and feel:
 * surfaces, corners, shadows, glows and the background treatment.
 * Styles are applied via html[data-style] and must stay after the
 * [data-theme] blocks in globals.css so they win the cascade.
 *
 * Most styles derive everything from the active theme's tokens, so they
 * combine with any theme. Three of them — aurora, neon and vaporwave — are
 * inherently dark looks and bring their own palette, like a theme would.
 */

export const STYLES = [
  "liquid-glass",
  "flat",
  "skeuomorphism",
  "aurora",
  "neon",
  "brutalism",
  "claymorphism",
  "vaporwave",
  "minimalism",
] as const;

export type StyleId = (typeof STYLES)[number];

export const DEFAULT_STYLE: StyleId = "liquid-glass";

const STYLE_SET = new Set<string>(STYLES);

export function isStyle(value: unknown): value is StyleId {
  return typeof value === "string" && STYLE_SET.has(value);
}

export function applyStyle(style: StyleId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-style", style);
}
