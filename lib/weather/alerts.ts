import type { MessageKey } from "@/lib/i18n";
import type { CurrentWeather } from "@/lib/types";

/** Weather situations worth a heads-up, derived from the live snapshot. */
export function collectAlerts(current: CurrentWeather): MessageKey[] {
  const alerts: MessageKey[] = [];
  const speed = current.windSpeed ?? 0;
  const gust = current.windGust ?? 0;
  const temp = current.temperature;

  if (current.kind === "thunder" || current.kind === "hail") {
    alerts.push("warning.thunderstorm");
  }
  if (current.kind === "heavy-rain") {
    alerts.push("warning.heavyRain");
  }
  if (speed >= 30 || gust >= 50) {
    alerts.push("warning.strongWind");
  }
  if (temp >= 32) {
    alerts.push("warning.heat");
  }
  if (temp <= -10) {
    alerts.push("warning.frost");
  }
  if (current.kind === "fog" && (current.visibility ?? 2000) < 500) {
    alerts.push("warning.fog");
  }
  return alerts.slice(0, 2);
}
