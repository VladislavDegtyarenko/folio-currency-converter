import * as Ariakit from "@ariakit/react";
import { Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState } from "../storage/useSavedState";
import {
  useConverterActions,
  useConverterCurrencyHighlight,
  useCurrencyPicker,
} from "./ConverterProvider";
import { CurrencyHighlight } from "./CurrencyHighlight";
import { CurrencyLabel } from "./currency/CurrencyLabel";
import { type CurrencyCode } from "./currency/currencies";
import { MoneyInput } from "./money-input/MoneyInput";

type Props = {
  code: CurrencyCode;
  index: number;
  count: number;
  value: number;
  onMove: (offset: number) => void;
  onDragEnd: () => void;
};

export function CurrencyRow({
  code,
  index,
  count,
  value,
  onMove,
  onDragEnd,
}: Props) {
  const settings = useSavedState(({ state }) => state.settings);
  const { locale, messages } = useLocale();
  const { inputRevision, currencyHighlight: currentCurrencyHighlight } =
    useConverterCurrencyHighlight();
  const { input, openPicker, remove, clearCurrencyHighlight } =
    useConverterActions();
  const { pickerStore } = useCurrencyPicker();
  const isPickerMounted = Ariakit.useStoreState(pickerStore, "mounted");
  const currencyHighlight =
    currentCurrencyHighlight?.target.kind !== "pair" &&
    currentCurrencyHighlight?.code === code
      ? currentCurrencyHighlight
      : null;
  const menu = Ariakit.useMenuStore({ placement: "bottom-end" });
  const drag = useDragControls();
  const isReduced = useReducedMotion();
  const row = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (currencyHighlight?.target.kind === "add" && !isPickerMounted) {
      row.current?.scrollIntoView({
        behavior: isReduced ? "instant" : "smooth",
        block: "nearest",
      });
    }
  }, [currencyHighlight, isPickerMounted, isReduced]);

  return (
    <Reorder.Item
      ref={row}
      value={code}
      dragListener={false}
      dragControls={drag}
      onDragEnd={onDragEnd}
      className="money-row"
      transition={{ duration: isReduced ? 0 : 0.18 }}
      whileDrag={{ scale: isReduced ? 1 : 1.015, zIndex: 2 }}
    >
      {currencyHighlight && !isPickerMounted && (
        <CurrencyHighlight
          key={currencyHighlight.id}
          id={currencyHighlight.id}
          onComplete={clearCurrencyHighlight}
        />
      )}
      <span
        className="drag-handle"
        aria-hidden="true"
        title={messages.drag}
        onPointerDown={(event) => drag.start(event)}
      >
        ⠿
      </span>
      <CurrencyLabel code={code} locale={locale} settings={settings} />
      <MoneyInput
        inputRevision={inputRevision}
        code={code}
        value={value}
        locale={locale}
        digits={settings.digits}
        messages={messages}
        onChange={(amount) => input(code, amount)}
      />
      <Ariakit.MenuButton
        store={menu}
        id={`actions-${code}`}
        className="icon-button row-actions"
        aria-label={`${messages.actions} ${code}`}
      >
        ⋮
      </Ariakit.MenuButton>
      <Ariakit.Menu
        store={menu}
        portal
        hideOnInteractOutside
        hideOnEscape
        className="action-menu"
        gutter={6}
        aria-label={`${messages.actions} ${code}`}
      >
        <Ariakit.MenuItem onClick={() => openPicker({ kind: "replace", code })}>
          {messages.replace}
        </Ariakit.MenuItem>
        <Ariakit.MenuItem disabled={index === 0} onClick={() => onMove(-1)}>
          {messages.up}
          <span aria-hidden="true">↑</span>
        </Ariakit.MenuItem>
        <Ariakit.MenuItem
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          {messages.down}
          <span aria-hidden="true">↓</span>
        </Ariakit.MenuItem>
        <Ariakit.MenuSeparator />
        <Ariakit.MenuItem
          className="danger"
          disabled={count === 1}
          onClick={() => remove(code)}
        >
          {messages.remove}
        </Ariakit.MenuItem>
      </Ariakit.Menu>
    </Reorder.Item>
  );
}
