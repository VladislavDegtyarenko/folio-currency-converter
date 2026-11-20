import { describe, expect, it } from "vitest";
import { createAmountFormat } from "./createAmountFormat";
import { parseAmountOperand } from "./parseAmountOperand";

describe("parseAmountOperand", () => {
  it.each([
    ["en-US", "  1234  ", 1_234n, 1n],
    ["en-US", "1,234.50", 123_450n, 100n],
    ["en-US", ".5", 5n, 10n],
    ["en-US", "12.", 12n, 1n],
    ["en-US", "0.00000001", 1n, 100_000_000n],
    ["en-US", "999,999,999,999", 999_999_999_999n, 1n],
    ["en-IN", "12,34,567", 1_234_567n, 1n],
    ["de-DE", "1.234,50", 123_450n, 100n],
    ["fr-FR", "1 234,50", 123_450n, 100n],
    ["fr-FR", "1\u00a0234,50", 123_450n, 100n],
    ["fr-FR", "1\u202f234,50", 123_450n, 100n],
    ["ar-EG", "١٬٢٣٤٫٥٠", 123_450n, 100n],
  ])("parses %s operand %j exactly", (locale, text, numerator, denominator) => {
    expect(parseAmountOperand(text, createAmountFormat(locale))).toEqual({
      numerator,
      denominator,
    });
  });

  it.each([
    ["en-US", ""],
    ["en-US", "."],
    ["en-US", "-1"],
    ["en-US", "1e6"],
    ["en-US", "1.2.3"],
    ["en-US", "1,23"],
    ["en-US", "1.2,34"],
    ["en-US", "1 234"],
    ["en-US", "1000000000000"],
    ["en-US", "999999999999.00000001"],
    ["en-US", "1.123456789"],
    ["en-IN", "1,234,567"],
    ["fr-FR", "1  234"],
    ["fr-FR", "1,2 34"],
  ])("rejects invalid %s operand %j", (locale, text) => {
    expect(parseAmountOperand(text, createAmountFormat(locale))).toBeNull();
  });
});
