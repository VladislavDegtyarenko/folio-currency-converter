import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { createSavedStateStore, type SavedStateStore } from "./savedStateStore";

const SAVED_STATE_CONTEXT = createContext<SavedStateStore | null>(null);
let documentStore: SavedStateStore | undefined;

/** Reuses loaded data while this popup document remains alive. */
function getDocumentStore() {
  documentStore ??= createSavedStateStore();
  return documentStore;
}

type Props = PropsWithChildren;

export function SavedStateProvider({ children }: Props) {
  const [store] = useState(getDocumentStore);

  useEffect(() => {
    void store.load();
  }, [store]);

  return (
    <SAVED_STATE_CONTEXT.Provider value={store}>
      {children}
    </SAVED_STATE_CONTEXT.Provider>
  );
}

/** Returns stable read and update operations without subscribing to edits. */
export function useSavedStateStore() {
  const store = useContext(SAVED_STATE_CONTEXT);

  if (!store) {
    throw new Error("SavedStateProvider is missing");
  }

  return store;
}

/** Subscribes only to the primitive or stable reference selected by a consumer. */
export function useSavedState<T>(
  select: (snapshot: ReturnType<SavedStateStore["getSnapshot"]>) => T,
): T {
  const store = useSavedStateStore();
  return useSyncExternalStore(store.subscribe, () =>
    select(store.getSnapshot()),
  );
}
