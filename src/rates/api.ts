import { type Rates, restoreRates } from "./model";

export const RATES_URL =
  "https://latest.currency-api.pages.dev/v1/currencies/usd.json";

/** Loads one validated snapshot, leaving HTTP cache validation to the browser. */
export async function fetchRates(): Promise<Rates | null> {
  const response = await fetch(RATES_URL, {
    cache: "no-cache",
    signal: AbortSignal.timeout(15_000),
  });

  // Browsers normally combine a 304 with their cached body before resolving fetch.
  if (response.status === 304) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Rates request failed: ${response.status}`);
  }

  const rates = restoreRates(await response.json());

  if (!rates) {
    throw new Error("Invalid rates response");
  }

  return rates;
}
