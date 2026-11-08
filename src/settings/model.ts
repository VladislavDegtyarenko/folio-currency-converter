export const SUPPORTED_LANGUAGES = [
  "en",
  "es",
  "pt",
  "fr",
  "de",
  "uk",
  "ru",
  "hi",
] as const;

export type UiLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type Language = "auto" | UiLanguage;

export type Settings = {
  language: Language;
  theme: "system" | "light" | "dark";
  digits: 0 | 2 | 4;
  isCompact: boolean;
  showNames: boolean;
  showSymbols: boolean;
  showFlags: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  language: "auto",
  theme: "system",
  digits: 2,
  isCompact: false,
  showNames: true,
  showSymbols: false,
  showFlags: false,
};
