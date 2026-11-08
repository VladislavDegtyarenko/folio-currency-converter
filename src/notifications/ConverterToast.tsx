import * as Ariakit from "@ariakit/react";
import {
  useConverterActions,
  useConverterNotice,
  useCurrencyPicker,
} from "../converter/ConverterProvider";
import { useLocale } from "../i18n/LocaleProvider";
import { useSettingsDialog } from "../settings/SettingsProvider";
import { Toast } from "./Toast";

export function ConverterToast() {
  const notice = useConverterNotice();
  const { dismissNotice, undo } = useConverterActions();
  const { pickerStore } = useCurrencyPicker();
  const settingsStore = useSettingsDialog();
  const isSettingsMounted = Ariakit.useStoreState(settingsStore, "mounted");
  const isPickerMounted = Ariakit.useStoreState(pickerStore, "mounted");
  const { messages } = useLocale();

  return (
    <Toast
      notice={notice}
      isSuspended={isSettingsMounted || isPickerMounted}
      messages={messages}
      onDismiss={dismissNotice}
      onUndo={undo}
    />
  );
}
