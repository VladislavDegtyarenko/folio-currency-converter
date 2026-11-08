import { useLocale } from "../../i18n/LocaleProvider";
import { useSavedState } from "../../storage/useSavedState";
import { useCurrencyPicker } from "../ConverterProvider";
import { CurrencyPicker } from "./CurrencyPicker";

export function ConverterPicker() {
  const { pickerStore, finalFocus, target, choose } = useCurrencyPicker();
  const rates = useSavedState(({ state }) => state.rates);
  const currencies = useSavedState(({ state }) => state.currencies);
  const pair = useSavedState(({ state }) => state.pair);
  const { locale, messages } = useLocale();
  const excluded =
    target.kind === "pair" ? [pair[target.index === 0 ? 1 : 0]] : currencies;

  return (
    <CurrencyPicker
      store={pickerStore}
      rates={rates}
      selected={excluded}
      locale={locale}
      messages={messages}
      finalFocus={finalFocus}
      onChoose={choose}
    />
  );
}
