import { createContext, type PropsWithChildren, useContext } from "react";
import { useSavedState, useSavedStateStore } from "../storage/useSavedState";
import { useRates } from "./useRates";

const RATES_CONTEXT = createContext<ReturnType<typeof useRates> | null>(null);

type Props = PropsWithChildren;

export function RatesProvider({ children }: Props) {
  const isReady = useSavedState((snapshot) => snapshot.isReady);
  const { updateState } = useSavedStateStore();
  const rates = useRates({ isReady, updateState });

  return (
    <RATES_CONTEXT.Provider value={rates}>{children}</RATES_CONTEXT.Provider>
  );
}

/** Shares one refresh request between the header and rate status. */
export function useRateStatus() {
  const rates = useContext(RATES_CONTEXT);

  if (!rates) {
    throw new Error("RatesProvider is missing");
  }

  return rates;
}
