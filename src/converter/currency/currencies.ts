import { CURRENCY_NAMES } from "./currencyNames";
import { CURRENCY_REGIONS } from "./currencyRegions";

export type CurrencyCode = string;

const DISPLAY_NAMES = new Map<string, Intl.DisplayNames>();

/** Accepts API currency identifiers, including digit-prefixed cryptocurrency codes. */
export function isCurrencyCode(value: unknown): value is CurrencyCode {
  // Restrict identifiers to short alphanumeric codes, excluding object property names.
  return typeof value === "string" && /^[A-Z0-9]{2,12}$/.test(value);
}

/** Resolves a decorative flag only for a currency with a known region. */
export function currencyFlag(code: CurrencyCode) {
  const region = CURRENCY_REGIONS[code];

  return region
    ? [...region]
        .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
        .join("")
    : "";
}

/** Resolves a known symbol, or returns an empty string when none is available. */
export function currencySymbol(code: CurrencyCode) {
  // Intl currency formatting accepts only three-letter codes, not codes like 1INCH.
  if (!/^[A-Z]{3}$/.test(code)) {
    return "";
  }

  const part = new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((value) => value.type === "currency")?.value;

  return part && part !== code ? part : "";
}

/** Provides symbols and optional decorative country flags without guessing token flags. */
export function getCurrency(code: CurrencyCode) {
  const flag = currencyFlag(code);
  const symbol = currencySymbol(code);

  return { code, symbol, flag };
}

/** Uses localized browser names for fiat currencies and bundled names for other assets. */
export function currencyName({
  code,
  locale,
}: {
  code: CurrencyCode;
  locale: string;
}) {
  // Intl.DisplayNames accepts only three-letter currency codes.
  if (/^[A-Z]{3}$/.test(code)) {
    let names = DISPLAY_NAMES.get(locale);

    if (!names) {
      names = new Intl.DisplayNames([locale], {
        type: "currency",
        fallback: "none",
      });
      DISPLAY_NAMES.set(locale, names);
    }

    const name = names.of(code);

    if (name) {
      return name;
    }
  }

  return CURRENCY_NAMES[code] || code;
}

/** Prepares multilingual search entries once per catalog or locale change. */
export function currencyOptions(codes: CurrencyCode[], locale: string) {
  return [...codes].sort().map((code) => {
    const names = [...new Set([locale, "en", "ru", "uk"])].map((language) =>
      currencyName({ code, locale: language }),
    );

    return {
      code,
      name: names[0],
      search: `${code} ${names.join(" ")}`.toLocaleLowerCase(locale),
    };
  });
}
