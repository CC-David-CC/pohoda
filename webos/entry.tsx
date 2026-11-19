import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "../components/AppShell";
import { createHttpServices, RuntimeProvider, type AppRuntime, type WeatherServices } from "../lib/client/runtime";
import type { Prefs } from "../lib/types";
import css from "pohoda:styles";

export type { WeatherServices } from "../lib/client/runtime";
export { createHttpServices } from "../lib/client/runtime";

export interface AppOptions {
  /** Root of the compatible weather/places/places/reverse/history API. */
  apiBase?: string;
  /** Override methods to call an existing host service directly. */
  services?: Partial<WeatherServices>;
  storageKey?: string | null;
  initialPrefs?: Partial<Prefs>;
  onTitle?: (title: string) => void;
  onError?: (error: unknown) => void;
}

class AppBoundary extends Component<{ children: ReactNode; onError?: AppOptions["onError"] }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { this.props.onError?.(error); }
  render() {
    return this.state.failed
      ? <div className="card error-card" role="alert"><h1>Pohoda could not display this weather response.</h1><p>Close and reopen the app to try again.</p></div>
      : this.props.children;
  }
}

let instance = 0;

/** Configure once, then register the returned synchronous mount in the WebOS app list. */
export function createApp(options: AppOptions = {}) {
  const services = { ...createHttpServices(options.apiBase), ...options.services };
  for (const key of ["weather", "places", "reverse", "history"] as const) {
    if (typeof services[key] !== "function") throw new TypeError(`Pohoda services.${key} must be a function`);
  }
  return function mount(host: HTMLElement): { element: HTMLElement; dispose: () => void } {
    if (!host || host.nodeType !== 1 || typeof host.append !== "function" || host.ownerDocument !== document) {
      throw new TypeError("Pohoda mount(host) requires a DOM element in the current document");
    }
    const doc = host.ownerDocument;
    const element = doc.createElement("section");
    element.dataset.webosApp = "pohoda";
    element.setAttribute("aria-label", "Pohoda Weather");
    // The app owns only this element. It never clears, themes, or resizes its host.
    element.style.cssText = "display:block;position:relative;width:100%;height:100%;min-width:0;min-height:0;isolation:isolate;overflow:hidden;";
    const shadow = element.attachShadow({ mode: "open" });
    const style = doc.createElement("style");
    style.textContent = css;
    const themeRoot = doc.createElement("div");
    themeRoot.className = "pohoda-root";
    themeRoot.dataset.theme = "daylight";
    themeRoot.dataset.style = "liquid-glass";
    themeRoot.dataset.font = "system";
    themeRoot.dataset.scheme = "light";
    const scrollElement = doc.createElement("div");
    scrollElement.className = "pohoda-scroll";
    const portalRoot = doc.createElement("div");
    portalRoot.className = "pohoda-portals";
    const container = doc.createElement("div");
    container.className = "pohoda-react";
    scrollElement.append(container);
    themeRoot.append(scrollElement, portalRoot);
    shadow.append(style, themeRoot);
    host.append(element);

    const lifetime = new AbortController();
    const runtime: AppRuntime = {
      embedded: true, themeRoot, scrollElement, portalRoot, services,
      storageKey: options.storageKey === undefined ? "pohoda.webos.prefs.v1" : options.storageKey,
      initialPrefs: options.initialPrefs, signal: lifetime.signal, onTitle: options.onTitle,
    };
    const root = createRoot(container, { identifierPrefix: `pohoda-${++instance}-` });
    root.render(
      <AppBoundary onError={options.onError}>
        <RuntimeProvider value={runtime}><AppShell /></RuntimeProvider>
      </AppBoundary>,
    );
    let disposed = false;
    return {
      element,
      dispose() {
        if (disposed) return;
        disposed = true;
        lifetime.abort();
        try { root.unmount(); }
        finally { element.remove(); }
      },
    };
  };
}

export const mount = createApp();
export default mount;
