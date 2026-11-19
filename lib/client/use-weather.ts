"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { REFRESH_MS } from "@/lib/config";
import type { Prefs, WeatherSnapshot } from "@/lib/types";
import { useAppRuntime } from "./runtime";

interface WeatherState {
  data: WeatherSnapshot | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  fetchedAt: number | null;
  checkedAt: number | null;
}

export function useWeather(prefs: Prefs, ready: boolean) {
  const runtime = useAppRuntime();
  // Appearance changes never refetch weather.
  const requestPrefs = useMemo(() => prefs, [prefs.place, prefs.provider, prefs.keys, prefs.locale]);
  const [state, setState] = useState<WeatherState>({
    data: null,
    error: null,
    loading: true,
    refreshing: false,
    fetchedAt: null,
    checkedAt: null,
  });
  const controller = useRef<AbortController | null>(null);
  const hasData = useRef(false);
  hasData.current = Boolean(state.data);

  const load = useCallback(
    async (silent: boolean) => {
      if (!ready || controller.current || runtime.signal?.aborted) return;
      const next = new AbortController();
      controller.current = next;
      const signal = runtime.signal
        ? AbortSignal.any([next.signal, runtime.signal])
        : next.signal;
      setState((current) => ({
        ...current,
        loading: !silent && !hasData.current,
        refreshing: silent || hasData.current,
        error: silent ? current.error : null,
      }));
      try {
        const data = await runtime.services.weather(requestPrefs, signal);
        if (signal.aborted || controller.current !== next) return;
        if (!data || !data.current || !Array.isArray(data.daily) || !Array.isArray(data.hourly)) {
          throw new Error("provider_error");
        }
        const checkedAt = Date.now();
        setState({
          data,
          error: null,
          loading: false,
          refreshing: false,
          fetchedAt: checkedAt,
          checkedAt,
        });
      } catch (error) {
        if (signal.aborted || controller.current !== next) return;
        const code =
          error instanceof Error && error.message && error.message !== "Failed to fetch"
            ? error.message
            : "network";
        setState((current) => ({
          ...current,
          error: code,
          loading: false,
          refreshing: false,
          checkedAt: Date.now(),
        }));
      } finally {
        if (controller.current === next) controller.current = null;
      }
    },
    [requestPrefs, ready, runtime],
  );

  useEffect(() => {
    if (!ready) return;
    hasData.current = false;
    setState({ data: null, error: null, loading: true, refreshing: false, fetchedAt: null, checkedAt: null });
    void load(false);
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [load, ready]);

  const { checkedAt } = state;
  useEffect(() => {
    if (!ready || checkedAt === null) return;
    const next = checkedAt + REFRESH_MS;
    const refreshIfDue = () => {
      if (document.visibilityState === "visible" && Date.now() >= next) void load(true);
    };
    const timer = window.setTimeout(refreshIfDue, Math.max(0, next - Date.now()));
    document.addEventListener("visibilitychange", refreshIfDue);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshIfDue);
    };
  }, [load, ready, checkedAt]);

  const refresh = useCallback(() => void load(true), [load]);

  return { ...state, refresh };
}

/** Clock used for the "local time" chip; ticks once a minute. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}
