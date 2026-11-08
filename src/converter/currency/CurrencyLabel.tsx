import { type Settings } from "../../settings/model";
import { type CurrencyCode, currencyName, getCurrency } from "./currencies";

type Props = {
  code: CurrencyCode;
  locale: string;
  settings: Settings;
};

export function CurrencyLabel({ code, locale, settings }: Props) {
  const { flag, symbol } = getCurrency(code);

  return (
    <div className="currency-label">
      <strong>
        {settings.showFlags && flag && (
          <span className="currency-flag" aria-hidden="true">
            {flag}
          </span>
        )}
        {code}
        {settings.showSymbols && symbol && (
          <span className="currency-symbol">{symbol}</span>
        )}
      </strong>
      {settings.showNames && <small>{currencyName({ code, locale })}</small>}
    </div>
  );
}
