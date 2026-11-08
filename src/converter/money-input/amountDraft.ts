import { parseAmount } from "../amounts";

/** Builds the locale's decimal, grouping and digit rules once per input locale. */
export function createAmountFormat(locale: string) {
  const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const group = parts.find((part) => part.type === "group")?.value ?? "";
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const digits = Array.from({ length: 10 }, (_, digit) =>
    integer.format(digit),
  );

  return { integer, group, decimal, digits };
}

type AmountFormat = ReturnType<typeof createAmountFormat>;

/** Removes locale grouping and converts localized digits to a plain decimal draft. */
function normalizeDraft(text: string, format: AmountFormat) {
  let plain = text;

  if (format.group) {
    plain = plain.split(format.group).join("");
  }

  if (format.group.trim() === "") {
    plain = plain.replace(/ /g, ""); // Accept ordinary spaces pasted instead of nonbreaking groups.
  }

  for (const [digit, localized] of format.digits.entries()) {
    plain = plain.split(localized).join(String(digit));
  }

  return plain.split(format.decimal).join(".");
}

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

/** Includes the adjacent digit when Backspace or Delete lands on an automatic group. */
export function getGroupDeletion({
  text,
  start,
  end,
  key,
  group,
}: {
  text: string;
  start: number;
  end: number;
  key: string;
  group: string;
}) {
  if (!group || start !== end) {
    return null;
  }

  if (
    key === "Backspace" &&
    text.slice(start - group.length, start) === group
  ) {
    return { start: Math.max(0, start - group.length - 1), end };
  }

  if (key === "Delete" && text.slice(start, start + group.length) === group) {
    return { start, end: Math.min(text.length, start + group.length + 1) };
  }

  return null;
}
