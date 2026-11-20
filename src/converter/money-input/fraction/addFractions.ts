import { type AmountFraction } from "./types";

/** Adds two exact values using a common denominator. */
export function addFractions(left: AmountFraction, right: AmountFraction) {
  if (left.numerator === 0n) {
    return right;
  }

  if (left.denominator === right.denominator) {
    return {
      numerator: left.numerator + right.numerator,
      denominator: left.denominator,
    };
  }

  return {
    numerator:
      left.numerator * right.denominator + right.numerator * left.denominator,
    denominator: left.denominator * right.denominator,
  };
}
