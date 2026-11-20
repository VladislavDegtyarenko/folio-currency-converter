import * as Ariakit from "@ariakit/react";
import { motion, useIsPresent, useReducedMotion } from "framer-motion";
import { useLayoutEffect } from "react";
import { type Messages } from "../../i18n/messages";

type Props = {
  anchor: HTMLInputElement;
  descriptionId: string;
  messages: Messages;
  onDismiss: () => void;
};

export function CalculationHint({
  anchor,
  descriptionId,
  messages,
  onDismiss,
}: Props) {
  const isPresent = useIsPresent();
  const isReduced = useReducedMotion();
  const store = Ariakit.usePopoverStore({
    open: isPresent,
    placement: "bottom-end",
    setOpen(open) {
      if (!open) {
        onDismiss();
      }
    },
  });

  useLayoutEffect(() => {
    store.setAnchorElement(anchor);
    store.setDisclosureElement(anchor);
  }, [store, anchor]);

  return (
    <Ariakit.Popover
      store={store}
      alwaysVisible
      portal
      autoFocusOnShow={false}
      finalFocus={anchor}
      gutter={8}
      overflowPadding={12}
      wrapperProps={{ className: "calculation-hint-position" }}
      className="calculation-hint"
      aria-describedby={descriptionId}
      render={
        <motion.div
          initial={{ opacity: 0, y: isReduced ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isReduced ? 0 : 0.14 }}
        />
      }
    >
      <Ariakit.PopoverArrow size={12} />
      <header className="calculation-hint-header">
        <Ariakit.PopoverHeading
          render={(props) => (
            <h2 {...props}>{messages.calculationHintTitle}</h2>
          )}
        />
        <Ariakit.PopoverDismiss
          type="button"
          className="icon-button calculation-hint-close"
          aria-label={messages.close}
          onMouseDown={(event) => event.preventDefault()}
        >
          ×
        </Ariakit.PopoverDismiss>
      </header>
      <div id={descriptionId}>
        <div className="calculation-hint-example" dir="ltr">
          <code>12 * 3</code>
          <kbd>=</kbd>
          <strong>36</strong>
        </div>
        <p>{messages.calculationHintText}</p>
      </div>
    </Ariakit.Popover>
  );
}
