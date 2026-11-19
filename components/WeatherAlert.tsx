"use client";

import { useEffect, useState } from "react";
import { usePrefs } from "@/lib/client/prefs";
import type { CurrentWeather, WeatherSnapshot } from "@/lib/types";
import { collectAlerts } from "@/lib/weather/alerts";

export function WeatherAlert({ current }: { current: CurrentWeather }) {
  const { t } = usePrefs();
  const [dismissed, setDismissed] = useState(false);
  const alerts = collectAlerts(current);

  if (alerts.length === 0 || dismissed) return null;

  return (
    <div className="alert-banner" role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2.5 20h19L12 3Z" />
        <path d="M12 10v5M12 18v.5" />
      </svg>
      <ul>
        {alerts.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
      <button
        type="button"
        className="alert-close"
        aria-label={t("common.close")}
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
}

/** Only the server-verified active warning set is suitable for an official alert banner. */
export function OfficialAlerts({ snapshot, stale }: { snapshot: WeatherSnapshot; stale: boolean }) {
  const [now, setNow] = useState(Date.now);
  const verifiedUntil = snapshot.alertsValidUntil ? Date.parse(snapshot.alertsValidUntil) : Date.parse(snapshot.fetchedAt) + 60_000;
  useEffect(() => {
    const expiries = (snapshot.alerts ?? []).map(alert => Date.parse(alert.expires));
    const expiry = Math.min(...[...expiries, verifiedUntil].filter(time => time > now));
    if (!Number.isFinite(expiry)) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, expiry - Date.now()) + 1);
    return () => window.clearTimeout(timer);
  }, [snapshot, verifiedUntil, now]);

  if (snapshot.alertStatus === "outside-coverage") return null;
  if (stale || snapshot.alertStatus !== "current" || !(Date.now() < verifiedUntil)) {
    return <p className="banner banner-warn" role="status">Current official weather alerts are unavailable.</p>;
  }
  const active = (snapshot.alerts ?? []).filter(alert => Date.parse(alert.expires) > Date.now());
  if (!active.length) return null;
  return (
    <aside className="alert-banner" aria-label="National Weather Service alerts" role="status">
      <ul>{active.map(alert => <li key={alert.headline + alert.expires}>{alert.headline}</li>)}</ul>
    </aside>
  );
}
