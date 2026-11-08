import { expect, it } from "vitest";
import { resolveLocale } from "./locale";

it("uses browser preferences and retains regional number formatting", () => {
  expect(
    resolveLocale({ language: "auto", languages: ["uk-UA", "en-US"] }),
  ).toMatchObject({ uiLanguage: "uk", locale: "uk-UA" });
  expect(
    resolveLocale({ language: "auto", languages: ["hr-HR", "ru-RU"] }),
  ).toMatchObject({ uiLanguage: "ru", locale: "hr-HR" });
  expect(
    resolveLocale({ language: "auto", languages: ["hr-HR"] }),
  ).toMatchObject({ uiLanguage: "en", locale: "hr-HR" });
});
it("honors a manual language selection", () => {
  expect(resolveLocale({ language: "en", languages: ["ru-RU"] })).toMatchObject(
    { uiLanguage: "en", locale: "en-US" },
  );
});

it.each([
  ["es", "es-ES", "es-MX"],
  ["pt", "pt-BR", "pt-PT"],
  ["fr", "fr-FR", "fr-CA"],
  ["de", "de-DE", "de-AT"],
  ["hi", "hi-IN", "hi-IN"],
] as const)(
  "resolves %s manually and from regional browser preferences",
  (language, locale, browserLocale) => {
    const manual = resolveLocale({ language, languages: ["en-US"] });
    const automatic = resolveLocale({
      language: "auto",
      languages: ["hr-HR", browserLocale, "en-US"],
    });
    expect(manual).toMatchObject({ uiLanguage: language, locale });
    expect(automatic).toMatchObject({ uiLanguage: language, locale: "hr-HR" });
    expect(automatic.messages).toBe(manual.messages);
    expect(manual.messages.appName).toContain("Folio:");
    expect(manual.messages.settings).not.toBe("Settings");
  },
);
