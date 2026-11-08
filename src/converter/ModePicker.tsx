import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState, useSavedStateStore } from "../storage/useSavedState";

export function ModePicker() {
  const mode = useSavedState(({ state }) => state.mode);
  const isReady = useSavedState((snapshot) => snapshot.isReady);
  const { updateState } = useSavedStateStore();
  const { messages } = useLocale();

  return (
    <fieldset
      className="mode-picker"
      disabled={!isReady}
      aria-label={`${messages.single} / ${messages.multiple}`}
    >
      {(["single", "multiple"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() =>
            updateState((previous) =>
              previous.mode === value ? previous : { ...previous, mode: value },
            )
          }
        >
          {messages[value]}
        </button>
      ))}
    </fieldset>
  );
}
