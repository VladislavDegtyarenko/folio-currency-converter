import { expect, it } from "vitest";
import { createAmountFormat } from "./amountDraft";
import { formatEditedOperand } from "./expressionOperand";

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
