import {
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createAmountFormat } from "./amountDraft";
import { formatAmountEdit } from "./amountExpression";
import {
  formatEditedOperand,
  getOperandGroupDeletion,
} from "./expressionOperand";
import { getCurrentInputDraft, type InputDraft } from "./inputDraft";

type Options = {
  inputRevision: number;
  locale: string;
  rate: number | undefined;
  onAmountChange: (value: number) => number;
  onCalculation: () => void;
};

/** Keeps the editable text and caret in sync with the shared amount. */
export function useAmountInput({
  inputRevision,
  locale,
  rate,
  onAmountChange,
  onCalculation,
}: Options) {
  const [storedDraft, setDraft] = useState<InputDraft | null>(null);
  const draft = getCurrentInputDraft({ draft: storedDraft, inputRevision });
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposing = useRef(false);
  const format = useMemo(() => createAmountFormat(locale), [locale]);
  const isInvalid =
    draft?.amount === null && !draft.isPending && !isComposing.current;

  useLayoutEffect(() => {
    setDraft(null);
  }, [locale]);

  useLayoutEffect(() => {
    setDraft((current) => (current?.isExpression ? null : current));
  }, [rate]);

  useLayoutEffect(() => {
    const input = inputRef.current;

    if (draft && input === document.activeElement && !isComposing.current) {
      input?.setSelectionRange(draft.caret, draft.caret);
    }
  }, [draft]);

  function edit(text: string, caret: number, shouldRegroup = false) {
    const updated =
      shouldRegroup && draft
        ? formatEditedOperand({ text, caret, previousText: draft.text, format })
        : { text, caret };
    const next = formatAmountEdit({ ...updated, format });
    const revision =
      next.amount === null ? inputRevision : onAmountChange(next.amount);
    const isSubmitted = next.amount !== null && text.trimEnd().endsWith("=");
    setDraft({ ...next, revision, isSubmitted });

    if (next.amount !== null && (next.isExpression || isSubmitted)) {
      onCalculation();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value: text, selectionStart } = event.currentTarget;
    const caret = selectionStart ?? text.length;

    if (isComposing.current) {
      setDraft({ text, caret, amount: null, revision: inputRevision });
      return;
    }

    const change = event.nativeEvent;
    const shouldRegroup =
      change instanceof InputEvent &&
      (change.inputType.startsWith("delete") ||
        ((change.inputType === "insertText" ||
          change.inputType === "insertFromPaste") &&
          !!change.data &&
          Array.from(change.data).every(
            (digit) =>
              format.digits.includes(digit) || "0123456789".includes(digit),
          )));

    edit(text, caret, shouldRegroup);
  }

  function handleCompositionStart() {
    isComposing.current = true;
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    isComposing.current = false;
    const { value, selectionStart } = event.currentTarget;
    edit(value, selectionStart ?? 0);
  }

  function handleBlur() {
    if (draft?.isPending) {
      setDraft({ ...draft, isPending: false });
    } else if (!isInvalid && !draft?.isExpression) {
      setDraft(null);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    const input = event.currentTarget;
    const { key, code } = event;

    if (key === "Escape") {
      input.blur();
      setDraft(null);
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (key === "=") {
      event.preventDefault();
      if (
        draft?.isSubmitted &&
        draft.amount !== null &&
        draft.text === input.value
      ) {
        const revision = onAmountChange(draft.amount);
        setDraft({ ...draft, revision });
        return;
      }

      const text = input.value.trimEnd();
      const submitted = text.endsWith("=") ? text : `${text}=`;
      edit(submitted, submitted.length);
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;

    if (key === "." || key === "," || code === "NumpadDecimal") {
      event.preventDefault();
      edit(
        input.value.slice(0, start) + format.decimal + input.value.slice(end),
        start + format.decimal.length,
        true,
      );
      return;
    }

    if (event.shiftKey || (draft?.amount === null && !draft.isPending)) {
      return;
    }

    const selection = getOperandGroupDeletion({
      text: input.value,
      start,
      end,
      key,
      group: format.group,
    });

    if (selection) {
      input.setSelectionRange(selection.start, selection.end);
    }
  }

  return {
    draftText: draft?.text,
    ref: inputRef,
    isInvalid,
    handleBlur,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    handleKeyDown,
  };
}
