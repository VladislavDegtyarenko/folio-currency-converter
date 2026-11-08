import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useConverter } from "./useConverter";

type Converter = ReturnType<typeof useConverter>;
type CurrencyHighlight = Pick<Converter, "currencyHighlight" | "inputRevision">;
type Picker = Pick<
  Converter,
  "pickerStore" | "finalFocus" | "target" | "choose"
>;

const ACTIONS_CONTEXT = createContext<Converter["actions"] | null>(null);
const CURRENCY_HIGHLIGHT_CONTEXT = createContext<CurrencyHighlight | null>(
  null,
);
const NOTICE_CONTEXT = createContext<Converter["notice"]>(null);
const PICKER_CONTEXT = createContext<Picker | null>(null);

type Props = PropsWithChildren;

export function ConverterProvider({ children }: Props) {
  const {
    actions,
    currencyHighlight,
    inputRevision,
    notice,
    pickerStore,
    finalFocus,
    target,
    choose,
  } = useConverter();
  const currencyHighlightValue = useMemo(
    () => ({ currencyHighlight, inputRevision }),
    [currencyHighlight, inputRevision],
  );
  const pickerValue = useMemo(
    () => ({ pickerStore, finalFocus, target, choose }),
    [pickerStore, finalFocus, target, choose],
  );

  return (
    <ACTIONS_CONTEXT.Provider value={actions}>
      <CURRENCY_HIGHLIGHT_CONTEXT.Provider value={currencyHighlightValue}>
        <NOTICE_CONTEXT.Provider value={notice}>
          <PICKER_CONTEXT.Provider value={pickerValue}>
            {children}
          </PICKER_CONTEXT.Provider>
        </NOTICE_CONTEXT.Provider>
      </CURRENCY_HIGHLIGHT_CONTEXT.Provider>
    </ACTIONS_CONTEXT.Provider>
  );
}

/** Reads stable converter actions without subscribing to input or notifications. */
export function useConverterActions() {
  const actions = useContext(ACTIONS_CONTEXT);

  if (!actions) {
    throw new Error("ConverterProvider is missing");
  }

  return actions;
}

/** Reads the revision that clears invalid drafts and the selected-currency highlight. */
export function useConverterCurrencyHighlight() {
  const currencyHighlight = useContext(CURRENCY_HIGHLIGHT_CONTEXT);

  if (!currencyHighlight) {
    throw new Error("ConverterProvider is missing");
  }

  return currencyHighlight;
}

/** Reads currency-picker coordination without subscribing to amount edits. */
export function useCurrencyPicker() {
  const picker = useContext(PICKER_CONTEXT);

  if (!picker) {
    throw new Error("ConverterProvider is missing");
  }

  return picker;
}

/** Subscribes only to the currently displayed notification. */
export function useConverterNotice() {
  return useContext(NOTICE_CONTEXT);
}
