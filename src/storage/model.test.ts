import { describe, expect, it } from "vitest";
import { MAX_AMOUNT, toEuros } from "../converter/amounts";
import { restoreRates } from "../rates/model";
import { applyRates, DEFAULT_STATE, restoreState } from "./model";

describe("persisted state boundary", () => {
  it("keeps large valid cryptocurrency amounts across reopening", () => {
    const rates = restoreRates({
      date: "2026-11-03",
      usd: { usd: 1, eur: 0.8, btc: 0.00001 },
    });

    if (!rates) {
      throw new Error("Expected valid test rates");
    }

    const euros = toEuros({ amount: MAX_AMOUNT, code: "BTC", rates });
    const state = {
      ...DEFAULT_STATE,
      currencies: ["BTC"],
      base: "BTC",
      pair: ["BTC", "EUR"],
      rates,
      euros,
    };
    expect(euros).toBeGreaterThan(2_000_000_000_000);
    expect(restoreState(state).euros).toBe(euros);
  });
  it("restores crypto selections and their cached rates without losing preferences", () => {
    const rates = restoreRates({
      date: "2026-11-03",
      usd: { usd: 1, eur: 0.8, btc: 0.00001, "1inch": 12, xau: 0.0002 },
    });
    const saved = {
      ...DEFAULT_STATE,
      currencies: ["BTC", "1INCH", "XAU"],
      base: "BTC",
      pair: ["BTC", "1INCH"],
      rates,
    };
    expect(restoreState(saved)).toEqual(saved);
    expect(
      restoreState({
        ...saved,
        currencies: ["BTC", "MISSING"],
        pair: ["BTC", "MISSING"],
      }),
    ).toMatchObject({ currencies: ["BTC"], pair: ["EUR", "USD"] });
    expect(() =>
      applyRates(
        restoreState(saved),
        restoreRates({
          date: "2026-11-04",
          usd: { usd: 1, eur: 0.9, btc: 0.00002 },
        }),
      ),
    ).toThrow("missing a selected currency");
    expect(restoreState(saved).rates).toEqual(rates);
  });
  it("restores state without rates and discards corrupted cached rates", () => {
    const { rates: _, ...old } = DEFAULT_STATE;
    expect(restoreState(old)).toEqual(DEFAULT_STATE);
    expect(
      restoreState({ ...old, rates: { date: "2026-11-03", usd: { usd: 1 } } })
        .rates,
    ).toBeNull();
  });

  it("uses only initial selections when no valid rates are stored", () => {
    const saved = {
      ...DEFAULT_STATE,
      currencies: ["EUR", "JPY"],
      base: "JPY",
      pair: ["JPY", "USD"],
    };

    expect(restoreState(saved)).toMatchObject({
      currencies: ["EUR"],
      base: "EUR",
      pair: ["EUR", "USD"],
      rates: null,
    });
  });

  it("replaces the last snapshot while preserving edits and preferences", () => {
    const rates = restoreRates({
      date: "2026-11-03",
      usd: { eur: 1, usd: 1, uah: 1, gbp: 1, pln: 1 },
    });
    const state = { ...DEFAULT_STATE, euros: 250, mode: "single" as const };
    const saved = applyRates(state, rates);
    expect(saved).toEqual({ ...state, rates });
    expect(restoreState(saved)).toEqual(saved);
    expect(applyRates(saved, null)).toBe(saved);
    if (!rates) {
      throw new Error("Expected valid test rates");
    }

    const next = { ...rates, date: "2026-11-04" };
    expect(applyRates(saved, next)).toEqual({ ...state, rates: next });
    expect(() => applyRates(DEFAULT_STATE, null)).toThrow("No cached rates");
  });
  it("preserves a complete user configuration", () => {
    const saved = {
      ...DEFAULT_STATE,
      currencies: ["GBP", "EUR"],
      base: "GBP",
      mode: "single",
      pair: ["JPY", "USD"],
      rates: restoreRates({
        date: "2026-11-03",
        usd: { eur: 1, usd: 1, gbp: 1, jpy: 1 },
      }),
      settings: {
        ...DEFAULT_STATE.settings,
        language: "uk",
        showSymbols: true,
        showFlags: true,
      },
    };
    expect(restoreState(saved)).toEqual(saved);
  });
  it("repairs malformed fields without accepting unknown currencies", () => {
    const restored = restoreState({
      version: 1,
      currencies: ["XXX", "EUR", "EUR", "GBP"],
      base: "XXX",
      euros: Infinity,
      pair: ["USD", "USD"],
      settings: { language: "invalid", showSymbols: "yes", digits: 100 },
    });
    expect(restored.currencies).toEqual(["EUR", "GBP"]);
    expect(restored.base).toBe("EUR");
    expect(restored.euros).toBe(100);
    expect(restored.settings).toEqual(DEFAULT_STATE.settings);
    expect(restored.pair).toEqual(["EUR", "USD"]);
  });
  it("keeps old preferences while defaulting the new flag setting", () => {
    const saved = {
      ...DEFAULT_STATE,
      settings: { language: "uk", showNames: false, showSymbols: true },
    };
    const restored = restoreState(saved);
    expect(restored.settings.showFlags).toBe(false);
    expect(restored.settings.language).toBe("uk");
    expect(restored.settings.showNames).toBe(false);
    expect(restored.settings.showSymbols).toBe(true);
    expect(
      restoreState({ ...saved, settings: { showFlags: "yes" } }).settings
        .showFlags,
    ).toBe(false);
  });
  it.each([null, [], { version: 2 }, { version: 1, currencies: [] }])(
    "always supplies a nonempty list",
    (value) => {
      expect(restoreState(value).currencies.length).toBeGreaterThan(0);
    },
  );
});
