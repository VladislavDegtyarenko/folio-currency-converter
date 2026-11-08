import { LayoutGroup, Reorder } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState } from "../storage/useSavedState";
import { convertAmount } from "./amounts";
import { useConverterActions } from "./ConverterProvider";
import { CurrencyRow } from "./CurrencyRow";
import { type CurrencyCode } from "./currency/currencies";

export function MultipleConverter() {
  const currencies = useSavedState(({ state }) => state.currencies);
  const euros = useSavedState(({ state }) => state.euros);
  const rates = useSavedState(({ state }) => state.rates);
  const { messages } = useLocale();
  const { reorder: onOrder, openPicker } = useConverterActions();
  const [order, setOrder] = useState(currencies);
  const latestOrder = useRef(order);

  useEffect(() => {
    setOrder(currencies);
    latestOrder.current = currencies;
  }, [currencies]);

  function reorder(codes: CurrencyCode[]) {
    latestOrder.current = codes;
    setOrder(codes);
  }

  function move(code: CurrencyCode, offset: number) {
    const next = [...order];
    const index = next.indexOf(code);
    const destination = index + offset;

    if (destination < 0 || destination >= next.length) {
      return;
    }

    [next[index], next[destination]] = [next[destination], next[index]];
    onOrder(next);
  }

  if (!rates) {
    return null;
  }

  // Measure all rows together before Preact moves any of them.
  return (
    <LayoutGroup>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={reorder}
        className="currency-list"
        aria-label={messages.multiple}
      >
        {order.map((code, index) => (
          <CurrencyRow
            key={code}
            code={code}
            index={index}
            count={order.length}
            value={convertAmount({ euros, code, rates })}
            onMove={(offset) => move(code, offset)}
            onDragEnd={() => {
              if (
                latestOrder.current.some(
                  (value, position) => value !== currencies[position],
                )
              ) {
                onOrder(latestOrder.current);
              }
            }}
          />
        ))}
      </Reorder.Group>
      <div className="add-area">
        <button
          type="button"
          id="add-currency"
          className="add-button"
          onClick={() => openPicker({ kind: "add" })}
        >
          + {messages.add}
        </button>
      </div>
    </LayoutGroup>
  );
}
