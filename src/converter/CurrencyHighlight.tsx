import { motion, useReducedMotion } from "framer-motion";

type Props = {
  id: number;
  onComplete: (id: number) => void;
};

export function CurrencyHighlight({ id, onComplete }: Props) {
  const isReduced = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className="currency-highlight"
      initial={{ opacity: isReduced ? 0 : 0.12 }}
      animate={{ opacity: 0 }}
      transition={{ duration: isReduced ? 0 : 1.4 }}
      onAnimationComplete={() => onComplete(id)}
    />
  );
}
