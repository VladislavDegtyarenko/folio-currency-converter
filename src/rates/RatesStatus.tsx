import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState } from "../storage/useSavedState";
import { useRateStatus } from "./RatesProvider";

export function RatesStatus() {
  const rates = useSavedState(({ state }) => state.rates);
  const { locale, messages } = useLocale();
  const { isRefreshing, hasRatesError } = useRateStatus();

  return (
    <>
      <p className="rates-status" role="status">
        {isRefreshing
          ? messages.ratesLoading
          : rates
            ? `${messages.ratesDate} ${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${rates.date}T00:00:00Z`))}`
            : hasRatesError
              ? ""
              : messages.ratesLoading}
      </p>
      {hasRatesError && (
        <p role="alert" className="storage-error">
          {rates ? messages.ratesError : messages.ratesUnavailable}
        </p>
      )}
    </>
  );
}
