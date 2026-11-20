import {
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createAmountFormat, getGroupDeletion } from "./amountDraft";
import { formatAmountEdit } from "./amountExpression";
import { getCurrentInputDraft, type InputDraft } from "./inputDraft";

type Options = {
  inputRevision: number;
  locale: string;
  onAmountChange: (value: number) => number;
  onCalculation: () => void;
};

/** Keeps the editable text and caret in sync with the shared amount. */
export function useAmountInput({
  inputRevision,
  locale,
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
    const input = inputRef.current;

    if (draft && input === document.activeElement && !isComposing.current) {
      input?.setSelectionRange(draft.caret, draft.caret);
    }
  }, [draft]);

  function edit(text: string, caret: number) {
    const next = formatAmountEdit({ text, caret, format });
    const end = text.trimEnd();
    const isSubmitted = end.endsWith("=");
    const replacesExpression =
      isSubmitted &&
      draft?.isExpression &&
      next.amount === draft.amount &&
      end.slice(0, -1).trimEnd() === draft.text.trimEnd();
    const revision =
      next.amount === null || replacesExpression
        ? inputRevision
        : onAmountChange(next.amount);
    setDraft({ ...next, revision });

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

    edit(text, caret);
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
      setDraft(null);
      input.blur();
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;

    if (key === "." || key === "," || code === "NumpadDecimal") {
      event.preventDefault();
      edit(
        input.value.slice(0, start) + format.decimal + input.value.slice(end),
        start + format.decimal.length,
      );
      return;
    }

    if (event.shiftKey || draft?.amount === null || draft?.isExpression) {
      return;
    }

    const selection = getGroupDeletion({
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
