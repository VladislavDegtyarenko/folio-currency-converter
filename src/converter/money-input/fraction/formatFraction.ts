import { type AmountFormat } from "../draft/createAmountFormat";
import { type AmountFraction } from "./types";

/** Rounds a nonnegative fraction to eight decimal places and localizes its digits. */
export function formatFraction(
  { numerator, denominator }: AmountFraction,
  format: AmountFormat,
) {
  const scale = 100_000_000n;
  const rounded = (numerator * scale * 2n + denominator) / (denominator * 2n);
  const whole = format.integer.format(rounded / scale);
  const fraction = String(rounded % scale)
    .padStart(8, "0")
    .replace(/0+$/, ""); // Drop trailing fractional zeros.

  if (!fraction) {
    return whole;
  }

  return (
    whole +
    format.decimal +
    Array.from(fraction, (digit) => format.digits[Number(digit)]).join("")
  );
}
