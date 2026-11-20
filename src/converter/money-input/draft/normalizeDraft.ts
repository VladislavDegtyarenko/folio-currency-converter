import { type AmountFormat } from "./createAmountFormat";
import { GROUP_SPACES } from "./groupSpaces";
import { normalizeDigits } from "./normalizeDigits";

/** Removes locale grouping and converts localized digits to a plain decimal draft. */
export function normalizeDraft(text: string, format: AmountFormat) {
  let plain = text;

  if (format.group) {
    plain = plain.split(format.group).join("");
  }

  if (format.group.trim() === "") {
    plain = plain.replace(GROUP_SPACES, "");
  }

  return normalizeDigits(plain, format).split(format.decimal).join(".");
}
