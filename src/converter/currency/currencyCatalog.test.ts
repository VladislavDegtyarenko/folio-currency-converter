import { describe, expect, it } from "vitest";
import {
  catalogOptions,
  currencyGroup,
  groupCurrencies,
  searchCurrencies,
} from "./currencyCatalog";
import { CURRENCY_NAMES } from "./currencyNames";

const options = catalogOptions(
  [...Object.keys(CURRENCY_NAMES), "NEWCOIN"],
  "uk",
);

/** Returns ranked codes from the complete bundled catalog. */
function search(query: string) {
  return searchCurrencies(options, query).map(({ code }) => code);
}

describe("currency groups", () => {
  it.each([
    [["uk-UA"], ["USD", "EUR", "UAH", "GBP"]],
    [["hr-HR"], ["USD", "EUR", "GBP", "CHF"]],
    [
      ["en", "pl-PL"],
      ["USD", "EUR", "PLN", "GBP"],
    ],
    [["en"], ["USD", "EUR", "GBP", "CHF"]],
    [
      ["invalid!", "ja-JP"],
      ["USD", "EUR", "JPY", "GBP"],
    ],
  ])("uses the first explicit browser region in %j", (languages, expected) => {
    expect(
      groupCurrencies(options, languages)[0]
        .options.slice(0, 4)
        .map(({ code }) => code),
    ).toEqual(expected);
  });

  it("includes every code exactly once and preserves alphabetic category order", () => {
    const groups = groupCurrencies(options, ["uk-UA"]);
    const codes = groups.flatMap(({ options: entries }) =>
      entries.map(({ code }) => code),
    );
    expect(codes).toHaveLength(options.length);
    expect(new Set(codes).size).toBe(options.length);
    for (const group of groups.slice(1)) {
      const entries = group.options.map(({ code }) => code);
      expect(entries).toEqual([...entries].sort());
    }
  });

  it.each([
    ["EUR", "fiat"],
    ["XAF", "fiat"],
    ["HRK", "historical"],
    ["BGN", "historical"],
    ["BTC", "crypto"],
    ["USDT", "crypto"],
    ["PAXG", "crypto"],
    ["XAU", "metals"],
    ["XDR", "units"],
    ["MXV", "units"],
    ["NEWCOIN", "other"],
  ])("classifies %s as %s", (code, expected) => {
    expect(currencyGroup(code)).toBe(expected);
  });

  it("omits unavailable codes and empty groups in older caches", () => {
    const groups = groupCurrencies(
      catalogOptions(["USD", "EUR", "GBP"], "en"),
      ["uk-UA"],
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].options.map(({ code }) => code)).toEqual([
      "USD",
      "EUR",
      "GBP",
    ]);
    expect(groupCurrencies([], ["uk-UA"])).toEqual([]);
  });
});

describe("country and locale search", () => {
  it.each([
    ["USA", "USD"],
    ["США", "USD"],
    ["United States", "USD"],
    ["Croatia", "EUR"],
    ["Hrvatska", "EUR"],
    ["Хорватія", "EUR"],
    ["Україна", "UAH"],
    ["Украина", "UAH"],
    ["Ukraine", "UAH"],
    ["en-US", "USD"],
    ["uk-UA", "UAH"],
    ["hr-HR", "EUR"],
    ["hr_HR", "EUR"],
    ["de-DE", "EUR"],
    ["fr-FR", "EUR"],
    ["UK", "GBP"],
    ["UAE", "AED"],
    ["Bulgaria", "EUR"],
    ["cote d’ivoire", "XOF"],
    ["  uSd  ", "USD"],
    ["HRK", "HRK"],
    ["Bitcoin", "BTC"],
    ["євро", "EUR"],
  ])("ranks %s with %s first", (query, expected) => {
    expect(search(query)[0]).toBe(expected);
  });

  it("places the historical currency below the current currency", () => {
    expect(search("Croatia")).toEqual(["EUR", "HRK"]);
    expect(search("hr-HR")).toEqual(["EUR", "HRK"]);
  });

  it("does not infer a region from language-only or malformed locales", () => {
    expect(search("en")).not.toEqual(["USD"]);
    expect(search("en-INVALID!")).toEqual([]);
    expect(search("unmatched country")).toEqual([]);
  });
});
