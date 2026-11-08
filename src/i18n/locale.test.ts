import { expect, it } from "vitest";
import { resolveLocale } from "./locale";

it("uses browser preferences and retains regional number formatting", () => {
  expect(
    resolveLocale({ language: "auto", languages: ["uk-UA", "en-US"] }),
  ).toMatchObject({ uiLanguage: "uk", locale: "uk-UA" });
  expect(
    resolveLocale({ language: "auto", languages: ["de-DE", "ru-RU"] }),
  ).toMatchObject({ uiLanguage: "ru", locale: "de-DE" });
  expect(
    resolveLocale({ language: "auto", languages: ["hr-HR"] }),
  ).toMatchObject({ uiLanguage: "en", locale: "hr-HR" });
});
it("honors a manual language selection", () => {
  expect(resolveLocale({ language: "en", languages: ["ru-RU"] })).toMatchObject(
    { uiLanguage: "en", locale: "en-US" },
  );
});
