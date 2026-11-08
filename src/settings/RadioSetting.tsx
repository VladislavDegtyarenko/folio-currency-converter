import * as Ariakit from "@ariakit/react";
import { useId } from "react";

type Props = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

export function RadioSetting({ label, value, options, onChange }: Props) {
  const id = useId();
  const store = Ariakit.useRadioStore({
    value,
    setValue: (next) => {
      if (typeof next === "string") {
        onChange(next);
      }
    },
  });

  return (
    <div className="setting">
      <span id={`${id}-label`} className="setting-label">
        {label}
      </span>
      <Ariakit.RadioGroup
        store={store}
        className="radio-group"
        aria-labelledby={`${id}-label`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="radio-option"
            htmlFor={`${id}-${option.value}`}
          >
            <Ariakit.Radio id={`${id}-${option.value}`} value={option.value} />
            {option.label}
          </label>
        ))}
      </Ariakit.RadioGroup>
    </div>
  );
}
