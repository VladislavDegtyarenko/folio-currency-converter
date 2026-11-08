import * as Ariakit from "@ariakit/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { type Notice } from "../notifications/model";
import { type SavedState } from "../storage/model";
import { useSavedStateStore } from "../storage/useSavedState";
import { toEuros } from "./amounts";
import { type CurrencyCode } from "./currency/currencies";

export type PickerTarget =
  | { kind: "add" }
  | { kind: "replace"; code: CurrencyCode }
  | { kind: "pair"; index: 0 | 1 };

export type CurrencyHighlight = {
  id: number;
  code: CurrencyCode;
  target: PickerTarget;
};

/** Coordinates currency changes, undo and focus without subscribing to amount edits. */
export function useConverter() {
  const { getState, updateState } = useSavedStateStore();
  const pickerStore = Ariakit.useDialogStore();
  const finalFocus = useRef<HTMLElement | null>(null);
  const [target, setTarget] = useState<PickerTarget>({ kind: "add" });
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeId = useRef(0);
  const currencyHighlightId = useRef(0);
  const [currencyHighlight, setCurrencyHighlight] =
    useState<CurrencyHighlight | null>(null);
  const [inputRevision, setInputRevision] = useState(0);
  const removed = useRef<{
    code: CurrencyCode;
    index: number;
  } | null>(null);

  const notify = useCallback(
    (messageKey: Notice["messageKey"], canUndo = false) => {
      noticeId.current += 1;
      setNotice({ id: noticeId.current, messageKey, canUndo });

      if (!canUndo) {
        removed.current = null;
      }
    },
    [],
  );

  const dismissNotice = useCallback(() => {
    setNotice(null);
    removed.current = null;
  }, []);

  const openPicker = useCallback(
    (next: PickerTarget) => {
      finalFocus.current =
        next.kind === "replace"
          ? document.getElementById(`actions-${next.code}`)
          : next.kind === "pair"
            ? document.getElementById(`pair-${next.index}`)
            : document.getElementById("add-currency");
      setTarget(next);
      pickerStore.show();
    },
    [pickerStore],
  );

  const input = useCallback(
    (code: CurrencyCode, amount: number) => {
      setInputRevision((revision) => revision + 1);
      updateState((previous) =>
        previous.rates
          ? {
              ...previous,
              euros: toEuros({ amount, code, rates: previous.rates }),
              base: previous.currencies.includes(code) ? code : previous.base,
            }
          : previous,
      );
    },
    [updateState],
  );

  const choose = useCallback(
    (code: CurrencyCode) => {
      finalFocus.current = document.getElementById(
        target.kind === "pair" ? `pair-${target.index}` : "add-currency",
      );
      updateState((previous) => {
        if (target.kind === "pair") {
          const pair = [...previous.pair] as SavedState["pair"];
          pair[target.index] = code;
          return { ...previous, pair };
        }

        if (target.kind === "replace") {
          return {
            ...previous,
            currencies: previous.currencies.map((value) =>
              value === target.code ? code : value,
            ),
            base: previous.base === target.code ? code : previous.base,
          };
        }

        return { ...previous, currencies: [...previous.currencies, code] };
      });
      dismissNotice();
      currencyHighlightId.current += 1;
      setCurrencyHighlight({ id: currencyHighlightId.current, code, target });
      requestAnimationFrame(() => {
        const id =
          target.kind === "pair"
            ? `pair-${target.index}`
            : target.kind === "replace"
              ? `actions-${code}`
              : "add-currency";
        document.getElementById(id)?.focus({ preventScroll: true });
      });
    },
    [target, updateState, dismissNotice],
  );

  const remove = useCallback(
    (code: CurrencyCode) => {
      const state = getState();

      if (state.currencies.length < 2) {
        return;
      }

      removed.current = { code, index: state.currencies.indexOf(code) };
      updateState((previous) => {
        const currencies = previous.currencies.filter(
          (value) => value !== code,
        );
        return {
          ...previous,
          currencies,
          base: previous.base === code ? currencies[0] : previous.base,
        };
      });
      notify("removed", true);
      requestAnimationFrame(() =>
        document.getElementById("add-currency")?.focus(),
      );
    },
    [getState, updateState, notify],
  );

  const undo = useCallback(() => {
    const removal = removed.current;

    if (!removal) {
      return;
    }

    updateState((previous) => {
      const currencies = [...previous.currencies];

      if (!currencies.includes(removal.code)) {
        currencies.splice(
          Math.min(removal.index, currencies.length),
          0,
          removal.code,
        );
      }

      return { ...previous, currencies };
    });
    notify("restored");
    removed.current = null;
  }, [updateState, notify]);

  const reorder = useCallback(
    (currencies: CurrencyCode[]) => {
      updateState((previous) => ({ ...previous, currencies }));
      dismissNotice();
    },
    [updateState, dismissNotice],
  );

  const clearCurrencyHighlight = useCallback((id: number) => {
    setCurrencyHighlight((current) => (current?.id === id ? null : current));
  }, []);

  const actions = useMemo(
    () => ({
      clearCurrencyHighlight,
      notify,
      dismissNotice,
      openPicker,
      input,
      remove,
      undo,
      reorder,
    }),
    [
      clearCurrencyHighlight,
      notify,
      dismissNotice,
      openPicker,
      input,
      remove,
      undo,
      reorder,
    ],
  );

  return {
    pickerStore,
    inputRevision,
    finalFocus,
    notice,
    currencyHighlight,
    target,
    choose,
    actions,
  };
}
