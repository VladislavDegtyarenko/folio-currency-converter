import { type CurrencyCode, currencyName, currencyOptions } from "./currencies";
import { CURRENCY_NAMES } from "./currencyNames";
import { CURRENCY_REGIONS } from "./currencyRegions";

const MAJOR_CURRENCIES = ["GBP", "CHF", "JPY", "CAD", "AUD", "CNY"];
const HISTORICAL = new Set(
  "ANG ATS AZM BEF BGN BYR CUC CYP DEM EEK ESP FIM FRF GHC GRD HRK IEP ITL LTL LUF LVL MGF MRO MTL MZM NLG PTE ROL SDD SIT SKK SLL SRG STD SVC TMM TRL VAL VEB VEF ZMK ZWD ZWL".split(
    " ",
  ),
);
const METALS = new Set(["XAU", "XAG", "XPD", "XPT"]);
const UNITS = new Set(["XDR", "MXV"]);
const SHARED_FIAT = new Set(["XAF", "XOF", "XCD", "XCG", "XPF", "SPL"]);

// Current regional currencies override decorative flags and historical associations.
const REGION_OVERRIDES: Record<string, string> = Object.fromEntries(
  `AD:EUR AT:EUR AX:EUR BE:EUR BG:EUR BL:EUR CY:EUR DE:EUR EE:EUR ES:EUR FI:EUR
   FR:EUR GF:EUR GP:EUR GR:EUR HR:EUR IE:EUR IT:EUR LT:EUR LU:EUR LV:EUR MC:EUR
   ME:EUR MF:EUR MQ:EUR MT:EUR NL:EUR PM:EUR PT:EUR RE:EUR SI:EUR SK:EUR SM:EUR
   TF:EUR VA:EUR XK:EUR YT:EUR
   AS:USD BQ:USD EC:USD FM:USD GU:USD IO:USD MH:USD MP:USD PR:USD PW:USD SV:USD
   TC:USD TL:USD UM:USD VG:USD VI:USD
   AG:XCD AI:XCD DM:XCD GD:XCD KN:XCD LC:XCD MS:XCD VC:XCD
   BJ:XOF BF:XOF CI:XOF GW:XOF ML:XOF NE:XOF SN:XOF TG:XOF
   CM:XAF CF:XAF CG:XAF GA:XAF GQ:XAF TD:XAF
   NC:XPF PF:XPF WF:XPF CW:XCG SX:XCG
   CK:NZD NU:NZD PN:NZD TK:NZD BV:NOK SJ:NOK GS:GBP FK:FKP
   LI:CHF PS:ILS AQ:USD ZW:ZWG`
    .trim()
    .split(/\s+/) // Separate the region:currency entries in the bundled table.
    .map((pair) => pair.split(":")),
);
const REGION_CURRENCIES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(CURRENCY_REGIONS)
      .filter(
        ([code, region]) =>
          !HISTORICAL.has(code) &&
          !UNITS.has(code) &&
          region !== "EU" &&
          code !== "CNH",
      )
      .map(([code, region]) => [region, code]),
  ),
  ...REGION_OVERRIDES,
};
const REGION_ALIASES: Record<string, string[]> = {
  US: ["USA", "US", "United States of America", "America", "США", "Америка"],
  GB: [
    "UK",
    "GBR",
    "Britain",
    "Great Britain",
    "Великобритания",
    "Велика Британія",
  ],
  UA: ["UKR"],
  HR: ["HRV", "Hrvatska"],
  AE: ["UAE", "ARE", "ОАЭ", "ОАЕ"],
};

export const CURRENCY_GROUPS = [
  "major",
  "fiat",
  "crypto",
  "metals",
  "historical",
  "units",
  "other",
] as const;
export type CurrencyGroup = (typeof CURRENCY_GROUPS)[number];
type Option = ReturnType<typeof currencyOptions>[number];

/** Normalizes case, accents and spacing for multilingual catalog searches. */
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // Remove combining accents and collapse whitespace.
}

