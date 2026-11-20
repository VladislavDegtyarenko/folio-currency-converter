import { describe, expect, it } from "vitest";
import { createAmountFormat } from "./createAmountFormat";
import { normalizeDigits } from "./normalizeDigits";

describe("normalizeDigits", () => {
  it.each([
    ["ar-EG", "٠١٢٣٤٥٦٧٨٩", "0123456789"],
    ["ar-EG", "١٬٢3٤٫٥٠", "1٬234٫50"],
    ["en-US", "1,234.50 + 6", "1,234.50 + 6"],
    ["fa-IR", "۰۱۲۳۴۵۶۷۸۹", "0123456789"],
    ["ar-EG", "", ""],
  ])("normalizes digits in %s text %j", (locale, text, expected) => {
    expect(normalizeDigits(text, createAmountFormat(locale))).toBe(expected);
  });
});
