import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useSavedState } from "../storage/useSavedState";
import { resolveLocale } from "./locale";

const LOCALE_CONTEXT = createContext<ReturnType<typeof resolveLocale> | null>(
  null,
);

type Props = PropsWithChildren;

export function LocaleProvider({ children }: Props) {
  const language = useSavedState(({ state }) => state.settings.language);
  const theme = useSavedState(({ state }) => state.settings.theme);
  const value = useMemo(
    () => resolveLocale({ language, languages: navigator.languages }),
    [language],
  );

  useEffect(() => {
    document.title = value.messages.appName;
    document.documentElement.lang = value.uiLanguage;
    document.documentElement.dataset.theme = theme;
  }, [value.uiLanguage, value.messages.appName, theme]);

  return (
    <LOCALE_CONTEXT.Provider value={value}>{children}</LOCALE_CONTEXT.Provider>
  );
}

/** Shares stable translations and number formatting preferences. */
export function useLocale() {
  const locale = useContext(LOCALE_CONTEXT);

  if (!locale) {
    throw new Error("LocaleProvider is missing");
  }

  return locale;
}
