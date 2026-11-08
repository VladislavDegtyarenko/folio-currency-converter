import { type SetStateAction } from "react";
import { DEFAULT_STATE, type SavedState } from "./model";
import { readPreviewState, readState, writeState } from "./persistence";

type Snapshot = {
  state: SavedState;
  isReady: boolean;
  hasStorageError: boolean;
};

/** Owns one document's validated state and keeps writes ordered across remounts. */
export function createSavedStateStore() {
  let snapshot: Snapshot;
  const listeners = new Set<() => void>();
  let loading: Promise<void> | undefined;
  let writes = Promise.resolve();

  try {
    const preview = readPreviewState();
    snapshot = {
      state: preview ?? DEFAULT_STATE,
      isReady: preview !== undefined,
      hasStorageError: false,
    };
  } catch {
    snapshot = { state: DEFAULT_STATE, isReady: true, hasStorageError: true };
  }

  /** Publishes a stable snapshot only when something has changed. */
  function publish(next: Snapshot) {
    if (
      next.state === snapshot.state &&
      next.isReady === snapshot.isReady &&
      next.hasStorageError === snapshot.hasStorageError
    ) {
      return;
    }

    snapshot = next;
    listeners.forEach((listener) => {
      listener();
    });
  }

  /** Reads extension storage once; preview data is already available synchronously. */
  function load() {
    if (!snapshot.isReady && !loading) {
      loading = readState().then(
        (state) => publish({ state, isReady: true, hasStorageError: false }),
        () => publish({ ...snapshot, isReady: true, hasStorageError: true }),
      );
    }

    return loading ?? Promise.resolve();
  }

  /** Applies edits only after restoration and queues their persistence in order. */
  function updateState(update: SetStateAction<SavedState>) {
    if (!snapshot.isReady) {
      return;
    }

    const next = typeof update === "function" ? update(snapshot.state) : update;

    if (next === snapshot.state) {
      return;
    }

    publish({ ...snapshot, state: next });
    writes = writes.catch(() => undefined).then(() => writeState(next));
    void writes.then(
      () => publish({ ...snapshot, hasStorageError: false }),
      () => publish({ ...snapshot, hasStorageError: true }),
    );
  }

  return {
    getSnapshot: () => snapshot,
    getState: () => snapshot.state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    updateState,
  };
}

export type SavedStateStore = ReturnType<typeof createSavedStateStore>;
