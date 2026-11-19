import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpServices } from "@/lib/client/runtime";
import { basePrefs } from "@/lib/client/prefs";

afterEach(() => vi.unstubAllGlobals());

describe("weather service boundary", () => {
  it("routes all operations through the configured cache base without provider requests", async () => {
    const calls: string[] = [];
    const abort = new AbortController();
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      calls.push(url);
      expect(init.credentials).toBe("same-origin");
      expect(init.signal).toBeInstanceOf(AbortSignal);
      return Response.json({ results: [], years: [], place: null });
    }));
    const service = createHttpServices("/shared/weather/");
    await service.weather(basePrefs(), abort.signal);
    await service.places("New York", "en", abort.signal);
    await service.reverse(40, -74, "en", abort.signal);
    await service.history(40, -74, "2026-01-01", abort.signal);
    expect(calls.map(url => url.split("?")[0])).toEqual([
      "/shared/weather/weather", "/shared/weather/places",
      "/shared/weather/places/reverse", "/shared/weather/history",
    ]);
    expect(new URL(calls[1], "https://example.test").searchParams.get("q")).toBe("New York");
  });

  it("distinguishes an absent backend from a provider error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Not found", { status: 404 })));
    await expect(createHttpServices().weather(basePrefs(), new AbortController().signal))
      .rejects.toThrow("backend_unavailable");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>SPA shell</html>", {
      headers: { "Content-Type": "text/html" },
    })));
    await expect(createHttpServices().weather(basePrefs(), new AbortController().signal))
      .rejects.toThrow("backend_unavailable");
  });

  it("forwards cancellation to an in-flight HTTP operation", async () => {
    let requestSignal: AbortSignal | null = null;
    vi.stubGlobal("fetch", vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      requestSignal = init.signal as AbortSignal;
      requestSignal.addEventListener("abort", () => reject(requestSignal!.reason), { once: true });
    })));
    const abort = new AbortController();
    const pending = createHttpServices().places("Atlanta", "en", abort.signal);
    const assertion = expect(pending).rejects.toThrow();
    abort.abort();
    await assertion;
    expect(requestSignal!.aborted).toBe(true);
  });
});
