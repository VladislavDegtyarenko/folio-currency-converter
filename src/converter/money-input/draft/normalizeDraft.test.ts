import { describe, expect, it } from "vitest";
import { createAmountFormat } from "./createAmountFormat";
import { normalizeDraft } from "./normalizeDraft";

describe("normalizeDraft", () => {
  it.each([
    ["en-US", "1,234.50", "1234.50"],
    ["de-DE", "1.234,", "1234."],
    ["fr-FR", "1 234\u00a0567\u202f890,00", "1234567890.00"],
    ["ar-EG", "١٢٬٣٤٥٫٦٠", "12345.60"],
    ["en-US", "1 234.50", "1 234.50"],
    ["en-US", "1.2.3", "1.2.3"],
    ["de-DE", "", ""],
  ])(
    "normalizes number punctuation in %s text %j",
    (locale, text, expected) => {
      expect(normalizeDraft(text, createAmountFormat(locale))).toBe(expected);
    },
  );
});
