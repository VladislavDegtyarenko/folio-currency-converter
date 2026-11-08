import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState } from "../storage/useSavedState";

export function ConverterSkeleton() {
  const mode = useSavedState(({ state }) => state.mode);
  const currencies = useSavedState(({ state }) => state.currencies);
  const showNames = useSavedState(({ state }) => state.settings.showNames);
  const { messages } = useLocale();

  return (
    <div
      className="converter-skeleton"
      role="status"
      aria-label={messages.loading}
    >
      <span className="sr-only">{messages.loading}</span>
      <div aria-hidden="true">
        {mode === "single" ? (
          <div className="single-converter">
            {[0, 1].map((index) => (
              <div key={index}>
                {index === 1 && (
                  <div className="swap-line">
                    <span className="skeleton-block skeleton-swap" />
                  </div>
                )}
                <div
                  className={`single-card ${index === 1 ? "result-card" : ""}`}
                >
                  <div className="single-heading">
                    <span className="skeleton-block skeleton-caption" />
                    <span className="skeleton-block skeleton-currency" />
                  </div>
                  <span className="skeleton-block skeleton-single-amount" />
                  {showNames && (
                    <span className="skeleton-block skeleton-name" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="currency-list">
              {currencies.map((code) => (
                <div key={code} className="money-row skeleton-row">
                  <span className="skeleton-block skeleton-handle" />
                  <div>
                    <span className="skeleton-block skeleton-code" />
                    {showNames && (
                      <span className="skeleton-block skeleton-name" />
                    )}
                  </div>
                  <span className="skeleton-block skeleton-amount" />
                  <span className="skeleton-block skeleton-menu" />
                </div>
              ))}
            </div>
            <div className="add-area">
              <span className="skeleton-block skeleton-add" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
