import { MAX_AMOUNT } from "../amounts";
import { type AmountFormat } from "./amountDraft";

type AmountFraction = { numerator: bigint; denominator: bigint };

const MAX_INTEGER = BigInt(MAX_AMOUNT);
// Leave extra decimal places beyond the smallest positive JavaScript number.
const RESULT_DECIMAL_PLACES = 340;
const RESULT_SCALE = 10n ** BigInt(RESULT_DECIMAL_PLACES);

/** Preserves the exact digits of a validated, nonnegative decimal operand. */
export function fractionFromDecimal(decimal: string): AmountFraction | null {
  const [whole, fraction = ""] = decimal.split(".");
  const numerator = BigInt(whole + fraction);
  const denominator = 10n ** BigInt(fraction.length);

  return numerator > MAX_INTEGER * denominator
    ? null
    : { numerator, denominator };
}

/** Adds two exact values using a common denominator. */
export function addFractions(left: AmountFraction, right: AmountFraction) {
  if (left.numerator === 0n) {
    return right;
  }

  if (left.denominator === right.denominator) {
    return {
      numerator: left.numerator + right.numerator,
      denominator: left.denominator,
    };
  }

  return {
    numerator:
      left.numerator * right.denominator + right.numerator * left.denominator,
    denominator: left.denominator * right.denominator,
  };
}

/** Checks the exact result before converting it to the converter's numeric type. */
export function fractionToAmount({ numerator, denominator }: AmountFraction) {
  if (numerator < 0n || numerator > MAX_INTEGER * denominator) {
    return null;
  }

  const scaled = (numerator * RESULT_SCALE) / denominator;
  return Number(`${scaled}e-${RESULT_DECIMAL_PLACES}`);
}

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
