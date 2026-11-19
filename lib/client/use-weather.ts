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
        setState({
          data,
          error: null,
          loading: false,
          refreshing: false,
          fetchedAt: Date.now(),
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
    setState({ data: null, error: null, loading: true, refreshing: false, fetchedAt: null });
    void load(false);
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [load, ready]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => void load(true), REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const fetched = state.fetchedAt;
      if (!fetched || Date.now() - fetched > REFRESH_MS) void load(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, ready, state.fetchedAt]);

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
