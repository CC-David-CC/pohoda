"use client";

import { useState } from "react";
import { usePrefs } from "@/lib/client/prefs";
import type { CurrentWeather } from "@/lib/types";
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
