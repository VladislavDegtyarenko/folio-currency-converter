import { describe, expect, it } from "vitest";
import { createAmountFormat } from "../draft/createAmountFormat";
import { formatFraction } from "./formatFraction";

describe("formatFraction", () => {
  it.each([
    ["en-US", 0n, 1n, "0"],
    ["en-US", 12_345n, 10n, "1,234.5"],
    ["en-US", 1n, 3n, "0.33333333"],
    ["en-US", 2n, 3n, "0.66666667"],
    ["en-US", 1n, 200_000_001n, "0"],
    ["en-US", 1n, 200_000_000n, "0.00000001"],
    ["en-US", 999_999_999_999n, 1_000_000_000n, "1,000"],
    [
      "en-US",
      99_999_999_999_899_999_999n,
      100_000_000n,
      "999,999,999,998.99999999",
    ],
    ["fr-FR", 123_405n, 100n, "1\u202f234,05"],
    ["ar-EG", 123_405n, 100n, "١٬٢٣٤٫٠٥"],
  ])("formats %s result %s/%s", (locale, numerator, denominator, expected) => {
    expect(
      formatFraction({ numerator, denominator }, createAmountFormat(locale)),
    ).toBe(expected);
  });
});
