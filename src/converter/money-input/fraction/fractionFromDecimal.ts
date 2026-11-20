import { MAX_INTEGER } from "./limits";
import { type AmountFraction } from "./types";

/** Preserves the exact digits of a validated, nonnegative decimal operand. */
export function fractionFromDecimal(decimal: string): AmountFraction | null {
  const [whole, fraction = ""] = decimal.split(".");
  const numerator = BigInt(whole + fraction);
  const denominator = 10n ** BigInt(fraction.length);

  return numerator > MAX_INTEGER * denominator
    ? null
    : { numerator, denominator };
}
