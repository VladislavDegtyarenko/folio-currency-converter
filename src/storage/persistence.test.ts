import { afterEach, expect, it, vi } from "vitest";
import { restoreRates } from "../rates/model";
import { DEFAULT_STATE } from "./model";
import { readState, writeState } from "./persistence";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("uses Chrome storage to round-trip currencies, settings, mode and amount", async () => {
  let saved: Record<string, unknown> = {};
  const set = vi.fn(async (value: Record<string, unknown>) => {
    saved = value;
  });
  vi.stubGlobal("chrome", {
    storage: { local: { get: async () => saved, set } },
  });
  const state = {
    ...DEFAULT_STATE,
    euros: 250,
    currencies: ["EUR", "BTC", "1INCH"],
    pair: ["BTC", "XAU"] as [string, string],
    settings: { ...DEFAULT_STATE.settings, showSymbols: true },
    rates: restoreRates({
      date: "2026-11-03",
      usd: {
        eur: 1,
        usd: 1,
        btc: 0.00001,
        "1inch": 12,
        xau: 0.0002,
      },
    }),
  };
  await writeState(state);
  expect(set).toHaveBeenCalledOnce();
  expect(await readState()).toEqual(state);
  const latest = {
    ...state,
    rates: state.rates && { ...state.rates, date: "2026-11-04" },
  };
  await writeState(latest);
  expect(await readState()).toEqual(latest);
  expect(Object.keys(saved)).toEqual(["folio.state.v1"]);
});

it("uses the preview storage to restore the latest snapshot after reopening", async () => {
  const saved = new Map<string, string>();
  vi.stubGlobal("chrome", undefined);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
  });
  const state = {
    ...DEFAULT_STATE,
    rates: restoreRates({
      date: "2026-11-03",
      usd: { eur: 1, usd: 1, uah: 1, gbp: 1, pln: 1 },
    }),
  };
  await writeState(state);
  expect(await readState()).toEqual(state);
  expect(saved.size).toBe(1);
});

it("propagates storage failures instead of reporting success", async () => {
  vi.stubGlobal("chrome", {
    storage: {
      local: {
        set: async () => {
          throw new Error("quota");
        },
      },
    },
  });
  await expect(writeState(DEFAULT_STATE)).rejects.toThrow("quota");
});
