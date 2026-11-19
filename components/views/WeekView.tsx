"use client";

import { useState } from "react";
import { usePrefs } from "@/lib/client/prefs";
import { formatDayMonth, formatWeekday } from "@/lib/time";
import { formatPrecip, formatTemp, formatWind } from "@/lib/format";
import type { WeatherSnapshot } from "@/lib/types";
import { DayRow } from "../DayRow";
import { WeekChart } from "../WeekChart";

export function WeekView({ snapshot }: { snapshot: WeatherSnapshot }) {
  const { prefs, t } = usePrefs();
  const locale = prefs.locale;
  const [open, setOpen] = useState<string | null>(null);
  const days = snapshot.daily.slice(0, 7);
  if (!days.length) return <p className="card">Daily forecasts are unavailable for this location.</p>;

  const globalMin = Math.min(...days.flatMap((day) => day.min ?? []));
  const globalMax = Math.max(...days.flatMap((day) => day.max ?? []));
  const warmest = days.filter(day => day.max != null).sort((a, b) => b.max - a.max)[0];
  const coldest = days.filter(day => day.min != null).sort((a, b) => a.min - b.min)[0];
  const windiest = days.filter(day => day.windMax != null)
    .sort((a, b) => (b.windMax ?? 0) - (a.windMax ?? 0))[0];
  const totalPrecip = days.length && days.every(day => day.precipitation != null)
    ? days.reduce((sum, day) => sum + day.precipitation, 0) : null;

  return (
    <div className="view view-week">
      <div className="view-head">
        <div>
          <span className="eyebrow">{formatDayMonth(days[0]?.date ?? "", locale)} — {formatDayMonth(days[days.length - 1]?.date ?? "", locale)}</span>
          <h2>{t("week.title")}</h2>
        </div>
      </div>

      <WeekChart days={days} />

      <div className="summary-grid">
        <article className="card summary">
          <span>{t("week.warmest")}</span>
          <strong>{formatTemp(warmest?.max, prefs.temperature, locale)}</strong>
          <small>{warmest ? formatWeekday(warmest.date, locale, "short") : ""}</small>
        </article>
        <article className="card summary">
          <span>{t("week.coldest")}</span>
          <strong>{formatTemp(coldest?.min, prefs.temperature, locale)}</strong>
          <small>{coldest ? formatWeekday(coldest.date, locale, "short") : ""}</small>
        </article>
        <article className="card summary">
          <span>{t("week.totalPrecip")}</span>
          <strong>{formatPrecip(totalPrecip, prefs.precipitation, locale)}</strong>
          <small>{t("settings.provider.days", { days: days.length })}</small>
        </article>
        <article className="card summary">
          <span>{t("week.windiest")}</span>
          <strong>{formatWind(windiest?.windMax, prefs.wind, locale)}</strong>
          <small>{windiest ? formatWeekday(windiest.date, locale, "short") : ""}</small>
        </article>
      </div>

      <section className="card day-list-card" aria-label={t("week.title")}>
        <ul className="day-list">
          {days.map((day) => (
            <DayRow
              key={day.date}
              day={day}
              globalMin={globalMin}
              globalMax={globalMax}
              timezone={snapshot.timezone}
              open={open === day.date}
              onToggle={() => setOpen(open === day.date ? null : day.date)}
            />
          ))}
        </ul>
        <p className="legend">{t("week.legend")}</p>
      </section>
    </div>
  );
}
