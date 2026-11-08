import { describe, expect, it } from "vitest";
import { type Rates } from "../rates/model";
import { convertAmount, formatAmount, parseAmount, toEuros } from "./amounts";

const RATES: Rates = {
  date: "2026-11-03",
  usd: {
    USD: 1,
    EUR: 0.8,
    UAH: 40,
    GBP: 0.7,
    PLN: 4,
    JPY: 150,
    CHF: 0.9,
    CZK: 24,
    RON: 4.5,
    HUF: 350,
    CAD: 1.4,
    AUD: 1.6,
  },
};

describe("amount input and conversion", () => {
  it.each([
    ["100", 100],
    ["0", 0],
    ["12,5", 12.5],
    ["12.5", 12.5],
    ["0.", 0],
  ])("parses %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
  it.each([
    "",
    "1,234.56",
    "1 234",
    "Infinity",
    "-1",
    "1e6",
    "9999999999999",
    "1.123456789",
  ])("rejects ambiguous or unsafe input %s", (input) => {
    expect(parseAmount(input)).toBeNull();
  });
  it("converts from a shared amount without compounded rounding", () => {
    expect(convertAmount({ euros: 200, code: "USD", rates: RATES })).toBe(250);
    expect(convertAmount({ euros: 200, code: "UAH", rates: RATES })).toBe(
      10000,
    );
    expect(formatAmount({ value: 1234.56, locale: "de-DE", digits: 2 })).toBe(
      "1.234,56",
    );
  });
  it("uses the same snapshot for editing and displaying any supported currency", () => {
    const euros = toEuros({ amount: 100, code: "UAH", rates: RATES });
    expect(euros).toBe(2);
    expect(convertAmount({ euros, code: "USD", rates: RATES })).toBe(2.5);
    expect(convertAmount({ euros, code: "UAH", rates: RATES })).toBe(100);
    const changed = { ...RATES, usd: { ...RATES.usd, UAH: 48 } };
    expect(convertAmount({ euros, code: "UAH", rates: changed })).toBe(120);
  });
  it("converts crypto, metals and digit-prefixed codes through the same common amount", () => {
    const rates = {
      ...RATES,
      usd: { ...RATES.usd, BTC: 0.00001, "1INCH": 12, XAU: 0.0002 },
    };
    const euros = toEuros({ amount: 0.1, code: "BTC", rates });
    expect(euros).toBeCloseTo(8000);
    expect(convertAmount({ euros, code: "USD", rates })).toBeCloseTo(10000);
    expect(convertAmount({ euros, code: "1INCH", rates })).toBeCloseTo(120000);
    expect(convertAmount({ euros, code: "XAU", rates })).toBeCloseTo(2);
  });
});
