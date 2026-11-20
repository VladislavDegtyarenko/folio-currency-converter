import {
  type AmountFormat,
  formatAmountDraft,
  getGroupDeletion,
  parseAmountOperand,
} from "./amountDraft";

export const EXPRESSION_OPERATORS = /([+\-−*×/÷])/; // Splits an expression at operators and keeps their symbols.

/** Finds the operand under the caret and excludes any spaces around it. */
function getOperandAt(parts: string[], caret: number) {
  let start = 0;

  for (let index = 0; index < parts.length; index += 2) {
    const part = parts[index];
    const end = start + part.length;

    if (caret <= end) {
      const text = part.trim();
      const operandStart = end - part.trimStart().length;
      const operandEnd = operandStart + text.length;

      return caret >= operandStart && caret <= operandEnd
        ? { index, text, start: operandStart, end: operandEnd }
        : null;
    }

    start = end + (parts[index + 1]?.length ?? 0);
  }

  return null;
}

/** Regroups the operand being edited without changing the rest of the expression. */
export function formatEditedOperand({
  text,
  caret,
  previousText,
  format,
}: {
  text: string;
  caret: number;
  previousText: string;
  format: AmountFormat;
}) {
  const parts = text.split(EXPRESSION_OPERATORS);
  const previousParts = previousText.split(EXPRESSION_OPERATORS);

  if (parts.length === 1 || parts.length !== previousParts.length) {
    return { text, caret };
  }

  const operand = getOperandAt(parts, caret);

  if (!operand?.text || parts[operand.index] === previousParts[operand.index]) {
    return { text, caret };
  }

  const previous = previousParts[operand.index].trim();

  if (
    previous &&
    previous !== format.decimal &&
    parseAmountOperand(previous, format) === null
  ) {
    return { text, caret };
  }

  const formatted = formatAmountDraft({
    text: operand.text,
    caret: caret - operand.start,
    format,
  });

  return {
    text:
      text.slice(0, operand.start) + formatted.text + text.slice(operand.end),
    caret: operand.start + formatted.caret,
  };
}

/** Extends a group deletion within an operand without selecting operator spacing. */
export function getOperandGroupDeletion(
  options: Parameters<typeof getGroupDeletion>[0],
) {
  const { text, start, end, key, group } = options;

  if (start !== end || (key !== "Backspace" && key !== "Delete")) {
    return null;
  }

  const operand = getOperandAt(text.split(EXPRESSION_OPERATORS), start);

  if (!operand) {
    return null;
  }

  const caret = start - operand.start;
  const selection = getGroupDeletion({
    text: operand.text,
    start: caret,
    end: caret,
    key,
    group,
  });

  return (
    selection && {
      start: operand.start + selection.start,
      end: operand.start + selection.end,
    }
  );
}
