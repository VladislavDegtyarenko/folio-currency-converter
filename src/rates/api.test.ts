import { afterEach, expect, it, vi } from "vitest";
import { fetchRates, RATES_URL } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("requests only the selected endpoint and validates the response", async () => {
  const fetch = vi.fn().mockResolvedValue(
    Response.json({
      date: "2026-11-03",
      usd: { eur: 1, usd: 1, uah: 1, gbp: 1, pln: 1 },
    }),
  );
  vi.stubGlobal("fetch", fetch);
  expect((await fetchRates())?.date).toBe("2026-11-03");
  expect(fetch).toHaveBeenCalledExactlyOnceWith(RATES_URL, {
    cache: "no-cache",
    signal: expect.any(AbortSignal),
  });
});

it("does not try parsing a body for a 304", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 304 })),
  );
  expect(await fetchRates()).toBeNull();
});

it.each([
  new Response(null, { status: 503 }),
  new Response("invalid JSON"),
  Response.json({ date: "2026-11-03", usd: { usd: 1 } }),
])("rejects failed or invalid responses", async (response) => {
  const fetch = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetch);
  await expect(fetchRates()).rejects.toThrow();
  expect(fetch).toHaveBeenCalledOnce();
});

it("propagates connection errors without a fallback request", async () => {
  const fetch = vi.fn().mockRejectedValue(new TypeError("offline"));
  vi.stubGlobal("fetch", fetch);
  await expect(fetchRates()).rejects.toThrow("offline");
  expect(fetch).toHaveBeenCalledOnce();
});
