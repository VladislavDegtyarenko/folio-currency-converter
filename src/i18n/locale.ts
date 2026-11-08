import {
  type Language,
  SUPPORTED_LANGUAGES,
  type UiLanguage,
} from "../settings/model";
import { DE } from "./de/messages";
import { ES } from "./es/messages";
import { FR } from "./fr/messages";
import { HI } from "./hi/messages";
import { EN, type Messages, RU, UK } from "./messages";
import { PT } from "./pt/messages";

const LOCALES: Record<UiLanguage, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  uk: "uk-UA",
  ru: "ru-RU",
  hi: "hi-IN",
};

const MESSAGES: Record<UiLanguage, Messages> = {
  en: EN,
  es: ES,
  pt: PT,
  fr: FR,
  de: DE,
  uk: UK,
  ru: RU,
  hi: HI,
};

/** Selects a supported UI language while preserving the browser's numeric locale. */
export function resolveLocale({
  language,
  languages,
}: {
  language: Language;
  languages: readonly string[];
}) {
  const browserLocale = languages[0] || "en-US";
  const locale = language === "auto" ? browserLocale : LOCALES[language];
  const supported = languages
    .map((value) => value.split("-")[0].toLowerCase())
    .find((value): value is UiLanguage =>
      SUPPORTED_LANGUAGES.some(
        (supportedLanguage) => supportedLanguage === value,
      ),
    );
  const uiLanguage = language === "auto" ? (supported ?? "en") : language;

  return { locale, uiLanguage, messages: MESSAGES[uiLanguage] };
}
