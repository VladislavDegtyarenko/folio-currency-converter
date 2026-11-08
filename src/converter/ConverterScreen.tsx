import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRateStatus } from "../rates/RatesProvider";
import { useSavedState } from "../storage/useSavedState";
import { ConverterSkeleton } from "./ConverterSkeleton";
import { MultipleConverter } from "./MultipleConverter";
import { SingleConverter } from "./SingleConverter";

export function ConverterScreen() {
  const mode = useSavedState(({ state }) => state.mode);
  const isReady = useSavedState((snapshot) => snapshot.isReady);
  const hasRates = useSavedState(({ state }) => state.rates !== null);
  const { hasRatesError, isRefreshing } = useRateStatus();
  const isReduced = useReducedMotion();

  if (!isReady || (!hasRates && (isRefreshing || !hasRatesError))) {
    return <ConverterSkeleton />;
  }

  if (!hasRates) {
    return null;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: isReduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isReduced ? 0 : 0.15 }}
      >
        {mode === "multiple" ? <MultipleConverter /> : <SingleConverter />}
      </motion.div>
    </AnimatePresence>
  );
}
