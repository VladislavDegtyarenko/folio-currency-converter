import { parseAmount } from "../../amounts";
import { type AmountFormat } from "./createAmountFormat";
import { normalizeDraft } from "./normalizeDraft";

/** Formats a draft without rounding its fraction, preserving the caret's digit position. */
export function formatAmountDraft({
  text,
  caret,
  format,
}: {
  text: string;
  caret: number;
  format: AmountFormat;
}) {
  let plain = normalizeDraft(text, format);
  let prefixLength = normalizeDraft(text.slice(0, caret), format).length;

  if (plain.startsWith(".")) {
    plain = `0${plain}`;
    prefixLength += 1;
  }

  const amount = parseAmount(plain);

  if (amount === null) {
    return { text, caret, amount };
  }

  const [whole, fraction] = plain.split(".");
  const integer = format.integer.format(Number(whole));
  const removedZeros = whole.length - String(Number(whole)).length;
  const position = Math.max(0, prefixLength - removedZeros);
  let formatted = integer;

  if (fraction !== undefined) {
    formatted += format.decimal;
    formatted += [...fraction]
      .map((digit) => format.digits[Number(digit)])
      .join("");
  }

  let nextCaret = 0;
  let consumed = 0;

  while (nextCaret < formatted.length && consumed < position) {
    if (!format.group || !formatted.startsWith(format.group, nextCaret)) {
      consumed += 1;
      nextCaret += 1;
    } else {
      nextCaret += format.group.length;
    }
  }

  return { text: formatted, caret: nextCaret, amount };
}
