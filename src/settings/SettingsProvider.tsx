import * as Ariakit from "@ariakit/react";
import { createContext, type PropsWithChildren, useContext } from "react";
import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState, useSavedStateStore } from "../storage/useSavedState";
import { SettingsDialog } from "./SettingsDialog";

const SETTINGS_CONTEXT = createContext<Ariakit.DialogStore | null>(null);

type Props = PropsWithChildren;

export function SettingsProvider({ children }: Props) {
  const store = Ariakit.useDialogStore();

  return (
    <SETTINGS_CONTEXT.Provider value={store}>
      {children}
    </SETTINGS_CONTEXT.Provider>
  );
}

/** Shares the settings dialog store without subscribing the application shell. */
export function useSettingsDialog() {
  const store = useContext(SETTINGS_CONTEXT);

  if (!store) {
    throw new Error("SettingsProvider is missing");
  }

  return store;
}

export function SavedSettingsDialog() {
  const store = useSettingsDialog();
  const settings = useSavedState(({ state }) => state.settings);
  const { updateState } = useSavedStateStore();
  const { locale, messages } = useLocale();

  return (
    <SettingsDialog
      store={store}
      settings={settings}
      locale={locale}
      messages={messages}
      onChange={(settings) =>
        updateState((previous) => ({ ...previous, settings }))
      }
    />
  );
}
