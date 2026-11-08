import { restoreState, type SavedState } from "./model";

const STORAGE_KEY = "folio.state.v1";

/** Restores preview data immediately; extension storage must be read asynchronously. */
export function readPreviewState(): SavedState | undefined {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    return undefined;
  }

  const data = localStorage.getItem(STORAGE_KEY);
  return restoreState(data ? JSON.parse(data) : undefined);
}

/** Reads extension storage, with a local fallback only for the browser preview. */
export async function readState(): Promise<SavedState> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return restoreState(data[STORAGE_KEY]);
  }

  return readPreviewState() ?? restoreState(undefined);
}

/** Saves only validated application state; it never accesses a network service. */
export async function writeState(state: SavedState): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
