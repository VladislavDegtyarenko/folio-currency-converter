import * as Ariakit from "@ariakit/react";
import { type Messages } from "../i18n/messages";
import { type Language } from "./model";

type Props = {
  value: Language;
  messages: Messages;
  onChange: (value: Language) => void;
};

export function LanguageSetting({ value, messages, onChange }: Props) {
  const options = [
    { value: "auto", label: messages.browser },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "pt", label: "Português (Brasil)" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "uk", label: "Українська" },
    { value: "ru", label: "Русский" },
    { value: "hi", label: "हिन्दी" },
  ];

  return (
    <Ariakit.SelectProvider
      value={value}
      setValue={(next) => onChange(next as Language)}
    >
      <div className="setting language-setting">
        <Ariakit.SelectLabel className="field-label">
          {messages.language}
        </Ariakit.SelectLabel>
        <Ariakit.Select className="language-select">
          {options.find((option) => option.value === value)?.label}
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          portal
          gutter={6}
          sameWidth
          className="language-menu"
        >
          {options.map((option) => (
            <Ariakit.SelectItem key={option.value} value={option.value}>
              {option.label}
              <Ariakit.SelectItemCheck />
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      </div>
    </Ariakit.SelectProvider>
  );
}
