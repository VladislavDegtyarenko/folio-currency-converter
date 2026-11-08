import { maximumEuros } from "../converter/amounts";
import {
  type CurrencyCode,
  isCurrencyCode,
} from "../converter/currency/currencies";
import { type Rates, restoreRates } from "../rates/model";
import { DEFAULT_SETTINGS, type Settings } from "../settings/model";

export type SavedState = {
  version: 1;
  currencies: CurrencyCode[];
  base: CurrencyCode;
  euros: number;
  mode: "single" | "multiple";
  pair: [CurrencyCode, CurrencyCode];
  settings: Settings;
  rates: Rates | null;
};

export const DEFAULT_STATE: SavedState = {
  version: 1,
  currencies: ["EUR", "USD", "UAH", "GBP", "PLN"],
  base: "EUR",
  euros: 100,
  mode: "multiple",
  pair: ["EUR", "USD"],
  settings: DEFAULT_SETTINGS,
  rates: null,
};

/** Checks whether a saved value can be read as a record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Restores validated settings and replaces invalid fields with safe defaults. */
export function restoreState(value: unknown): SavedState {
  if (!isRecord(value) || value.version !== 1) {
    return structuredClone(DEFAULT_STATE);
  }

  const rates = restoreRates(value.rates);

  /** Accepts a saved selection only when its rate is available. */
  function isAvailableCurrency(code: unknown): code is CurrencyCode {
    return (
      isCurrencyCode(code) &&
      (rates
        ? Object.hasOwn(rates.usd, code)
        : DEFAULT_STATE.currencies.includes(code))
    );
  }

  let currencies = Array.isArray(value.currencies)
    ? [...new Set(value.currencies.filter(isAvailableCurrency))]
    : [];
  const settings = isRecord(value.settings) ? value.settings : {};
  const restoredSettings: Settings = {
    language: ["auto", "en", "ru", "uk"].includes(String(settings.language))
      ? (settings.language as Settings["language"])
      : "auto",
    theme: ["system", "light", "dark"].includes(String(settings.theme))
      ? (settings.theme as Settings["theme"])
      : "system",
    digits:
      settings.digits === 0 || settings.digits === 2 || settings.digits === 4
        ? settings.digits
        : 2,
    isCompact:
      typeof settings.isCompact === "boolean" ? settings.isCompact : false,
    showNames:
      typeof settings.showNames === "boolean" ? settings.showNames : true,
    showFlags:
      typeof settings.showFlags === "boolean" ? settings.showFlags : false,
    showSymbols:
      typeof settings.showSymbols === "boolean" ? settings.showSymbols : false,
  };

  if (!currencies.length) {
    currencies = DEFAULT_STATE.currencies.filter(isAvailableCurrency);
  }

  const pair =
    Array.isArray(value.pair) &&
    value.pair.length === 2 &&
    value.pair.every(isAvailableCurrency) &&
    value.pair[0] !== value.pair[1]
      ? (value.pair as [CurrencyCode, CurrencyCode])
      : ([...DEFAULT_STATE.pair] as [CurrencyCode, CurrencyCode]);

  return {
    version: 1,
    currencies,
    base:
      isAvailableCurrency(value.base) && currencies.includes(value.base)
        ? value.base
        : currencies[0],
    euros:
      typeof value.euros === "number" &&
      Number.isFinite(value.euros) &&
      value.euros >= 0 &&
      value.euros <= (rates ? maximumEuros(rates) : 2_000_000_000_000)
        ? value.euros
        : 100,
    mode: value.mode === "single" ? "single" : "multiple",
    pair,
    settings: restoredSettings,
    rates,
  };
}

/** Replaces the only cached snapshot without changing preferences or the amount. */
export function applyRates(state: SavedState, rates: Rates | null): SavedState {
  if (!rates) {
    if (!state.rates) {
      throw new Error("No cached rates for a 304 response");
    }

    return state;
  }

  if (
    [...state.currencies, ...state.pair].some(
      (code) => !Object.hasOwn(rates.usd, code),
    )
  ) {
    throw new Error("Rates missing a selected currency");
  }

  return { ...state, rates };
}
