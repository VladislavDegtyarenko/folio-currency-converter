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

type OperandEdit = {
  text: string;
  caret: number;
  previousText: string;
  format: AmountFormat;
};

/** Regroups both sides when an operator splits a previously valid operand. */
export function formatSplitOperand({
  text,
  caret,
  previousText,
  format,
}: OperandEdit) {
  const position = caret - 1;
  const operand = getOperandAt(
    previousText.split(EXPRESSION_OPERATORS),
    position,
  );
  const removed = previousText.length + 1 - text.length;

  if (
    !operand ||
    removed < 0 ||
    position + removed > operand.end ||
    (removed === 0 &&
      (position === operand.start || position === operand.end)) ||
    parseAmountOperand(operand.text, format) === null
  ) {
    return { text, caret };
  }

  const left = previousText.slice(operand.start, position);
  const right = previousText.slice(position + removed, operand.end);
  const prefix =
    previousText.slice(0, operand.start) +
    formatAmountDraft({ text: left, caret: left.length, format }).text +
    text[position];
  const suffix =
    formatAmountDraft({ text: right, caret: 0, format }).text +
    previousText.slice(operand.end);

  return { text: prefix + suffix, caret: prefix.length };
}

/** Regroups the operand being edited without changing the rest of the expression. */
export function formatEditedOperand({
  text,
  caret,
  previousText,
  format,
}: OperandEdit) {
  const parts = text.split(EXPRESSION_OPERATORS);
  const previousParts = previousText.split(EXPRESSION_OPERATORS);
  const removedParts = previousParts.length - parts.length;

  if (parts.length === 1 || removedParts < 0) {
    return { text, caret };
  }

  const operand = getOperandAt(parts, caret);

  if (!operand?.text || parts[operand.index] === previousParts[operand.index]) {
    return { text, caret };
  }

  // Deleting operators can merge adjacent operands into the one under the caret.
  const lastPreviousOperand = operand.index + removedParts;

  for (let index = operand.index; index <= lastPreviousOperand; index += 2) {
    const previous = previousParts[index].trim();

    if (
      previous &&
      previous !== format.decimal &&
      parseAmountOperand(previous, format) === null
    ) {
      return { text, caret };
    }
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
