> **WebOS adaptation:** import `mount` from `app.mjs`. Prebuilt native module, lifecycle, API integration, and standalone demo instructions are in [WEBOS.md](WEBOS.md).

<div align="center">

# ☀️ Pohoda

**Weather, clearly.**

A calm weather app with today's conditions, hourly detail, a 7-day outlook and a 30-day view.
Animated skies follow the real weather — and you pick the provider, the colours, the style and even the typeface.

[![Live demo](https://img.shields.io/badge/live-pohoda--weather.vercel.app-34d399?logo=vercel&logoColor=white)](https://pohoda-weather.vercel.app)
[![CI](https://github.com/Sokolyanskyi/pohoda-weather/actions/workflows/ci.yml/badge.svg)](https://github.com/Sokolyanskyi/pohoda-weather/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-83%20passing-34d399)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

![Pohoda — today view](docs/desktop-today.png)

<br>

|   | Features |
| --- | --- |
| 🌦️ | **27 colour schemes** · **9 design styles** · **10 typefaces** |
| 🎨 | **19 animated icon packs** — from hand-drawn lines to 8-bit, ASCII and glitch |
| 💨 | **Living wind scene** — three trees, seasons, falling leaves, snow that drifts and settles |
| 📊 | Hourly detail · 7-day ranges · 30-day outlook with climate averages |
| 🛰️ | **10 data providers** — Open-Meteo, MET Norway, commercial APIs with your own keys |
| 🗓️ | “This day” — today versus the same date across the last ten years |
| 📶 | Installable PWA · offline shell · EN / UK / RU / PL / DE / ES |

<br>

</div>

## Why another weather app

- **Readable at a glance.** A large temperature, a short condition line, and the three numbers people actually check: rain chance, wind, humidity.
- **Ranges, not just numbers.** Every day row shows a temperature band placed on the week's scale, so a cold snap or a warm spell is visible without reading a table. Bands follow one colour ramp — violet well below freezing, sky blue at 0 °C, red in the heat — so the week reads as a temperature map.
- **Honest about limits.** Free forecasts stop at 10–16 days. The 30-day tab fills the rest with ten-year climate averages and labels those days as `climate` instead of pretending they are a forecast.
- **Weather you can see.** A full-screen scene (sun, moon, drifting clouds, canvas rain, snow, fog and lightning) reacts to the current condition, and nineteen icon packs are all animated.
- **Ten years of the same day.** The “This day” block at the bottom compares today with the archive for the same date in each of the last ten years.

## Screenshots

| Today | 7 days |
| --- | --- |
| ![Today](docs/desktop-today.png) | ![7-day forecast](docs/desktop-week.png) |

| 30 days | Settings |
| --- | --- |
| ![30-day outlook](docs/desktop-month.png) | ![Settings](docs/desktop-settings.png) |

| Colour schemes | Icon packs |
| --- | --- |
| ![Twenty-seven colour schemes](docs/desktop-appearance.png) | ![Icon packs](docs/desktop-icons.png) |

| Light theme | Black theme |
| --- | --- |
| ![Daylight theme](docs/desktop-light.png) | ![Black theme](docs/desktop-black.png) |

| Weather providers |
| --- |
| ![Weather providers](docs/desktop-providers.png) |

| This day — ten years back | Phone — this day |
| --- | --- |
| ![This day archive](docs/desktop-history.png) | ![Mobile archive](docs/mobile-history.png) |

| Phone — today | Phone — week |
| --- | --- |
| ![Mobile today](docs/mobile-today.png) | ![Mobile week](docs/mobile-week.png) |

| Weather radar | Phone — radar |
| --- | --- |
| ![Weather radar](docs/desktop-radar.png) | ![Mobile radar](docs/mobile-radar.png) |

## Features

### Forecast

- Current conditions with feels-like temperature, daily high and low.
- 24-hour hourly strip with precipitation probability.
- 7-day view with a chart of vertical temperature ranges (high and low on every bar), rain chance, wind and weekday, plus a summary strip and expandable rows for every day.
- 30-day view split into a real forecast and a clearly marked climate section.
- Sun and moon card: an arc that tracks the sun in real time with a filled trail from sunrise, then switches to the moon after sunset — its current phase (eight names, from new moon to waning crescent), a soft glow and the night path from sunset to the next sunrise. Sunrise, sunset and daylight length stay below.
- Detail cards for wind and gusts, direction, humidity, pressure, UV index, visibility, cloud cover and dew point.
- **“This day” archive block** at the bottom: ten tabs from one to ten years back, each with the weather type, high and low, precipitation, wind and how much warmer or colder that day was compared with today.
- **Weather radar** from the hero card: a Windy map with live rain, wind and temperature layers, switched with one tap. The timeline under the map covers the last two hours and the next 30 minutes for radar, and up to ten days for the forecast layers.

### Providers

Ten free sources, switchable in Settings. Every one of them works without an API key or an account:

| Provider | Model | Horizon | Key |
| --- | --- | --- | --- |
| Open-Meteo | Best match | 16 days | not needed |
| Open-Meteo | ECMWF IFS | 16 days | not needed |
| Open-Meteo | DWD ICON | 16 days | not needed |
| Open-Meteo | NOAA GFS | 16 days | not needed |
| Open-Meteo | Météo-France | 10 days | not needed |
| Open-Meteo | UK Met Office | 10 days | not needed |
| Open-Meteo | JMA | 10 days | not needed |
| Open-Meteo | Canada GEM | 10 days | not needed |
| Open-Meteo | KNMI | 10 days | not needed |
| MET Norway | Locationforecast 2.0 | 10 days | not needed |

Commercial providers that charge for their API were removed on purpose, so there is no key field, no `.env` file and nothing to configure.

### Places

- Search by city or town name in any of the six interface languages, including Cyrillic and diacritics.
- “Use my location” uses the browser Geolocation API and reverse-geocodes the coordinates.
- Recent places are remembered; the first launch guesses a city from the browser time zone, with Kyiv as the fallback.

### Appearance

- **Nine styles — whole design languages, picked from a dropdown in Settings:** `liquid-glass` (default: translucent blurred cards with a specular highlight), `flat` (solid blocks, no shadows), `skeuomorphism` (bevelled, embossed panels), `aurora` (northern-lights wash behind dark glass), `neon` (glowing accent outlines), `brutalism` (zero radius, thick borders, hard offset shadows), `claymorphism` (puffy moulded cards), `vaporwave` (magenta/cyan retro eighties night) and `minimalism` (hairline borders, nothing extra). Most styles follow the active theme's colours; `aurora`, `neon` and `vaporwave` bring their own dark palettes.
- **Twenty-seven colour schemes:** `daylight`, `sand`, `mint`, `blossom` (light) and `midnight`, `graphite`, `black`, `ink-red`, `ink-green`, `ink-blue`, `ink-cyan`, `ink-lime`, `ink-violet`, `ink-pink`, `ink-orange`, `ink-gold`, `ink-teal`, `ink-indigo`, `ink-fuchsia`, `ink-viridian`, `ink-bronze`, `ink-amber`, `ink-mulberry`, `aurora`, `nebula`, `ocean`, `ember` (dark). The sixteen `ink-*` schemes are the black palette with a coloured accent instead of white.
- **Ten interface fonts** — System, Grotesk, Geometric, Humanist, Rounded, Serif, Elegant, Slab, Condensed and Mono. All are operating-system stacks, so nothing is downloaded and switching is instant; picked from a dropdown in Settings.
- **Nineteen animated icon packs in thirteen distinct families:** hand-drawn `outline`, `duotone`, `solid`, `clay`, `neon`, `glass` and `emoji`; own-geometry `pixel` (8-bit), `bubble` (wobbling circles), `vivid` (gradients), `origami` (faceted paper), `blueprint` (dashed drawing), `terminal` (ASCII) and `constellation` (star dots); plus `cutout` (layered paper appliqué), `etching` (rolling hatch lines), `hologram` (iridescent sweep), `badge` (weather cut out of a solid disc) and `glitch` (RGB-split ghosts). All packs animate with GPU-friendly transform/opacity only (etching adds a hatch roll, blueprint a cheap dash march); the motion switch (full/calm/off) applies to every pack.
- **Full-screen scenes** for clear, partly cloudy, overcast, fog, rain, snow and thunderstorms, with drifting colour fields, moving clouds, canvas particles for precipitation and a lightning flash for storms.
- **A living, seasonal wind scene** — three different trees (a stiff fir, a big broadleaf, a small round one) on a dense narrow lawn, five wind-force levels (calm / light / moderate / fresh / gale) that tune every animation, and precipitation that reacts to the wind: leaves fall straight down in still air, drift sideways at a breeze and get blasted near-horizontally in a gale, always downwind; rain, drizzle, downpours, thunderstorm flashes, hail and snowfall fall straight from the live weather kind and blow downwind; snow settles on the crowns, fir tiers, branch tips and the ground. Broadleaf trees stand bare all winter and in early spring, and the season follows the real date — crown colours, leaf colours and the lawn change from spring to winter.
- **Motion levels:** full, calm, off. An explicit choice always wins; the system's reduced-motion preference only sets the default on the first visit.
- **Compact settings:** the colour-scheme, icon-pack and provider lists fold away by default and keep the current choice in their summary line.

### Language and units

- Interface: English, Ukrainian, Russian, Polish, German, Spanish. All 6 catalogues are tested for key and placeholder parity.
- Temperature: °C / °F.
- Wind: km/h, m/s, mph.
- Pressure: hPa, mmHg, inHg.
- Precipitation: mm / in.

### Platform

- Responsive from 360 px phones to wide desktops.
- The header stays pinned while the page scrolls.
- Installable PWA with a manifest and maskable icons.
- Theme and style are applied before first paint, so there is no flash of the wrong colours.
- Settings persist in `localStorage` under `pohoda.prefs.v1`.
- Automatic refresh every 10 minutes and when the tab becomes visible again.

## Tech stack

- Next.js 16 (App Router, Turbopack) and React 19
- TypeScript in strict mode
- Hand-written CSS with custom properties; no UI framework
- Vitest for unit tests of units, code mappings, time zones, formatting, catalogues and metadata

No runtime UI dependencies beyond React.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm test           # 59 unit tests
```

## API

The app talks to four internal routes so rate limits and caching stay on the server:

| Route | Purpose |
| --- | --- |
| `GET /api/weather` | Normalised snapshot: current, hourly and daily points, plus climate-filled days |
| `GET /api/history` | The same calendar day for each of the last ten years, from the Open-Meteo archive |
| `GET /api/places` | Multilingual place search via Open-Meteo geocoding |
| `GET /api/places/reverse` | Coordinates to a place name |

All responses are normalised to one `WeatherSnapshot` shape, so the UI does not know which provider produced the data.

## How the 30-day view works

1. The selected provider returns its maximum horizon (5–16 days).
2. For the remaining days, the app asks the Open-Meteo archive for the same calendar days in 2015–2024 and averages them.
3. Those days carry `source: "climate"`, a hatched range bar, a `Climate` badge and a note explaining that they are a trend, not a forecast.

Archive responses are cached for 24 hours.

## How the “This day” block works

1. The card asks `/api/history` for the current place and today's date.
2. The route fires ten single-day requests to the Open-Meteo archive API in parallel, one per year, and keeps only the days that came back complete.
3. The client renders them as tabs — `1 year ago` … `10 years ago`, pluralised per locale — with the weather icon, high, low, precipitation, wind and the temperature difference against today.
4. Results are cached at the edge for 24 hours, because a day in the past never changes.

## Project structure

```
app/
  api/weather/         provider dispatch and normalisation
  api/history/         ten-year archive for one calendar day
  api/places/          search and reverse geocoding
  layout.tsx           metadata, theme boot script, fonts
  page.tsx             app entry
components/
  AppShell.tsx         layout, tabs, dialogs, loading and error states
  WeatherScene.tsx     full-screen animated scene + canvas particles
  WeatherIcon.tsx      nineteen animated icon packs
  views/               Today, Week, Month
  DayRow, SunCard, RangeBar, ThisDayCard, RadarDialog, Modal, SettingsDialog, PlaceDialog, Toast
lib/
  weather/             providers, normalisation, code maps, climate, sun
  history.ts           Open-Meteo archive loader for the “This day” block
  i18n/                six catalogues and typed message keys
  client/              settings store, weather hook
  theme, style, font, units, time, format, places, types
tests/                 unit tests (Vitest)
docs/                  screenshots
```

## Deploy

The project is a standard Next.js app and deploys to Vercel without configuration:

```bash
npx vercel --prod
```

No API keys, database, cron job or external storage are required.

## Credits

Weather data by [Open-Meteo](https://open-meteo.com/) (including the ECMWF, DWD, NOAA, Météo-France, UK Met Office, JMA, GEM and KNMI model runs) and [MET Norway](https://www.met.no/). Place search by Open-Meteo geocoding, which uses GeoNames data. The radar dialog embeds [Windy.com](https://www.windy.com/) — map and radar data belong to Windy.


## License

MIT — see [LICENSE](LICENSE).
