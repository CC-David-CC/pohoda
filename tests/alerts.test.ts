import { describe, expect, it } from "vitest";
import { collectAlerts } from "@/lib/weather/alerts";
import type { CurrentWeather } from "@/lib/types";

function snapshot(overrides: Partial<CurrentWeather>): CurrentWeather {
  return {
    time: "2026-11-05T21:00:00Z",
    temperature: 2,
    feelsLike: null,
    kind: "overcast",
    isDay: false,
    humidity: null,
    pressure: null,
    windSpeed: 8,
    windGust: 20,
    windDirection: 315,
    cloudCover: null,
    precipitation: null,
    visibility: 34000,
    uvIndex: null,
    dewPoint: null,
    ...overrides,
  };
}

describe("collectAlerts", () => {
  it("stays quiet in mild overcast weather", () => {
    expect(collectAlerts(snapshot({}))).toEqual([]);
  });

  it("warns about thunderstorms and hail", () => {
    expect(collectAlerts(snapshot({ kind: "thunder" }))).toContain("warning.thunderstorm");
    expect(collectAlerts(snapshot({ kind: "hail" }))).toContain("warning.thunderstorm");
  });

  it("warns about heavy rain", () => {
    expect(collectAlerts(snapshot({ kind: "heavy-rain" }))).toContain("warning.heavyRain");
    expect(collectAlerts(snapshot({ kind: "rain" }))).not.toContain("warning.heavyRain");
  });

  it("warns about strong sustained wind or gusts", () => {
    expect(collectAlerts(snapshot({ windSpeed: 32 }))).toContain("warning.strongWind");
    expect(collectAlerts(snapshot({ windSpeed: 12, windGust: 55 }))).toContain(
      "warning.strongWind",
    );
    expect(collectAlerts(snapshot({ windSpeed: 29, windGust: 49 }))).not.toContain(
      "warning.strongWind",
    );
  });

  it("warns about heat and hard frost", () => {
    expect(collectAlerts(snapshot({ temperature: 33 }))).toContain("warning.heat");
    expect(collectAlerts(snapshot({ temperature: -11 }))).toContain("warning.frost");
    expect(collectAlerts(snapshot({ temperature: -9 }))).not.toContain("warning.frost");
  });

  it("warns about dense fog only when visibility is really low", () => {
    expect(collectAlerts(snapshot({ kind: "fog", visibility: 300 }))).toContain(
      "warning.fog",
    );
    expect(collectAlerts(snapshot({ kind: "fog", visibility: 2000 }))).not.toContain(
      "warning.fog",
    );
  });

  it("caps the banner at two alerts", () => {
    const alerts = collectAlerts(
      snapshot({ kind: "thunder", windSpeed: 40, temperature: 35 }),
    );
    expect(alerts).toHaveLength(2);
  });
});
