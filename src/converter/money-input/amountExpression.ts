import { MAX_AMOUNT } from "../amounts";
import {
  type AmountFormat,
  formatAmountDraft,
  parseAmountOperand,
} from "./amountDraft";

type AmountEdit = ReturnType<typeof formatAmountDraft> & {
  isExpression?: boolean;
  isPending?: boolean;
};

const OPERATORS = /([+\-−*×/÷])/; // Splits at arithmetic operators and keeps the symbols.

/** Evaluates complete expressions as typed and replaces their text on equals. */
export function formatAmountEdit({
  text,
  caret,
  format,
}: {
  text: string;
  caret: number;
  format: AmountFormat;
}): AmountEdit {
  const end = text.trimEnd();
  const isSubmitted = end.endsWith("=");
  const expression = isSubmitted ? end.slice(0, -1) : end;
  const [first, ...operations] = expression.split(OPERATORS);

  if (operations.length === 0 && !text.includes("=")) {
    const suffix = text.slice(end.length);
    const draft = formatAmountDraft({
      text: end,
      caret: Math.min(caret, end.length),
      format,
    });

    // Keep spaces typed just before an operator, including after a fraction.
    if (draft.amount !== null && suffix) {
      return {
        ...draft,
        text: draft.text + suffix,
        caret: draft.caret + Math.max(0, caret - end.length),
      };
    }

    return draft.amount === null ? { text, caret, amount: null } : draft;
  }

  const invalid = { text, caret, amount: null };
  const pending = { ...invalid, isPending: true };
  const initialAmount = parseAmountOperand(first, format);

  if (initialAmount === null) {
    return invalid;
  }

  let total = 0;
  let term = initialAmount;

  for (let index = 0; index < operations.length; index += 2) {
    const operator = operations[index];
    const operand = operations[index + 1].trim();

    if (
      !isSubmitted &&
      index + 2 === operations.length &&
      (operand === "" || operand === format.decimal)
    ) {
      return pending;
    }

    const amount = parseAmountOperand(operand, format);

    if (amount === null) {
      return invalid;
    }

    switch (operator) {
      case "*":
      case "×":
        term *= amount;
        break;
      case "/":
      case "÷":
        term /= amount;
        break;
      default:
        total += term;
        term = operator === "+" ? amount : -amount;
    }
  }

  const amount = total + term;

  if (!Number.isFinite(amount) || amount < 0 || amount > MAX_AMOUNT) {
    return invalid;
  }

  if (!isSubmitted) {
    return { text, caret, amount, isExpression: true };
  }

  const result = new Intl.NumberFormat(
    format.integer.resolvedOptions().locale,
    {
      maximumFractionDigits: 8,
    },
  ).format(amount);

  return { text: result, caret: result.length, amount };
}
