import * as Ariakit from "@ariakit/react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState, useSavedStateStore } from "../storage/useSavedState";
import { convertAmount } from "./amounts";
import {
  useConverterActions,
  useConverterCurrencyHighlight,
  useCurrencyPicker,
} from "./ConverterProvider";
import { CurrencyHighlight } from "./CurrencyHighlight";
import { currencyName, getCurrency } from "./currency/currencies";
import { MoneyInput } from "./money-input/MoneyInput";

export function SingleConverter() {
  const pair = useSavedState(({ state }) => state.pair);
  const euros = useSavedState(({ state }) => state.euros);
  const rates = useSavedState(({ state }) => state.rates);
  const settings = useSavedState(({ state }) => state.settings);
  const { updateState } = useSavedStateStore();
  const { locale, messages } = useLocale();
  const { inputRevision, currencyHighlight } = useConverterCurrencyHighlight();
  const { input, openPicker, clearCurrencyHighlight } = useConverterActions();
  const { pickerStore } = useCurrencyPicker();
  const isPickerMounted = Ariakit.useStoreState(pickerStore, "mounted");
  const isReduced = useReducedMotion();

  if (!rates) {
    return null;
  }

  return (
    <div className="single-converter">
      {pair.map((code, index) => {
        const { flag, symbol } = getCurrency(code);

        return (
          <div key={`${index}-${code}`}>
            {index === 1 && (
              <div className="swap-line">
                <motion.button
                  type="button"
                  whileTap={{ rotate: isReduced ? 0 : 180 }}
                  className="icon-button"
                  onClick={() =>
                    updateState((previous) => ({
                      ...previous,
                      pair: [previous.pair[1], previous.pair[0]],
                    }))
                  }
                  aria-label={messages.swap}
                >
                  ⇅
                </motion.button>
              </div>
            )}
            <section
              className={`single-card ${index === 1 ? "result-card" : ""}`}
            >
              {currencyHighlight?.target.kind === "pair" &&
                currencyHighlight.target.index === index &&
                currencyHighlight.code === code &&
                !isPickerMounted && (
                  <CurrencyHighlight
                    key={currencyHighlight.id}
                    id={currencyHighlight.id}
                    onComplete={clearCurrencyHighlight}
                  />
                )}
              <div className="single-heading">
                <span>{index === 0 ? messages.from : messages.to}</span>
                <button
                  type="button"
                  id={`pair-${index}`}
                  className="currency-button"
                  onClick={() =>
                    openPicker({ kind: "pair", index: index as 0 | 1 })
                  }
                  aria-label={`${messages.choose}: ${code}`}
                >
                  {settings.showFlags && (
                    <span className="currency-flag" aria-hidden="true">
                      {flag}
                    </span>
                  )}
                  {code} {settings.showSymbols ? symbol : ""}
                  <svg
                    className="currency-chevron"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="m3 4.5 3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <MoneyInput
                inputRevision={inputRevision}
                code={code}
                value={convertAmount({ euros, code, rates })}
                locale={locale}
                digits={settings.digits}
                messages={messages}
                onChange={(amount) => input(code, amount)}
              />
              {settings.showNames && (
                <small>{currencyName({ code, locale })}</small>
              )}
            </section>
          </div>
        );
      })}
    </div>
  );
}
