import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { type Messages } from "../../i18n/messages";
import { formatAmount } from "../amounts";
import { type CurrencyCode } from "../currency/currencies";
import {
  createAmountFormat,
  formatAmountDraft,
  getGroupDeletion,
} from "./amountDraft";
import { getCurrentInputDraft, type InputDraft } from "./inputDraft";

type Props = {
  inputRevision: number;
  code: CurrencyCode;
  value: number;
  locale: string;
  digits: number;
  messages: Messages;
  onChange: (value: number) => void;
};

export function MoneyInput({
  inputRevision,
  code,
  value,
  locale,
  digits,
  messages,
  onChange,
}: Props) {
  const [storedDraft, setDraft] = useState<InputDraft | null>(null);
  const draft = getCurrentInputDraft({ draft: storedDraft, inputRevision });
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposing = useRef(false);
  const format = useMemo(() => createAmountFormat(locale), [locale]);
  const isInvalid =
    draft !== null && draft.amount === null && !isComposing.current;
  const errorId = `amount-error-${code}`;

  useLayoutEffect(() => {
    if (
      draft &&
      document.activeElement === inputRef.current &&
      !isComposing.current
    ) {
      inputRef.current?.setSelectionRange(draft.caret, draft.caret);
    }
  }, [draft]);

  function edit(text: string, caret: number) {
    const next = formatAmountDraft({ text, caret, format });
    setDraft({ ...next, revision: inputRevision });

    if (next.amount !== null) {
      onChange(next.amount);
    }
  }

  return (
    <div className="amount-field">
      <input
        ref={inputRef}
        className="money-input"
        aria-label={`${messages.amount} ${code}`}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? errorId : undefined}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={draft?.text ?? formatAmount({ value, locale, digits })}
        onChange={(event) => {
          const { value: text, selectionStart } = event.currentTarget;
          const caret = selectionStart ?? text.length;

          if (isComposing.current) {
            setDraft({ text, caret, amount: null, revision: inputRevision });
            return;
          }

          edit(text, caret);
        }}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={(event) => {
          isComposing.current = false;
          edit(
            event.currentTarget.value,
            event.currentTarget.selectionStart ?? 0,
          );
        }}
        onBlur={() => {
          if (!isInvalid) {
            setDraft(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) {
            return;
          }

          if (event.key === "Escape") {
            setDraft(null);
            event.currentTarget.blur();
            return;
          }

          const input = event.currentTarget;
          const start = input.selectionStart ?? 0;
          const end = input.selectionEnd ?? start;

          if (
            (event.key === "." ||
              event.key === "," ||
              event.code === "NumpadDecimal") &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey
          ) {
            event.preventDefault();
            edit(
              input.value.slice(0, start) +
                format.decimal +
                input.value.slice(end),
              start + format.decimal.length,
            );
            return;
          }

          const selection = getGroupDeletion({
            text: input.value,
            start,
            end,
            key: event.key,
            group: format.group,
          });

          if (
            selection &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.shiftKey
          ) {
            input.setSelectionRange(selection.start, selection.end);
          }
        }}
      />
      {isInvalid && (
        <span id={errorId} className="sr-only">
          {messages.invalid}
        </span>
      )}
    </div>
  );
}
