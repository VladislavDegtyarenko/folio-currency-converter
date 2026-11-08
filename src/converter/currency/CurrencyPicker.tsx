import * as Ariakit from "@ariakit/react";
import { type RefObject, useEffect, useMemo, useState } from "react";
import { type Messages } from "../../i18n/messages";
import { type Rates } from "../../rates/model";
import { type CurrencyCode } from "./currencies";
import {
  catalogOptions,
  groupCurrencies,
  searchCurrencies,
} from "./currencyCatalog";

const SEARCH_DELAY_MS = 200;

type Props = {
  store: Ariakit.DialogStore;
  selected: CurrencyCode[];
  rates: Rates | null;
  locale: string;
  messages: Messages;
  finalFocus: RefObject<HTMLElement | null>;
  onChoose: (code: CurrencyCode) => void;
};

export function CurrencyPicker({
  store,
  selected,
  rates,
  locale,
  messages,
  finalFocus,
  onChoose,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const combo = Ariakit.useComboboxStore({
    value: query,
    setValue: setQuery,
    includesBaseElement: false,
  });
  const isOpen = store.useState("open");
  const options = useMemo(
    () => catalogOptions(Object.keys(rates?.usd ?? {}), locale),
    [rates, locale],
  );
  const search = searchQuery.trim().toLocaleLowerCase(locale);
  const searchPending = query !== searchQuery;
  const groups = groupCurrencies(options, navigator.languages);
  const visible = search ? searchCurrencies(options, searchQuery) : [];
  const sections = search ? [{ id: null, options: visible }] : groups;

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSearchQuery("");
      return;
    }

    const timeout = window.setTimeout(() => {
      setSearchQuery(query);
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isOpen, query]);

  return (
    <Ariakit.Dialog
      store={store}
      className="dialog picker-dialog"
      backdrop={<div className="backdrop" />}
      finalFocus={finalFocus}
    >
      <div className="dialog-heading">
        <Ariakit.DialogHeading>{messages.choose}</Ariakit.DialogHeading>
        <Ariakit.DialogDismiss
          className="icon-button"
          aria-label={messages.close}
        >
          ×
        </Ariakit.DialogDismiss>
      </div>
      <Ariakit.ComboboxLabel store={combo} className="field-label">
        {messages.search}
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        store={combo}
        autoFocus
        autoSelect
        className="search-input"
        placeholder={messages.searchPlaceholder}
      />
      <Ariakit.ComboboxList
        store={combo}
        className="currency-results"
        alwaysVisible
      >
        {sections.map((section) => (
          <Ariakit.ComboboxGroup key={section.id ?? "search"}>
            {section.id && (
              <Ariakit.ComboboxGroupLabel className="currency-group-label">
                {messages[`group_${section.id}`]}
              </Ariakit.ComboboxGroupLabel>
            )}
            {section.options.map(({ code, name }) => (
              <Ariakit.ComboboxItem
                key={code}
                store={combo}
                value={code}
                disabled={searchPending || selected.includes(code)}
                className="currency-option"
                onClick={() => {
                  onChoose(code);
                  store.hide();
                }}
              >
                <strong>{code}</strong>
                <span>{name}</span>
                {selected.includes(code) && (
                  <small>{messages.alreadyAdded}</small>
                )}
              </Ariakit.ComboboxItem>
            ))}
          </Ariakit.ComboboxGroup>
        ))}
      </Ariakit.ComboboxList>
      {!searchPending &&
        sections.every((section) => section.options.length === 0) && (
          <p role="status" className="empty-state">
            {messages.noResults}
          </p>
        )}
      <p className="keyboard-hint">{messages.searchHelp}</p>
    </Ariakit.Dialog>
  );
}
