# Pohoda as an independent WebOS app

This adaptation keeps the original React interface and Next application. It adds
a prebuilt native browser module: **`app.mjs`**. No Next server is needed to mount
the interface. Weather data still requires a compatible service.

## Mount contract

```js
import { mount } from './pohoda/app.mjs';

const { element, dispose } = mount(host);
// `host` is a DOM element with a usable width and height.
// `element` is already appended to host; the return value is not a Promise.
// React's rendering and weather requests proceed asynchronously.

dispose(); // call before destroying the WebOS window; safe to call twice
```

The host must belong to the current document; cross-document/iframe hosts are not supported.
Named `mount` and the default export are the same function. Register either in
your existing app registry. The exact registry/assembly files were not included
in the upload, so no WebOS shell conventions are invented here.

The app creates only its own section and Shadow DOM. It does not erase host
children, change host styles, or alter the desktop's document title, HTML theme,
language, body scrolling, or service worker. Each mount has an independent React
root, preferences state, dialogs, network lifetime, and animation/observer
cleanup. Styles, breakpoints, and scene dimensions follow the app's container.
`dispose()` aborts active service requests, unmounts React, and removes only the
app's element. Custom service implementations must honor the supplied signal to
stop their own underlying work.

Multiple mounts are supported. By default they persist preferences to the same
app-specific browser storage key, `pohoda.webos.prefs.v1`; they do not synchronize
live state. Use different keys, or `null`, for independent persistence.

## Connect your existing weather cache

```js
import { createApp } from './pohoda/app.mjs';

export const mount = createApp({
  apiBase: '/services/weather',
  storageKey: 'webos.weather.preferences', // null disables persistent storage
  initialPrefs: { locale: 'en', temperature: 'f' },
  onTitle(title) { /* optional: update this app window's caption */ },
});
```

The default `apiBase` is `/api`, matching this repository's existing Next routes.
The HTTP adapter sends GET requests with `Accept: application/json`:

| Path relative to `apiBase` | Query | JSON response |
| --- | --- | --- |
| `weather` | `lat`, `lon`, `id`, `name`, `provider`, `days`; optional place metadata | `WeatherSnapshot` from `lib/types.ts` |
| `places` | `q`, `lang`, `count` | `{ results: Place[] }` |
| `places/reverse` | `lat`, `lon`, `lang` | `{ place: Place }` |
| `history` | `lat`, `lon`, `date` | `{ years: HistoryYear[] }` from `lib/history.ts` |

Use a same-origin cache/reverse proxy for production. If an absolute API URL is
configured, that server must permit the origin with CORS. Cross-origin cookies
are not sent by the supplied adapter. Errors may return `{ error: code }` using
the weather error codes in `lib/types.ts`. Missing routes and HTML fallback
pages display a clear "weather service is not connected" message. Fetches time
out after 20 seconds and are cancelled when their consuming view closes.

Alternatively, connect existing host methods without an HTTP adapter:

```js
export const mount = createApp({
  services: {
    weather: (prefs, signal) => weatherCache.snapshot(prefs, { signal }),
    places: (query, locale, signal) => weatherCache.search(query, locale, { signal }),
    reverse: (lat, lon, locale, signal) => weatherCache.reverse(lat, lon, locale, { signal }),
    history: (lat, lon, date, signal) => weatherCache.history(lat, lon, date, { signal }),
  },
});
```

Each method returns the normalized value itself, not a Fetch `Response` or JSON
envelope. Any omitted method uses the HTTP adapter. The types are in
`lib/client/runtime.tsx`. `initialPrefs` override stored preferences at mount;
theme, units, place selection, and all other ordinary settings still work.

## Build and run

The zip includes `dist/pohoda.mjs`, so importing `app.mjs` requires no npm step.
Keep `app.mjs` and `dist/` together. The compiled bundle includes React, the app,
and its isolated CSS. There are no runtime CDN dependencies. The additional
`dist/pohoda.css` is supplied for inspection; do **not** add it to the desktop
document, because the bundle already inserts it inside its own shadow root.

```sh
npm ci
npm run build:webos
npm run typecheck
npm test
```

For a small resizable host, run `npm run serve:webos` and open
`http://localhost:8080/webos-demo.html`. The demo uses the real entry and lets you
set the API base. A plain static server has no `/api` routes, so it intentionally
shows the disconnected-service state until a compatible backend is configured.
There is no sample weather disguised as live data.

The original complete Next app and its server routes remain available through
`npm run dev`, or `npm run build` followed by `npm start`. Those routes can be
deployed behind your shared weather API. They still use their upstream data
providers; the native mount conversion does **not** create a NOAA adapter or a
shared server cache.

## Boundaries and retained upstream behavior

- All app rendering is native DOM/React. Pohoda's preexisting **optional Windy
  radar dialog** still contains its third-party iframe. The application itself is
  not wrapped in an iframe; replacing that radar widget with Isobar is separate
  integration work.
- Upstream provider choices, weather normalization, and the clearly labelled
  climate-average portion of the 30-day view remain. The supplied backend must
  preserve `source: "forecast" | "climate"`; the mount adapter does not invent
  forecasts or historical measurements.
- Browser-local preferences are retained. Integrating preferences with WebOS
  account storage is separate from mounting the view.
- The browser module requires a modern browser with Shadow DOM, container
  queries, `ResizeObserver`, and `AbortSignal.any` (Chrome 120+ is the target).
- The host must call `dispose()`; merely removing the DOM element does not
  release application resources.

Original MIT licensing and attribution are preserved. Bundled dependency
licenses are in `dist/THIRD_PARTY_LICENSES.txt` and the generated legal notices.

## Verification boundary

The browser bundle builds, TypeScript checks, and the upstream unit tests plus
HTTP adapter tests pass. A DOM integration test exercised real React rendering,
two simultaneous mounts, independent settings/tabs, scoped modal keyboard
handling, host-state preservation, request cancellation, late completion after
disposal, immediate disposal, and repeated disposal. This environment could not
launch Chromium because of its socket sandbox restriction; visual layout/GPU
behavior and live-provider end-to-end operation still need a browser check in
the actual WebOS desktop.

The retained Next server dependency was patched from the upload's `16.4.3` to
`16.4.6` after its production build reported advisories GHSA-mfr8-8qww-v76h and
GHSA-vc7v-qv4w-wrv8. The original Next production build now passes, and
`npm audit --omit=dev` reports no known production dependency vulnerabilities at
verification time. This is dependency verification, not a security audit of the app.
