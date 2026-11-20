import { describe, expect, it } from "vitest";
import { formatAmountEdit } from "./amountExpression";
import { createAmountFormat } from "./draft/createAmountFormat";

/** Simulates editing a localized amount or expression. */
function edit(text: string, locale = "en-US", caret = text.length) {
  return formatAmountEdit({ text, caret, format: createAmountFormat(locale) });
}

describe("amount expressions", () => {
  it.each([
    ["  12   + 3 =  ", 15],
    ["30 - 2 * 4 + 9 / 3=", 25],
    ["24 / 2 / 3=", 4],
    ["6 × 3 ÷ 2 − 9=", 0],
    ["1 - 2 + 3=", 2],
    [".5 + 0.1=", 0.6],
    ["0.3 - 0.1 - 0.2=", 0],
    ["0.7 - 0.1 - 0.6=", 0],
    ["0.1 / 3 * 3 - 0.1=", 0],
  ])("evaluates %s using standard operation order", (text, amount) => {
    expect(edit(text)).toEqual({
      text: String(amount),
      caret: String(amount).length,
      amount,
    });
  });

  it.each([
    ["en-US", "1,234.50 + 0.5=", "1,235"],
    ["en-US", "999,999,999,998.99999999 + 0=", "999,999,999,998.99999999"],
    ["de-DE", "1 / 200000000=", "0,00000001"],
    ["de-DE", "1.234,50 + 0,5=", "1.235"],
    ["ru-RU", "1 234,50 +  0,5=", "1\u00a0235"],
    ["fr-FR", "1\u202f234,50 + 0,25=", "1\u202f234,75"],
    ["en-IN", "12,34,567 / 2=", "6,17,283.5"],
    ["ar-EG", "١٢٣٤٫٥٠ + ٠٫٥=", "١٬٢٣٥"],
  ])("uses the number separators and digits for %s", (locale, text, result) => {
    const submitted = edit(text, locale);
    const expression = text.slice(0, -1);
    expect(edit(expression, locale)).toEqual({
      text: expression,
      caret: expression.length,
      amount: submitted.amount,
      isExpression: true,
    });
    expect(submitted).toMatchObject({
      text: result,
      caret: result.length,
    });
  });

  it("keeps an ordinary amount formatted and spaces before an operator", () => {
    expect(edit("1234.50  ")).toEqual({
      text: "1,234.50  ",
      caret: 10,
      amount: 1234.5,
    });
  });

  it("evaluates a complete expression without changing its text or caret", () => {
    expect(edit("100 +  5.25 * 2", "en-US", 8)).toEqual({
      text: "100 +  5.25 * 2",
      caret: 8,
      amount: 110.5,
      isExpression: true,
    });
  });

  it("converts a decimal expression to zero before equals is entered", () => {
    expect(edit("0.3 - 0.1 - 0.2")).toMatchObject({
      amount: 0,
      isExpression: true,
    });
  });

  it("keeps small differences between large amounts", () => {
    expect(edit("999,999,999,999 - 999,999,999,998.99999999=")).toEqual({
      text: "0.00000001",
      caret: 10,
      amount: 0.00000001,
    });
  });

  it.each(["12 + ", "12 + .", "12 * 2 + "])(
    "keeps incomplete expression %s editable without converting",
    (text) => {
      expect(edit(text, "en-US", 3)).toEqual({
        text,
        caret: 3,
        amount: null,
        isPending: true,
      });
    },
  );

  it.each([
    ["en-US", "1 / 0"],
    ["en-US", "1 / 0="],
    ["en-US", "1 - 2"],
    ["en-US", "1 - 2="],
    ["en-US", "1 - 1 - 0.00000001 * 0.00000001="],
    ["en-US", "999,999,999,998.99999999 - 999,999,999,999="],
    ["en-US", "999,999,999,999 + 1"],
    ["en-US", "999,999,999,999 + 1="],
    ["en-US", "999,999,999,999 + 0.00000001="],
    ["en-US", "1 + 0.123456789="],
    ["en-US", "12 + ="],
    ["en-US", "12 + * 3"],
    ["en-US", "12 + words="],
    ["en-US", "1++2="],
    ["en-US", "1 + 2=="],
    ["en-US", "1 = + 2"],
    ["en-US", "1,2 + 3="],
    ["en-US", "1.2,34 + 3="],
    ["ru-RU", "1  2 + 3="],
    ["ru-RU", "1,2 34 + 3="],
  ])("keeps invalid %s input %s with no new amount", (locale, text) => {
    expect(edit(text, locale)).toEqual({
      text,
      caret: text.length,
      amount: null,
    });
  });

  it("keeps the unrounded amount for conversions", () => {
    expect(edit("1/3=")).toEqual({
      text: "0.33333333",
      caret: 10,
      amount: 1 / 3,
    });
  });

  it.each([
    ["en-US", "999,999,999,999", ".00000001"],
    ["de-DE", "999.999.999.999", ",00000001"],
  ])(
    "rejects amounts above the exact limit in %s",
    (locale, maximum, fraction) => {
      const aboveLimit = maximum + fraction;

      for (const text of [
        aboveLimit,
        `${aboveLimit} + 0`,
        `${aboveLimit} + 0=`,
        `${maximum} + 0${fraction}`,
        `${maximum} + 0${fraction}=`,
      ]) {
        expect(edit(text, locale)).toEqual({
          text,
          caret: text.length,
          amount: null,
        });
      }
    },
  );
});
