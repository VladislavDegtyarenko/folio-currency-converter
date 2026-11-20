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

export type AmountFormat = ReturnType<typeof createAmountFormat>;
