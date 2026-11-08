import { describe, expect, it } from "vitest";
import { restoreRates } from "./model";

const PAYLOAD = {
  date: "2026-11-03",
  usd: { eur: 1, usd: 1, uah: 1, gbp: 1, pln: 1 },
};

describe("rates validation", () => {
  it("retains every returned currency and round-trips the stored snapshot", () => {
    const rates = restoreRates({
      ...PAYLOAD,
      usd: {
        ...PAYLOAD.usd,
        eur: 0.8,
        uah: 40,
        btc: 0.00001,
        "1inch": 12,
        xau: 0.0002,
        newcoin: 3,
      },
    });
    expect(rates?.usd.EUR).toBe(0.8);
    expect(rates?.usd.UAH).toBe(40);
    expect(rates?.usd.BTC).toBe(0.00001);
    expect(rates?.usd["1INCH"]).toBe(12);
    expect(rates?.usd.XAU).toBe(0.0002);
    expect(rates?.usd.NEWCOIN).toBe(3);
    expect(Object.keys(rates?.usd ?? {})).toHaveLength(
      Object.keys(PAYLOAD.usd).length + 4,
    );
    expect(restoreRates(rates)).toEqual(rates);
  });

  it("requires EUR and USD but accepts a small catalog", () => {
    expect(
      restoreRates({
        date: PAYLOAD.date,
        usd: { usd: 1, eur: 0.8, btc: 0.00001 },
      })?.usd,
    ).toEqual({ USD: 1, EUR: 0.8, BTC: 0.00001 });
    expect(restoreRates({ date: PAYLOAD.date, usd: { usd: 1 } })).toBeNull();
  });

  it.each([
    { "new-token": 1 },
    { NEWTOKEN: 0 },
    { NEWTOKEN: Infinity },
    { NEWTOKEN: "1" },
    { EUR: 1 },
    Object.fromEntries([["__proto__", 1]]),
  ])("rejects invalid new entries and conflicting code casing", (extra) => {
    expect(
      restoreRates({ ...PAYLOAD, usd: { ...PAYLOAD.usd, ...extra } }),
    ).toBeNull();
  });

  it.each([
    null,
    [],
    {},
    { ...PAYLOAD, date: "2026-02-30" },
    { ...PAYLOAD, date: "03/11/2026" },
    { ...PAYLOAD, usd: [] },
  ])("rejects malformed snapshots", (value) => {
    expect(restoreRates(value)).toBeNull();
  });

  it.each([undefined, null, "40", 0, -1, NaN, Infinity])(
    "rejects missing or invalid supported rates: %s",
    (uah) => {
      expect(
        restoreRates({ ...PAYLOAD, usd: { ...PAYLOAD.usd, uah } }),
      ).toBeNull();
    },
  );

  it("requires a USD base of one", () => {
    expect(
      restoreRates({ ...PAYLOAD, usd: { ...PAYLOAD.usd, usd: 2 } }),
    ).toBeNull();
  });
});
