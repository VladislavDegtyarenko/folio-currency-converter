import { parseAmount } from "../../amounts";
import { fractionFromDecimal } from "../fraction/fractionFromDecimal";
import { type AmountFormat } from "./createAmountFormat";
import { GROUP_SPACES } from "./groupSpaces";
import { normalizeDigits } from "./normalizeDigits";

/** Validates a localized operand and converts its digits to an exact fraction. */
export function parseAmountOperand(text: string, format: AmountFormat) {
  const plain = normalizeDigits(text.trim(), format);
  const [whole, fraction, ...extra] = plain.split(format.decimal);
  const digitsOnly = /^\d*$/; // Allows an empty integer or a trailing decimal separator.
  const groupedWhole =
    format.group && !format.group.trim()
      ? whole.replace(GROUP_SPACES, format.group)
      : whole;
  const hasGroups = Boolean(
    format.group && groupedWhole.includes(format.group),
  );
  const integer = hasGroups
    ? groupedWhole.split(format.group).join("")
    : groupedWhole;

  if (
    extra.length > 0 ||
    (!integer && !fraction) ||
    !digitsOnly.test(integer) ||
    (fraction !== undefined && !digitsOnly.test(fraction))
  ) {
    return null;
  }

  if (
    hasGroups &&
    groupedWhole !==
      normalizeDigits(format.integer.format(Number(integer)), format)
  ) {
    return null;
  }

  const decimal = fraction === undefined ? "" : `.${fraction}`;
  const operand = `${integer || "0"}${decimal}`;
  return parseAmount(operand) === null ? null : fractionFromDecimal(operand);
}
