/**
 * Pure logic behind the wind card scene: wind-force levels, seasons, bare
 * trees and the animation values derived from the live wind. Kept free of
 * React so it can be unit tested (see tests/wind-scene.test.ts).
 */

export type WindLevel = "calm" | "light" | "moderate" | "fresh" | "gale";
export type Season = "winter" | "spring" | "summer" | "autumn";

/** Five force gradations on a Beaufort-like scale, in km/h. */
export function windLevel(speed: number): WindLevel {
  if (speed < 2) return "calm";
  if (speed < 12) return "light";
  if (speed < 20) return "moderate";
  if (speed < 30) return "fresh";
  return "gale";
}

export function seasonOf(date: Date): Season {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "autumn";
}

/** Early spring: March, or the first half of April. */
export function isEarlySpring(date: Date): boolean {
  if (seasonOf(date) !== "spring") return false;
  const month = date.getMonth();
  return month === 2 || (month === 3 && date.getDate() <= 15);
}

/** Broadleaf trees stand bare all winter and in early spring. */
export function treesAreBare(date: Date): boolean {
  return seasonOf(date) === "winter" || isEarlySpring(date);
}

export interface WindScene {
  level: WindLevel;
  season: Season;
  leafless: boolean;
  /** Sway amplitude driver, 0.28..1. */
  strength: number;
  /** Static downwind tilt driver, 0..1. */
  lean: number;
  /** Horizontal push of where the wind blows TO: −1 west … 1 east, 0 = due N/S. */
  pushX: number;
  /** Sign shorthand for CSS: 1 blows right, −1 blows left. */
  flip: 1 | -1;
  /** Precipitation travel in px, 0 in still air → 120 in a gale. */
  drift: number;
  /** Base fall duration for drops and flakes, seconds. */
  fallDur: number;
  /** Sway period for the trees and grass, seconds. */
  swayDur: number;
}

export function computeWindScene(
  speed: number,
  windDirection: number | null,
  date: Date,
): WindScene {
  const level = windLevel(speed);
  const season = seasonOf(date);
  const leafless = treesAreBare(date);
  const strength = Math.max(0.28, Math.min(1, speed / 38));
  const lean = Math.min(1, speed / 45);
  const fromDeg = typeof windDirection === "number" ? windDirection : null;
  const dirX = fromDeg == null ? 1 : Math.sin(((fromDeg + 180) * Math.PI) / 180);
  const pushX = Math.abs(dirX) < 0.15 ? 0 : dirX;
  const drift = Math.round(Math.min(120, Math.max(0, speed) * 2.6) * Math.abs(pushX));
  const fallDur = 7.5 - (Math.min(Math.max(0, speed), 40) / 40) * 5;
  const swayDur = 3.4 - strength * 1.7;
  return {
    level,
    season,
    leafless,
    strength,
    lean,
    pushX,
    flip: pushX === 0 || pushX > 0 ? 1 : -1,
    drift,
    fallDur: Math.round(fallDur * 100) / 100,
    swayDur: Math.round(swayDur * 100) / 100,
  };
}
