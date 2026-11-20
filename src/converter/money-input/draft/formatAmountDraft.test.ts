import { describe, expect, it } from "vitest";
import { createAmountFormat } from "./createAmountFormat";
import { formatAmountDraft } from "./formatAmountDraft";

/** Simulates an edit with the caret at the requested position. */
function edit(text: string, locale = "en-US", caret = text.length) {
  return formatAmountDraft({ text, caret, format: createAmountFormat(locale) });
}

describe("formatAmountDraft", () => {
  it.each([
    ["en-US", "12345.00", "12,345.00", 12_345],
    ["ru-RU", "12345,00", "12\u00a0345,00", 12_345],
    ["uk-UA", "12345,00", "12\u00a0345,00", 12_345],
    ["de-DE", "12345,00", "12.345,00", 12_345],
    ["en-IN", "1234567.00", "12,34,567.00", 1_234_567],
    ["ar-EG", "١٢٣٤٥٫٠٠", "١٢٬٣٤٥٫٠٠", 12_345],
  ])(
    "groups %s without losing fraction zeros",
    (locale, raw, expected, amount) => {
      expect(edit(raw, locale)).toEqual({
        text: expected,
        caret: expected.length,
        amount,
      });
      expect(edit(expected, locale).text).toBe(expected);
    },
  );

  it("preserves a trailing decimal, a leading decimal and eight fractional digits", () => {
    expect(edit("1234.")).toEqual({ text: "1,234.", caret: 6, amount: 1234 });
    expect(edit(".50")).toEqual({ text: "0.50", caret: 4, amount: 0.5 });
    expect(edit("1.12345678").text).toBe("1.12345678");
  });

  it("keeps the caret beside the edited digit when groups move", () => {
    expect(edit("1234", "en-US", 1).caret).toBe(1);
    expect(edit("19,234.50", "en-US", 2)).toEqual({
      text: "19,234.50",
      caret: 2,
      amount: 19_234.5,
    });
    expect(edit("12,934.50", "en-US", 4).caret).toBe(4);
    expect(edit("0001234", "en-US", 7)).toEqual({
      text: "1,234",
      caret: 5,
      amount: 1234,
    });
  });

  it("preserves the caret among localized fractional digits when adding a group", () => {
    expect(edit("١٢٣٤٫٥٠", "ar-EG", 6)).toEqual({
      text: "١٬٢٣٤٫٥٠",
      caret: 7,
      amount: 1_234.5,
    });
  });

  it("regroups a draft after a digit next to a separator is deleted", () => {
    expect(edit("12,34", "en-US", 5)).toEqual({
      text: "1,234",
      caret: 5,
      amount: 1_234,
    });
  });

  it("accepts localized pasted numbers including ordinary and nonbreaking spaces", () => {
    expect(edit("1,234.50").amount).toBe(1_234.5);
    expect(edit("1 234,50", "ru-RU").amount).toBe(1_234.5);
    expect(edit("1\u202f234,50", "fr-FR").amount).toBe(1_234.5);
  });

  it.each(["", "-1", "words", "1.2.3", "9999999999999", "1.123456789", "1e6"])(
    "preserves invalid draft %s without a new calculation",
    (text) => {
      expect(edit(text)).toEqual({ text, caret: text.length, amount: null });
    },
  );

  it("leaves the caret in place inside invalid text", () => {
    expect(edit("1.2.3", "en-US", 2)).toEqual({
      text: "1.2.3",
      caret: 2,
      amount: null,
    });
  });

  it("accepts the maximum amount without allowing a fractional overflow", () => {
    expect(edit("999,999,999,999").amount).toBe(999_999_999_999);
    expect(edit("999,999,999,999.1").amount).toBeNull();
  });
});
