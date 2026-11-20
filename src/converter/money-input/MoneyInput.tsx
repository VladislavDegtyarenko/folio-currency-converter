import { AnimatePresence } from "framer-motion";
import { type KeyboardEvent, useId } from "react";
import { type Messages } from "../../i18n/messages";
import { useSavedState } from "../../storage/useSavedState";
import { formatAmount } from "../amounts";
import { type CurrencyCode } from "../currency/currencies";
import { CalculationHint } from "./CalculationHint";
import { useAmountInput } from "./useAmountInput";
import { useCalculationHint } from "./useCalculationHint";

type Props = {
  inputRevision: number;
  code: CurrencyCode;
  value: number;
  locale: string;
  digits: number;
  messages: Messages;
  onChange: (value: number) => number;
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
  const hint = useCalculationHint();
  const rate = useSavedState(({ state: { rates } }) =>
    rates ? rates.usd[code] / rates.usd.EUR : undefined,
  );
  const input = useAmountInput({
    inputRevision,
    locale,
    rate,
    onAmountChange: onChange,
    onCalculation: hint.dismiss,
  });
  const errorId = `amount-error-${code}`;
  const hintId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (
      event.key === "Escape" &&
      !event.nativeEvent.isComposing &&
      hint.anchor
    ) {
      event.preventDefault();
      hint.dismiss();
      return;
    }

    input.handleKeyDown(event);
  }

  return (
    <div className="amount-field">
      <input
        ref={input.ref}
        className="money-input"
        aria-label={`${messages.amount} ${code}`}
        aria-invalid={input.isInvalid}
        aria-describedby={
          input.isInvalid ? errorId : hint.anchor ? hintId : undefined
        }
        autoComplete="off"
        spellCheck={false}
        value={input.draftText ?? formatAmount({ value, locale, digits })}
        onFocus={(event) => hint.show(event.currentTarget)}
        onChange={input.handleChange}
        onCompositionStart={input.handleCompositionStart}
        onCompositionEnd={input.handleCompositionEnd}
        onBlur={input.handleBlur}
        onKeyDown={handleKeyDown}
      />
      {input.isInvalid && (
        <span id={errorId} className="sr-only">
          {messages.invalid}
        </span>
      )}
      <AnimatePresence>
        {hint.anchor && (
          <CalculationHint
            anchor={hint.anchor}
            descriptionId={hintId}
            messages={messages}
            onDismiss={hint.dismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
