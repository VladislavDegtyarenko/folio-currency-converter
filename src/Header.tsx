import * as Ariakit from "@ariakit/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useConverterActions } from "./converter/ConverterProvider";
import { useLocale } from "./i18n/LocaleProvider";
import { useRateStatus } from "./rates/RatesProvider";
import { useSettingsDialog } from "./settings/SettingsProvider";
import { useSavedState } from "./storage/useSavedState";

export function Header() {
  const { messages } = useLocale();
  const settingsStore = useSettingsDialog();
  const { notify, dismissNotice } = useConverterActions();
  const { isRefreshing, refresh } = useRateStatus();
  const isReady = useSavedState((snapshot) => snapshot.isReady);
  const isReduced = useReducedMotion();
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <header className="header">
      <div className="brand">
        Folio<span>{messages.appSubtitle}</span>
      </div>
      <div className="header-actions">
        <motion.button
          type="button"
          className="icon-button refresh-button"
          aria-label={messages.refresh}
          title={messages.refreshHint}
          disabled={!isReady}
          aria-busy={isRefreshing}
          aria-disabled={isRefreshing || !isReady}
          onClick={async () => {
            if (isRefreshing) {
              return;
            }

            setRefreshCount((value) => value + 1);
            dismissNotice();

            if (await refresh()) {
              notify("refreshed");
            }
          }}
        >
          <motion.span
            animate={{ rotate: isReduced ? 0 : refreshCount * 360 }}
            transition={{ duration: 0.5 }}
            aria-hidden="true"
          >
            ↻
          </motion.span>
        </motion.button>
        <Ariakit.DialogDisclosure
          store={settingsStore}
          className="settings-button"
          disabled={!isReady}
        >
          {messages.settings}
        </Ariakit.DialogDisclosure>
      </div>
    </header>
  );
}
