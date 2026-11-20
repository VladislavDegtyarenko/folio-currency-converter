import { type AmountFormat } from "./createAmountFormat";

/** Converts the locale's digits to ASCII while leaving separators in place. */
export function normalizeDigits(text: string, format: AmountFormat) {
  let plain = text;

  for (const [digit, localized] of format.digits.entries()) {
    plain = plain.split(localized).join(String(digit));
  }

  return plain;
}
