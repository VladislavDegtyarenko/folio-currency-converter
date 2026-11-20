import { MAX_INTEGER } from "./limits";
import { type AmountFraction } from "./types";

// Leave extra decimal places beyond the smallest positive JavaScript number.
const RESULT_DECIMAL_PLACES = 340;
const RESULT_SCALE = 10n ** BigInt(RESULT_DECIMAL_PLACES);

/** Checks the exact result before converting it to the converter's numeric type. */
export function fractionToAmount({ numerator, denominator }: AmountFraction) {
  if (numerator < 0n || numerator > MAX_INTEGER * denominator) {
    return null;
  }

  const scaled = (numerator * RESULT_SCALE) / denominator;
  return Number(`${scaled}e-${RESULT_DECIMAL_PLACES}`);
}
