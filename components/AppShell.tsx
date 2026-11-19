"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PrefsProvider, usePrefs } from "@/lib/client/prefs";
import { useWeather } from "@/lib/client/use-weather";
import { useAppRuntime } from "@/lib/client/runtime";
import { REPO_URL } from "@/lib/config";
import { errorMessage, type MessageKey } from "@/lib/i18n";
import { placeLabel } from "@/lib/places";
import { formatTemp } from "@/lib/format";
import { formatFullDate, formatTime } from "@/lib/time";
import type { TabId } from "@/lib/types";
import { PROVIDER_MAP } from "@/lib/weather/providers";
import { OfficialAlerts } from "./WeatherAlert";
import { PlaceDialog } from "./PlaceDialog";
import { SettingsDialog } from "./SettingsDialog";
import { Toast } from "./Toast";
import { WeatherScene } from "./WeatherScene";
import { MonthView } from "./views/MonthView";
import { TodayView } from "./views/TodayView";
import { WeekView } from "./views/WeekView";

const TABS: TabId[] = ["today", "week", "month"];

function Shell() {
  const runtime = useAppRuntime();
  const { prefs, ready, iconPack, t, update, setPlace } = usePrefs();
  const { data, error, loading, refreshing, fetchedAt, refresh } = useWeather(prefs, ready);
  const [tab, setTab] = useState<TabId>("today");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(null);

  const providerName = useMemo(() => {
    if (!data) return "";
    if (data.provider === "nws") return "National Weather Service";
    const meta = PROVIDER_MAP[data.provider];
    return meta ? `${meta.name} · ${meta.model}` : String(data.provider);
  }, [data]);

  const showError = Boolean(error) && !data;
  const expiresAt = Date.parse(data?.freshness?.expiresAt ?? "");
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;
    const timer = window.setTimeout(() => setClock(Date.now()), expiresAt - Date.now() + 1);
    return () => window.clearTimeout(timer);
  }, [expiresAt]);
  const stale = Boolean(data) && Boolean(error || data?.freshness?.stale || expiresAt <= Math.max(clock, Date.now()));
  const message = runtime.embedded && error === "provider_error" ? t("error.text") : errorMessage(prefs.locale, error ?? "unknown");

  // Offline shell: register the service worker in production builds only, so
  // it never fights the dev server's live reload.
  useEffect(() => {
    if (runtime.embedded || process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, [runtime]);

  useEffect(() => {
    if (!data) return;
    const time = formatTime(data.fetchedAt, data.timezone, prefs.locale);
    const title = `${formatTemp(data.current.temperature, prefs.temperature, prefs.locale, {
      withUnit: false,
    })} ${placeLabel(data.place)} · Pohoda`;
    if (runtime.embedded) {
      runtime.onTitle?.(title);
      return;
    }
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", `${t("app.description")} ${time}`);
  }, [data, prefs.locale, prefs.temperature, t, runtime]);

  useEffect(() => {
    if (!error) return;
    setToast({ message, tone: "error" });
  }, [error, message]);

  const onSelectPlace = useCallback(
    (place: Parameters<typeof setPlace>[0]) => {
      setPlace(place);
      setPlaceOpen(false);
      setToast({ message: t("refresh.done"), tone: "ok" });
    },
    [setPlace, t],
  );

  const sceneKind = data?.current.kind ?? "unknown";
  const sceneDay = data?.current.isDay ?? null;
  const view = data
    ? tab === "today"
      ? <TodayView snapshot={data} />
      : tab === "week"
        ? <WeekView snapshot={data} />
        : <MonthView snapshot={data} />
    : null;

  return (
    <div className="app">
      <WeatherScene kind={sceneKind} isDay={sceneDay} motion={prefs.motion} />

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <circle cx="12" cy="12" r="6" />
                <path d="M22 25a6 6 0 0 0 .8-11.9A8 8 0 0 0 7.6 15 5 5 0 0 0 9 25Z" />
              </svg>
            </span>
            <span className="brand-text">
              <strong>Pohoda</strong>
              <small>{t("app.tagline")}</small>
            </span>
          </div>

          <div className="place-wrap">
            <button
              type="button"
              className="place-pill"
              onClick={() => setPlacesOpen((open) => !open)}
              aria-expanded={placesOpen}
              aria-label={t("header.place")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.6" />
              </svg>
              <span className="place-name">{data?.place.name ?? prefs.place.name}</span>
              <svg className="pill-caret" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {placesOpen ? (
              <>
                <button
                  type="button"
                  className="menu-backdrop"
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => setPlacesOpen(false)}
                />
                <div className="place-menu" role="menu" aria-label={t("header.place")}>
                  {prefs.places.map((place) => {
                    const active = place.id === (data?.place.id ?? prefs.place.id);
                    return (
                      <button
                        key={place.id}
                        type="button"
                        role="menuitem"
                        className={active ? "place-item is-active" : "place-item"}
                        onClick={() => {
                          onSelectPlace(place);
                          setPlacesOpen(false);
                        }}
                      >
                        {placeLabel(place)}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    role="menuitem"
                    className="place-item place-more"
                    onClick={() => {
                      setPlacesOpen(false);
                      setPlaceOpen(true);
                    }}
                  >
                    {t("header.place")}
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <nav className="tabs" role="tablist" aria-label={t("a11y.tabs")}>
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                className={tab === id ? "tab is-active" : "tab"}
                onClick={() => setTab(id)}
              >
                {t(`tab.${id}` as MessageKey)}
              </button>
            ))}
          </nav>

          <div className="top-actions">
            <button
              type="button"
              className={refreshing ? "icon-btn is-spinning" : "icon-btn"}
              onClick={() => refresh()}
              aria-label={t("a11y.refresh")}
              title={t("header.refresh")}
              disabled={refreshing || !data}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11a8 8 0 1 0-2.3 6.4" />
                <path d="M20 5v6h-6" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label={t("header.settings")}
              title={t("header.settings")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
              </svg>
            </button>
          </div>
        </header>

        <main className="content">
          {stale ? (
            <div className="banner banner-warn" role="status">
              <span>{t("hero.stale")}</span>
              <button type="button" className="link" onClick={() => refresh()}>
                {t("common.retry")}
              </button>
            </div>
          ) : null}

          {data && runtime.embedded ? <OfficialAlerts snapshot={data} stale={stale} refreshing={refreshing} /> : null}

          {showError ? (
            <section className="card error-card" role="alert">
              <div className="error-art" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <circle cx="24" cy="22" r="9" />
                  <path d="M44 46a10 10 0 0 0 1.2-19.9A13 13 0 0 0 19 28a8.5 8.5 0 0 0 2.3 18Z" />
                  <path d="M32 34v10M32 50v.5" />
                </svg>
              </div>
              <h1>{t("error.title")}</h1>
              <p>{message}</p>
              <div className="error-actions">
                <button type="button" className="btn btn-primary" onClick={() => refresh()}>
                  {t("common.retry")}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setSettingsOpen(true)}>
                  {t("common.settings")}
                </button>
              </div>
            </section>
          ) : null}

          {loading && !data ? (
            <div className="skeleton" aria-busy="true" aria-label={t("common.loading")}>
              <div className="sk-hero">
                <span className="sk-line w40" />
                <span className="sk-line w20 tall" />
                <span className="sk-line w30" />
                <span className="sk-line w60" />
              </div>
              <div className="sk-row">
                {Array.from({ length: 6 }, (_, index) => (
                  <span className="sk-card" key={index} />
                ))}
              </div>
              <p className="sk-caption">
                {t("loader.title")} <small>{t("loader.text")}</small>
              </p>
            </div>
          ) : null}

          {view ? (
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              {view}
            </div>
          ) : null}
        </main>

        <footer className="footer">
          <div>
            <strong>{data ? providerName : t("app.name")}</strong>
            {data?.forecastIssuedAt && <span>Forecast issued <time dateTime={data.forecastIssuedAt}>{formatFullDate(new Date(data.forecastIssuedAt), data.timezone, prefs.locale)} {formatTime(data.forecastIssuedAt, data.timezone, prefs.locale)}</time></span>}
            <span>
              {data
                ? t("footer.updated", {
                    time: formatTime(data.fetchedAt, data.timezone, prefs.locale),
                  })
                : t("footer.local")}
            </span>
          </div>
          <div className="footer-links">
            {data?.provider === "met-no" && (
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                MET Norway · CC BY 4.0 · normalized forecast
              </a>
            )}
            <span>{t("footer.local")}</span>
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              GitHub
            </a>
          </div>
        </footer>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenPlace={() => {
          setSettingsOpen(false);
          setPlaceOpen(true);
        }}
        kind={data?.current.kind ?? "partly"}
        isDay={data?.current.isDay ?? true}
      />
      <PlaceDialog
        open={placeOpen}
        onClose={() => setPlaceOpen(false)}
        onSelect={onSelectPlace}
      />
      <Toast
        message={toast?.message ?? null}
        tone={toast?.tone ?? "ok"}
        onDone={() => setToast(null)}
      />

      <span className="offscreen" aria-live="polite">
        {refreshing ? t("common.loading") : fetchedAt ? t("refresh.done") : ""}
      </span>
    </div>
  );
}

export function AppShell() {
  return (
    <PrefsProvider>
      <Shell />
    </PrefsProvider>
  );
}