/** Reads an explicitly supplied region without guessing one from a language. */
function localeRegion(value: string) {
  try {
    return new Intl.Locale(value.replaceAll("_", "-")).region;
  } catch {
    return undefined;
  }
}

/** Classifies known assets while keeping unknown future API codes accessible. */
export function currencyGroup(
  code: CurrencyCode,
): Exclude<CurrencyGroup, "major"> {
  if (HISTORICAL.has(code)) {
    return "historical";
  }
  if (METALS.has(code)) {
    return "metals";
  }
  if (UNITS.has(code)) {
    return "units";
  }
  if (CURRENCY_REGIONS[code] || SHARED_FIAT.has(code)) {
    return "fiat";
  }
  return CURRENCY_NAMES[code] ? "crypto" : "other";
}

/** Builds country aliases separately from decorative currency flags. */
export function catalogOptions(codes: CurrencyCode[], locale: string) {
  const regionNames = [...new Set([locale, "en", "ru", "uk", "hr"])].map(
    (language) => new Intl.DisplayNames([language], { type: "region" }),
  );
  return currencyOptions(codes, locale).map((option) => {
    const regions = Object.entries(REGION_CURRENCIES)
      .filter(([, code]) => code === option.code)
      .map(([region]) => region);
    const historicalRegion = CURRENCY_REGIONS[option.code];
    if (HISTORICAL.has(option.code) && historicalRegion) {
      regions.push(historicalRegion);
    }
    const countries = regions
      .flatMap((region) => [
        region,
        ...regionNames.map((names) => names.of(region) ?? region),
        ...(REGION_ALIASES[region] ?? []),
      ])
      .map(normalize);
    const names = [...new Set([locale, "en", "ru", "uk"])].map((language) =>
      normalize(currencyName({ code: option.code, locale: language })),
    );
    return {
      ...option,
      names,
      countries,
      regions,
      search: normalize(option.search),
    };
  });
}

/** Places available major currencies first, using the browser's first explicit region. */
export function groupCurrencies(
  options: Option[],
  languages: readonly string[],
) {
  const region = languages.map(localeRegion).find(Boolean);
  const local = region ? REGION_CURRENCIES[region] : undefined;
  const major = [
    ...new Set(["USD", "EUR", ...(local ? [local] : []), ...MAJOR_CURRENCIES]),
  ];
  return CURRENCY_GROUPS.map((id) => ({
    id,
    options:
      id === "major"
        ? major.flatMap((code) =>
            options.filter((option) => option.code === code),
          )
        : options.filter(
            ({ code }) => !major.includes(code) && currencyGroup(code) === id,
          ),
  })).filter(({ options: entries }) => entries.length > 0);
}

/** Scores exact codes and names before country matches and partial names. */
function searchScore(
  option: ReturnType<typeof catalogOptions>[number],
  search: string,
  region: string | undefined,
) {
  const code = normalize(option.code);
  if (code === search) {
    return 0;
  }
  if (option.names.includes(search)) {
    return 1;
  }
  if (code.startsWith(search)) {
    return 2;
  }
  if (
    option.countries.includes(search) ||
    (region && option.regions.includes(region))
  ) {
    return 3;
  }
  if (option.names.some((name) => name.startsWith(search))) {
    return 4;
  }
  if (option.countries.some((country) => country.startsWith(search))) {
    return 5;
  }
  if (
    option.search.includes(search) ||
    option.countries.some((country) => country.includes(search))
  ) {
    return 6;
  }
  return Infinity;
}

/** Ranks search results while keeping historical country matches below current currencies. */
export function searchCurrencies(
  options: ReturnType<typeof catalogOptions>,
  query: string,
) {
  const search = normalize(query);
  const region = localeRegion(query.trim());
  return options
    .map((option) => {
      let score = searchScore(option, search, region);
      if (score >= 2 && currencyGroup(option.code) === "historical") {
        score += 5;
      }
      return { option, score };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort(
      (a, b) => a.score - b.score || a.option.code.localeCompare(b.option.code),
    )
    .map(({ option }) => option);
}
