import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InfoDisclosure({ title, children, open, onOpenChange }: Props) {
  const store = Ariakit.useDisclosureStore({ open, setOpen: onOpenChange });
  const isReduced = useReducedMotion();

  return (
    <div className="info-disclosure">
      <Ariakit.Disclosure store={store} className="info-disclosure-trigger">
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
        {title}
      </Ariakit.Disclosure>
      <AnimatePresence initial={false}>
        {open && (
          <Ariakit.DisclosureContent
            store={store}
            alwaysVisible
            render={
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: isReduced ? 0 : 0.18 }}
              />
            }
            className="info-disclosure-content"
          >
            {children}
          </Ariakit.DisclosureContent>
        )}
      </AnimatePresence>
    </div>
  );
}
