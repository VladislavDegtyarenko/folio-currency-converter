import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import { BRANDING } from "../branding";
import { formatAmount } from "../converter/amounts";
import { CurrencyLabel } from "../converter/currency/CurrencyLabel";
import { type Messages } from "../i18n/messages";
import { InfoDisclosure } from "./InfoDisclosure";
import { LanguageSetting } from "./LanguageSetting";
import { type Settings } from "./model";
import { RadioSetting } from "./RadioSetting";

type Props = {
  store: Ariakit.DialogStore;
  settings: Settings;
  locale: string;
  messages: Messages;
  onChange: (settings: Settings) => void;
};

export function SettingsDialog({
  store,
  settings,
  locale,
  messages,
  onChange,
}: Props) {
  const id = useId();
  const isOpen = Ariakit.useStoreState(store, "open");
  const isReduced = useReducedMotion();

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Ariakit.Dialog
          alwaysVisible
          render={
            <motion.div
              initial={{ opacity: 0, y: isReduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isReduced ? 0 : 8 }}
              transition={{ duration: isReduced ? 0 : 0.18 }}
            />
          }
          store={store}
          className="dialog settings-dialog"
          backdrop={
            <motion.div
              className="backdrop settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isReduced ? 0 : 0.18 }}
            />
          }
        >
          <div className="dialog-heading">
            <Ariakit.DialogHeading>{messages.settings}</Ariakit.DialogHeading>
            <Ariakit.DialogDismiss
              className="icon-button"
              aria-label={messages.close}
            >
              ×
            </Ariakit.DialogDismiss>
          </div>
          <Ariakit.DialogDescription className="muted">
            {messages.settingsHint}
          </Ariakit.DialogDescription>
          <LanguageSetting
            value={settings.language}
            messages={messages}
            onChange={(value) => update("language", value)}
          />
          <RadioSetting
            label={messages.theme}
            value={settings.theme}
            onChange={(value) => update("theme", value as Settings["theme"])}
            options={[
              { value: "system", label: messages.system },
              { value: "light", label: messages.light },
              { value: "dark", label: messages.dark },
            ]}
          />
          <section
            className="display-settings"
            aria-labelledby={`${id}-display`}
          >
            <h2 id={`${id}-display`}>{messages.currencyDisplay}</h2>
            <div className="display-options">
              <RadioSetting
                label={messages.precision}
                value={String(settings.digits)}
                onChange={(value) =>
                  update("digits", Number(value) as Settings["digits"])
                }
                options={[0, 2, 4].map((value) => ({
                  value: String(value),
                  label: String(value),
                }))}
              />
              <div className="toggle-settings">
                <label htmlFor={`${id}-showNames`}>
                  <Ariakit.Checkbox
                    id={`${id}-showNames`}
                    checked={settings.showNames}
                    onChange={(event) =>
                      update("showNames", event.target.checked)
                    }
                  />
                  <span>{messages.names}</span>
                </label>
                <label htmlFor={`${id}-showSymbols`}>
                  <Ariakit.Checkbox
                    id={`${id}-showSymbols`}
                    checked={settings.showSymbols}
                    onChange={(event) =>
                      update("showSymbols", event.target.checked)
                    }
                  />
                  <span>{messages.symbols}</span>
                </label>
                <label htmlFor={`${id}-showFlags`}>
                  <Ariakit.Checkbox
                    id={`${id}-showFlags`}
                    checked={settings.showFlags}
                    onChange={(event) =>
                      update("showFlags", event.target.checked)
                    }
                  />
                  <span>{messages.flags}</span>
                </label>
                <label htmlFor={`${id}-isCompact`}>
                  <Ariakit.Checkbox
                    id={`${id}-isCompact`}
                    checked={settings.isCompact}
                    onChange={(event) =>
                      update("isCompact", event.target.checked)
                    }
                  />
                  {messages.compact}
                </label>
              </div>
            </div>
            <section
              className={`currency-preview ${settings.isCompact ? "compact" : ""}`}
              aria-label={messages.currencyPreview}
            >
              <div className="money-row preview-row">
                <CurrencyLabel code="USD" locale={locale} settings={settings} />
                <span className="money-input">
                  {formatAmount({
                    value: 12_345.6789,
                    locale,
                    digits: settings.digits,
                  })}
                </span>
              </div>
            </section>
          </section>
          <InfoSection messages={messages} />
          <Ariakit.DialogDismiss className="primary-button">
            {messages.done}
          </Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      )}
    </AnimatePresence>
  );
}

type InfoSectionProps = {
  messages: Messages;
};

function InfoSection({ messages }: InfoSectionProps) {
  const id = useId();
  const [openItem, setOpenItem] = useState<"rates" | "feedback" | null>(null);

  return (
    <section className="info-section" aria-labelledby={id}>
      <h2 id={id}>{messages.faq}</h2>
      <InfoDisclosure
        title={messages.rateInfo}
        open={openItem === "rates"}
        onOpenChange={(open) => setOpenItem(open ? "rates" : null)}
      >
        <p>{messages.rateDetails}</p>
      </InfoDisclosure>
      <InfoDisclosure
        title={messages.feedbackInfo}
        open={openItem === "feedback"}
        onOpenChange={(open) => setOpenItem(open ? "feedback" : null)}
      >
        <p>
          {messages.feedbackPrompt}{" "}
          <a href={`mailto:${BRANDING.feedbackEmail}`}>
            {BRANDING.feedbackEmail}
          </a>
        </p>
      </InfoDisclosure>
    </section>
  );
}
