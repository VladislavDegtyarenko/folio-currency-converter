import {
  type AmountFormat,
  formatAmountDraft,
  parseAmountOperand,
} from "./amountDraft";
import {
  addFractions,
  formatFraction,
  fractionToAmount,
} from "./amountFraction";
import { EXPRESSION_OPERATORS } from "./expressionOperand";

type AmountEdit = ReturnType<typeof formatAmountDraft> & {
  isExpression?: boolean;
  isPending?: boolean;
};

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
  const [first, ...operations] = expression.split(EXPRESSION_OPERATORS);

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

  let total = { numerator: 0n, denominator: 1n };
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
        term = {
          numerator: term.numerator * amount.numerator,
          denominator: term.denominator * amount.denominator,
        };
        break;
      case "/":
      case "÷":
        if (amount.numerator === 0n) {
          return invalid;
        }

        term = {
          numerator: term.numerator * amount.denominator,
          denominator: term.denominator * amount.numerator,
        };
        break;
      default:
        total = addFractions(total, term);
        term =
          operator === "+"
            ? amount
            : { ...amount, numerator: -amount.numerator };
    }
  }

  const fraction = addFractions(total, term);
  const amount = fractionToAmount(fraction);

  if (amount === null) {
    return invalid;
  }

  if (!isSubmitted) {
    return { text, caret, amount, isExpression: true };
  }

  const result = formatFraction(fraction, format);

  return { text: result, caret: result.length, amount };
}
