import { type Rates } from "../rates/model";
import { type CurrencyCode } from "./currency/currencies";

export const MAX_AMOUNT = 999_999_999_999;

/** Allows the shared value to cover the largest supported input in any currency. */
export function maximumEuros(rates: Rates) {
  return (
    MAX_AMOUNT *
    Math.max(...Object.values(rates.usd).map((rate) => rates.usd.EUR / rate))
  );
}

/** Accepts plain decimal input with either separator, rejecting ambiguous grouping. */
export function parseAmount(text: string): number | null {
  const value = text.trim();
  const pattern = /^\d{1,12}(?:[.,]\d{0,8})?$/; // Plain nonnegative decimal, at most 12 integer and 8 fractional digits.

  if (!pattern.test(value)) {
    return null;
  }

  const amount = Number(value.replace(",", "."));

  return Number.isFinite(amount) && amount <= MAX_AMOUNT ? amount : null;
}

/** Converts the common euro amount using a single USD-based snapshot. */
export function convertAmount({
  euros,
  code,
  rates,
}: {
  euros: number;
  code: CurrencyCode;
  rates: Rates;
}) {
  return euros * (rates.usd[code] / rates.usd.EUR);
}

/** Converts an edited currency amount to the persisted common euro amount. */
export function toEuros({
  amount,
  code,
  rates,
}: {
  amount: number;
  code: CurrencyCode;
  rates: Rates;
}) {
  return amount * (rates.usd.EUR / rates.usd[code]);
}

/** Formats output without modifying the underlying conversion value. */
export function formatAmount({
  value,
  locale,
  digits,
}: {
  value: number;
  locale: string;
  digits: number;
}) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
