import { useState } from "react";
import { useSavedStateStore } from "../../storage/useSavedState";

/** Opens the calculation hint on first focus and records the show immediately. */
export function useCalculationHint() {
  const [anchor, setAnchor] = useState<HTMLInputElement | null>(null);
  const { getState, updateState } = useSavedStateStore();

  function show(input: HTMLInputElement) {
    if (getState().hasSeenCalculationHint) {
      return;
    }

    updateState((state) => ({ ...state, hasSeenCalculationHint: true }));
    setAnchor(input);
  }

  function dismiss() {
    setAnchor(null);
  }

  return { anchor, show, dismiss };
}
