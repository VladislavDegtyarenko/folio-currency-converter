import {
  type CurrencyCode,
  isCurrencyCode,
} from "../converter/currency/currencies";

export type Rates = {
  date: string;
  usd: Record<CurrencyCode, number>;
};

/** Validates and retains every currency in the snapshot using uppercase codes. */
export function restoreRates(value: unknown): Rates | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const { date, usd } = value as Record<string, unknown>;
  // Require an ISO calendar date, including real month lengths and leap years.
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (
    typeof date !== "string" ||
    !datePattern.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date ||
    typeof usd !== "object" ||
    usd === null ||
    Array.isArray(usd)
  ) {
    return null;
  }

  const source = usd as Record<string, unknown>;
  const rates = {} as Rates["usd"];

  for (const [key, rate] of Object.entries(source)) {
    const code = key.toUpperCase();

    if (
      !isCurrencyCode(code) ||
      Object.hasOwn(rates, code) ||
      typeof rate !== "number" ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return null;
    }

    rates[code] = rate;
  }

  if (rates.USD !== 1 || !rates.EUR) {
    return null;
  }

  return { date, usd: rates };
}
