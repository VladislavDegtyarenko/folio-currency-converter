import { describe, expect, it } from "vitest";
import { fractionFromDecimal } from "./fractionFromDecimal";

describe("fractionFromDecimal", () => {
  it.each([
    ["0", 0n, 1n],
    ["12.", 12n, 1n],
    ["0001.20", 120n, 100n],
    ["0.00000001", 1n, 100_000_000n],
    ["999999999998.99999999", 99_999_999_999_899_999_999n, 100_000_000n],
    ["999999999999.00000000", 99_999_999_999_900_000_000n, 100_000_000n],
  ])("keeps all decimal digits in %s", (decimal, numerator, denominator) => {
    expect(fractionFromDecimal(decimal)).toEqual({ numerator, denominator });
  });

  it.each(["1000000000000", "999999999999.00000001"])(
    "rejects %s above the exact maximum",
    (decimal) => {
      expect(fractionFromDecimal(decimal)).toBeNull();
    },
  );
});
