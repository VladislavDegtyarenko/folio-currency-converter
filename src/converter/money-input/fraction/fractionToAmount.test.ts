import { describe, expect, it } from "vitest";
import { fractionToAmount } from "./fractionToAmount";

describe("fractionToAmount", () => {
  it.each([
    [0n, 3n, 0],
    [1n, 3n, 1 / 3],
    [1n, 100_000_000_000_000_000n, 1e-17],
    [5n, 10n ** 324n, Number.MIN_VALUE],
    [1n, 10n ** 324n, 0],
    [999_999_999_999n, 1n, 999_999_999_999],
    [-1n, 10n ** 324n, null],
    [1_000_000_000_000n, 1n, null],
    [99_999_999_999_900_000_001n, 100_000_000n, null],
  ])(
    "converts %s/%s after checking the exact result",
    (numerator, denominator, expected) => {
      expect(fractionToAmount({ numerator, denominator })).toBe(expected);
    },
  );
});
