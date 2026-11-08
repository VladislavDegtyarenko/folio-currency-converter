import { type Language } from "../settings/model";
import { EN, RU, UK } from "./messages";

/** Selects a supported UI language while preserving the browser's numeric locale. */
export function resolveLocale({
  language,
  languages,
}: {
  language: Language;
  languages: readonly string[];
}) {
  const browserLocale = languages[0] || "en-US";
  const locale =
    language === "auto"
      ? browserLocale
      : { en: "en-US", ru: "ru-RU", uk: "uk-UA" }[language];
  const supported = languages
    .map((value) => value.split("-")[0])
    .find((value) => ["en", "ru", "uk"].includes(value));
  const uiLanguage = language === "auto" ? (supported ?? "en") : language;
  const messages = uiLanguage === "ru" ? RU : uiLanguage === "uk" ? UK : EN;

  return { locale, uiLanguage, messages };
}
