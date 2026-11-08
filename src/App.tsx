import { ConverterProvider } from "./converter/ConverterProvider";
import { ConverterScreen } from "./converter/ConverterScreen";
import { ConverterPicker } from "./converter/currency/ConverterPicker";
import { ModePicker } from "./converter/ModePicker";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { ConverterToast } from "./notifications/ConverterToast";
import { RatesProvider } from "./rates/RatesProvider";
import { RatesStatus } from "./rates/RatesStatus";
import {
  SavedSettingsDialog,
  SettingsProvider,
} from "./settings/SettingsProvider";
import { StorageError } from "./storage/StorageError";
import { SavedStateProvider, useSavedState } from "./storage/useSavedState";

export function App() {
  return (
    <SavedStateProvider>
      <LocaleProvider>
        <RatesProvider>
          <SettingsProvider>
            <ConverterProvider>
              <AppShell />
            </ConverterProvider>
          </SettingsProvider>
        </RatesProvider>
      </LocaleProvider>
    </SavedStateProvider>
  );
}

function AppShell() {
  const isCompact = useSavedState(({ state }) => state.settings.isCompact);

  return (
    <main className={`app ${isCompact ? "compact" : ""}`}>
      <Header />
      <ModePicker />
      <StorageError />
      <RatesStatus />
      <ConverterScreen />
      <ConverterToast />
      <Footer />
      <SavedSettingsDialog />
      <ConverterPicker />
    </main>
  );
}
