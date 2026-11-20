import { describe, expect, it } from "vitest";
import { addFractions } from "./addFractions";

describe("addFractions", () => {
  it("adds a fraction to zero", () => {
    expect(
      addFractions(
        { numerator: 0n, denominator: 1n },
        { numerator: 2n, denominator: 3n },
      ),
    ).toEqual({ numerator: 2n, denominator: 3n });
  });

  it("preserves the denominator when both fractions share it", () => {
    expect(
      addFractions(
        { numerator: 7n, denominator: 10n },
        { numerator: -6n, denominator: 10n },
      ),
    ).toEqual({ numerator: 1n, denominator: 10n });
  });

  it("uses a common denominator for different fractions", () => {
    expect(
      addFractions(
        { numerator: 1n, denominator: 3n },
        { numerator: 1n, denominator: 10n },
      ),
    ).toEqual({ numerator: 13n, denominator: 30n });
  });

  it("keeps a negative intermediate sum exact", () => {
    expect(
      addFractions(
        { numerator: -1n, denominator: 2n },
        { numerator: 1n, denominator: 3n },
      ),
    ).toEqual({ numerator: -1n, denominator: 6n });
  });
});
