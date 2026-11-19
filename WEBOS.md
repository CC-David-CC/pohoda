# Weather in WebOS

The browser build retains Pohoda’s React interface, weather scenes, themes and localization. Its entry exports synchronous `mount(host)` and `createApp(options)`. The desktop passes its normal host object and attaches the returned element. A standalone harness can instead supply a DOM element. Both receive `{ element, dispose }`. Each instance owns a React root, shadow tree, request lifetime and animation effects. Desktop preferences use the current account identity. Browser geolocation runs only from the location button and rounds its result to 0.01° before lookup or storage.

Use Node 24 with npm. From the repository root run:

```sh
npm ci
npm run build:webos
npm test
npm run typecheck
```

For packaging, `npm run build:webos -- --outdir /absolute/build/location/dist` writes the browser module, dependency notices and a list of source input hashes to that directory. Ship `app.mjs` next to `dist/pohoda.mjs`, `dist/pohoda.mjs.LEGAL.txt`, `dist/THIRD_PARTY_LICENSES.txt` and the project LICENSE. The application embeds isolated CSS; the desktop can use `app/icon.svg` as its launcher icon. The compiled bundle is disposable.

Run `npm run serve:webos` and open `/webos-demo.html` to try the standalone entry. The demo needs a compatible weather API for live data. The default WebOS service base is `/services/weather`. Its GET routes are `weather`, `places`, `places/reverse` and `history`. The types in `lib/types.ts`, `lib/history.ts` and `lib/client/runtime.tsx` describe the normalized results. An embedded caller can override the API base or inject service functions through `createApp`.

The backend selects the National Weather Service within its coverage and MET Norway internationally. Forecasts cover the returned period. The UI distinguishes observations, forecasts, stale snapshots and unavailable alerts. NOAA/NWS regional radar animation loads only when the user opens radar. The WebOS bundle uses neither the optional upstream Next server nor its Open-Meteo integrations.

Pohoda is distributed under its [upstream license](LICENSE). International forecasts use MET Norway data under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); WebOS normalizes the data and displays the user’s selected units. City data is derived from [GeoNames](https://www.geonames.org/) under the same license. NOAA/NWS radar frames retain their source and time labels. [MET Norway’s data policy](https://api.met.no/doc/TermsOfService) and the [NWS terms](https://www.weather.gov/disclaimer) apply to their respective services.
