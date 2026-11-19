/**
 * Fonts — ten hand-picked typefaces for the interface, all served from
 * operating-system font stacks: nothing is downloaded, so switching is instant
 * and works offline. Applied via html[data-font]; the "system" option is the
 * default stack declared on :root in globals.css.
 */

export const FONTS = [
  "system",
  "grotesk",
  "geometric",
  "humanist",
  "rounded",
  "serif",
  "elegant",
  "slab",
  "condensed",
  "mono",
] as const;

export type FontId = (typeof FONTS)[number];

export const DEFAULT_FONT: FontId = "system";

const FONT_SET = new Set<string>(FONTS);

export function isFont(value: unknown): value is FontId {
  return typeof value === "string" && FONT_SET.has(value);
}

export function applyFont(font: FontId, target?: HTMLElement): void {
  if (typeof document === "undefined") return;
  (target ?? document.documentElement).setAttribute("data-font", font);
}
