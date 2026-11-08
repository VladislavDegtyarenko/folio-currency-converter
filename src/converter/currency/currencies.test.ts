import { describe, expect, it } from "vitest";
import {
  currencyFlag,
  currencyName,
  currencyOptions,
  currencySymbol,
  getCurrency,
  isCurrencyCode,
} from "./currencies";
import { CURRENCY_NAMES } from "./currencyNames";

describe("API currency catalog", () => {
  it("renders every known API identifier in every interface language", () => {
    const codes = Object.keys(CURRENCY_NAMES);

    for (const locale of ["en", "ru", "uk"]) {
      const options = currencyOptions(codes, locale);
      expect(options).toHaveLength(codes.length);
      expect(options.every(({ name }) => name.length > 0)).toBe(true);
      expect(
        codes.every((code) => typeof getCurrency(code).flag === "string"),
      ).toBe(true);
    }
  });
  it("resolves the flag and symbol for every code in the bundled API catalog", () => {
    const currencies = Object.keys(CURRENCY_NAMES).map((code) => ({
      code,
      flag: currencyFlag(code),
      symbol: currencySymbol(code),
    }));

    expect(currencies).toMatchSnapshot();

    for (const { code, flag, symbol } of currencies) {
      expect(getCurrency(code)).toEqual({ code, flag, symbol });
    }
  });

  it.each([
    "BTC",
    "ETH",
    "XAU",
    "XAG",
    "XPD",
    "XPT",
    "1INCH",
    "XAF",
    "XOF",
    "XCD",
    "XCG",
    "XPF",
  ])("does not assign a country flag to %s", (code) => {
    expect(currencyFlag(code)).toBe("");
  });

  it.each([
    ["USD", "$"],
    ["EUR", "€"],
    ["UAH", "₴"],
    ["INR", "₹"],
    ["1INCH", ""],
    ["NEWCOIN", ""],
  ])("resolves the symbol for %s", (code, symbol) => {
    expect(currencySymbol(code)).toBe(symbol);
  });

  it.each(["BTC", "ETH", "1INCH", "XAU", "NEWCOIN"])(
    "accepts API code %s",
    (code) => {
      expect(isCurrencyCode(code)).toBe(true);
    },
  );

  it.each(["btc", "__proto__", "A-B", "", null, 123])(
    "rejects malformed identifiers",
    (code) => {
      expect(isCurrencyCode(code)).toBe(false);
    },
  );

  it("names crypto and metals without passing invalid codes to Intl", () => {
    expect(currencyName({ code: "BTC", locale: "ru" })).toBe("Bitcoin");
    expect(currencyName({ code: "1INCH", locale: "uk" })).toBe("1inch");
    expect(currencyName({ code: "XAU", locale: "en" }).toLowerCase()).toContain(
      "gold",
    );
    expect(currencyName({ code: "NEWCOIN", locale: "en" })).toBe("NEWCOIN");
    expect(currencyName({ code: "POL", locale: "en" })).toBe(
      "Polygon Ecosystem Token",
    );
    expect(currencyName({ code: "XCG", locale: "en" }).toLowerCase()).toContain(
      "caribbean",
    );
  });

  it("provides multilingual searches for all available codes without mutating order", () => {
    const codes = ["USD", "1INCH", "BTC", "INR", "XAU", "NEWCOIN"];
    const options = currencyOptions(codes, "uk");
    expect(options.map(({ code }) => code)).toEqual([
      "1INCH",
      "BTC",
      "INR",
      "NEWCOIN",
      "USD",
      "XAU",
    ]);
    expect(
      options
        .filter(({ search }) => search.includes("bitcoin"))
        .map(({ code }) => code),
    ).toEqual(["BTC"]);
    expect(options.find(({ code }) => code === "INR")?.search).toContain(
      "индий",
    );
    expect(options.find(({ code }) => code === "INR")?.search).toContain(
      "індій",
    );
    expect(codes[0]).toBe("USD");
  });

  it("uses country flags only where a currency has a known region", () => {
    expect(getCurrency("INR").flag).toBe("🇮🇳");
    expect(getCurrency("BTC").flag).toBe("");
    expect(getCurrency("1INCH")).toEqual({
      code: "1INCH",
      symbol: "",
      flag: "",
    });
    expect(getCurrency("NEWCOIN")).toEqual({
      code: "NEWCOIN",
      symbol: "",
      flag: "",
    });
  });
});
