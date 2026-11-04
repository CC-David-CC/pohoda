import { describe, expect, it } from "vitest";
import {
  computeWindScene,
  isEarlySpring,
  seasonOf,
  treesAreBare,
  windLevel,
} from "@/lib/wind-scene";

describe("windLevel", () => {
  it("maps speeds onto the five gradations", () => {
    expect(windLevel(0)).toBe("calm");
    expect(windLevel(1.9)).toBe("calm");
    expect(windLevel(2)).toBe("light");
    expect(windLevel(11.9)).toBe("light");
    expect(windLevel(12)).toBe("moderate");
    expect(windLevel(19.9)).toBe("moderate");
    expect(windLevel(20)).toBe("fresh");
    expect(windLevel(29.9)).toBe("fresh");
    expect(windLevel(30)).toBe("gale");
    expect(windLevel(120)).toBe("gale");
  });
});

describe("seasonOf", () => {
  const at = (month: number, day = 15) => new Date(2026, month, day);

  it("splits the year into four seasons", () => {
    expect(seasonOf(at(0))).toBe("winter"); // Jan
    expect(seasonOf(at(11))).toBe("winter"); // Dec
    expect(seasonOf(at(2))).toBe("spring"); // Mar
    expect(seasonOf(at(4))).toBe("spring"); // May
    expect(seasonOf(at(6))).toBe("summer"); // Jul
    expect(seasonOf(at(8))).toBe("autumn"); // Sep
    expect(seasonOf(at(10))).toBe("autumn"); // Nov
  });
});

describe("isEarlySpring / treesAreBare", () => {
  const at = (month: number, day = 15) => new Date(2026, month, day);

  it("marks March and the first half of April as early spring", () => {
    expect(isEarlySpring(at(2))).toBe(true); // Mar 15
    expect(isEarlySpring(at(2, 31))).toBe(true); // Mar 31
    expect(isEarlySpring(at(3, 1))).toBe(true); // Apr 1
    expect(isEarlySpring(at(3, 15))).toBe(true); // Apr 15
    expect(isEarlySpring(at(3, 16))).toBe(false); // Apr 16
    expect(isEarlySpring(at(4, 1))).toBe(false); // May
  });

  it("leaves trees bare in winter and early spring only", () => {
    expect(treesAreBare(at(0))).toBe(true); // Jan
    expect(treesAreBare(at(11))).toBe(true); // Dec
    expect(treesAreBare(at(2))).toBe(true); // Mar
    expect(treesAreBare(at(3, 10))).toBe(true); // Apr 10
    expect(treesAreBare(at(3, 20))).toBe(false); // Apr 20
    expect(treesAreBare(at(9))).toBe(false); // Oct
  });
});

describe("computeWindScene", () => {
  const now = new Date(2026, 10, 5); // Nov 5 → autumn, not bare

  it("scales strength, drift and durations with the wind", () => {
    const calm = computeWindScene(0, 270, now);
    expect(calm.level).toBe("calm");
    expect(calm.drift).toBe(0);
    expect(calm.fallDur).toBe(7.5);

    const gale = computeWindScene(46, 270, now);
    expect(gale.level).toBe("gale");
    expect(gale.strength).toBe(1);
    expect(gale.lean).toBe(1);
    expect(gale.drift).toBe(120); // clamped
    expect(gale.fallDur).toBeCloseTo(2.5);
    expect(gale.swayDur).toBeCloseTo(1.7);
  });

  it("resolves the downwind flip from the compass direction", () => {
    // wind FROM the west (270°) blows TO the east → right
    expect(computeWindScene(20, 270, now).flip).toBe(1);
    expect(computeWindScene(20, 270, now).drift).toBeGreaterThan(0);
    // wind FROM the east (90°) blows TO the west → left
    expect(computeWindScene(20, 90, now).flip).toBe(-1);
    // due north wind: no sideways push, straight fall
    expect(computeWindScene(20, 0, now).pushX).toBe(0);
    expect(computeWindScene(20, 0, now).drift).toBe(0);
    expect(computeWindScene(20, 0, now).flip).toBe(1);
  });

  it("reports bare trees only for winter and early spring", () => {
    expect(computeWindScene(10, 0, new Date(2026, 0, 15)).leafless).toBe(true);
    expect(computeWindScene(10, 0, new Date(2026, 2, 20)).leafless).toBe(true);
    expect(computeWindScene(10, 0, new Date(2026, 3, 20)).leafless).toBe(false);
    expect(computeWindScene(10, 0, now).leafless).toBe(false);
  });

  it("never divides by zero on missing direction", () => {
    const scene = computeWindScene(10, null, now);
    expect(scene.flip).toBe(1);
    expect(scene.drift).toBeGreaterThan(0);
  });
});
