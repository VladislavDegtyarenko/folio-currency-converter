import { useLocale } from "../i18n/LocaleProvider";
import { useSavedState } from "./useSavedState";

export function StorageError() {
  const hasStorageError = useSavedState((snapshot) => snapshot.hasStorageError);
  const { messages } = useLocale();

  return hasStorageError ? (
    <div role="alert" className="storage-error">
      {messages.storageError}
    </div>
  ) : null;
}
