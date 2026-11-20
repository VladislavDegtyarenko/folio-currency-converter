import { expect, it } from "vitest";
import { createAmountFormat } from "./draft/createAmountFormat";
import { formatEditedOperand, formatSplitOperand } from "./expressionOperand";

it.each([
  ["en-US", "12,345", "12,3*45", 5, "123*45", 4],
  ["de-DE", "2 + 12.345,67", "2 + 12/345,67", 7, "2 + 12/345,67", 7],
  ["fr-FR", "12\u202f345  +  2", "12×\u202f345  +  2", 3, "12×345  +  2", 3],
  ["en-US", "1,234,567", "1,-,567", 3, "1-567", 2],
  ["en-US", "12,34 + 2", "12,3*4 + 2", 5, "12,3*4 + 2", 5],
] as const)(
  "formats an operator inserted into %s operand %s",
  (locale, previousText, text, caret, result, position) => {
    expect(
      formatSplitOperand({
        text,
        caret,
        previousText,
        format: createAmountFormat(locale),
      }),
    ).toEqual({ text: result, caret: position });
  },
);

it("regroups an edited operand with pasted nonbreaking spaces in French", () => {
  const format = createAmountFormat("fr-FR");

  expect(
    formatEditedOperand({
      text: " 12\u00a034  +  1,25",
      caret: 6,
      previousText: " 12\u00a0345  +  1,25",
      format,
    }),
  ).toEqual({ text: " 1\u202f234  +  1,25", caret: 6 });
});
