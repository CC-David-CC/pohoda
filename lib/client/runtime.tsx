"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { HistoryYear } from "@/lib/history";
import type { Place, Prefs, WeatherSnapshot } from "@/lib/types";
import { PREFS_STORAGE_KEY } from "./storage";
import { FORECAST_DAYS } from "@/lib/config";

/** The UI consumes normalized data; provider selection and caching belong to its host. */
export interface WeatherServices {
  weather(prefs: Prefs, signal: AbortSignal): Promise<WeatherSnapshot>;
  places(query: string, locale: string, signal: AbortSignal): Promise<Place[]>;
  reverse(lat: number, lon: number, locale: string, signal: AbortSignal): Promise<Place | null>;
  history(lat: number, lon: number, date: string, signal: AbortSignal): Promise<HistoryYear[]>;
}

/** Implements the four routes already supplied by this repository's Next application. */
export function createHttpServices(apiBase = "/api"): WeatherServices {
  const base = apiBase.replace(/\/+$/, "");
  async function json<T>(path: string, params: URLSearchParams, signal: AbortSignal): Promise<T> {
    const timeout = AbortSignal.timeout(20_000);
    const response = await fetch(`${base}/${path}?${params}`, {
      signal: AbortSignal.any([signal, timeout]),
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    }).catch((error: unknown) => {
      if (timeout.aborted && !signal.aborted) throw new Error("timeout");
      throw error;
    });
    if (!response.ok) {
      let code = response.status === 404 ? "backend_unavailable" : "provider_error";
      try {
        const payload = await response.json();
        if (typeof payload?.error === "string") code = payload.error;
      } catch { /* An absent route can return an HTML page. */ }
      throw new Error(code);
    }
    if (!(response.headers.get("content-type") ?? "").includes("json")) {
      throw new Error("backend_unavailable");
    }
    return response.json() as Promise<T>;
  }
  return {
    weather(prefs, signal) {
      const params = new URLSearchParams({
        lat: String(prefs.place.lat), lon: String(prefs.place.lon),
        id: prefs.place.id, name: prefs.place.name,
        days: String(FORECAST_DAYS),
        ...(base === "/api" ? { provider: prefs.provider } : {}),
      });
      for (const field of ["admin1", "country", "countryCode", "timezone"] as const) {
        if (prefs.place[field]) params.set(field, prefs.place[field]);
      }
      return json<WeatherSnapshot>("weather", params, signal);
    },
    async places(query, locale, signal) {
      const payload = await json<{ results?: Place[] }>("places", new URLSearchParams({
        q: query, lang: locale, count: "8",
      }), signal);
      return payload.results ?? [];
    },
    async reverse(lat, lon, locale, signal) {
      const payload = await json<{ place?: Place }>("places/reverse", new URLSearchParams({
        lat: String(lat), lon: String(lon), lang: locale,
      }), signal);
      return payload.place ?? null;
    },
    async history(lat, lon, date, signal) {
      const payload = await json<{ years?: HistoryYear[] }>("history", new URLSearchParams({
        lat: String(lat), lon: String(lon), date,
      }), signal);
      return Array.isArray(payload.years) ? payload.years : [];
    },
  };
}

export interface AppRuntime {
  embedded: boolean;
  themeRoot: HTMLElement | null;
  scrollElement: HTMLElement | null;
  portalRoot: HTMLElement | null;
  services: WeatherServices;
  /** null means preferences stay in memory for this instance. */
  storageKey: string | null;
  initialPrefs?: Partial<Prefs>;
  signal?: AbortSignal;
  onTitle?: (title: string) => void;
}

const standalone: AppRuntime = {
  embedded: false, themeRoot: null, scrollElement: null, portalRoot: null,
  services: createHttpServices(), storageKey: PREFS_STORAGE_KEY,
};
const RuntimeContext = createContext<AppRuntime>(standalone);

export function RuntimeProvider({ value, children }: { value: AppRuntime; children: ReactNode }) {
  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useAppRuntime(): AppRuntime { return useContext(RuntimeContext); }
