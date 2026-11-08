// @vitest-environment happy-dom

import { render } from "preact";
import { act } from "preact/test-utils";
import { expect, it, vi } from "vitest";
import { DEFAULT_STATE } from "./model";
import {
  SavedStateProvider,
  useSavedState,
  useSavedStateStore,
} from "./useSavedState";

it("isolates subscriptions during amount edits and retains ready state after remounting", async () => {
  const getItem = vi.fn(() => JSON.stringify({ ...DEFAULT_STATE, euros: 125 }));
  vi.stubGlobal("chrome", undefined);
  vi.stubGlobal("localStorage", { getItem, setItem: vi.fn() });
  const root = document.createElement("div");
  const renders = { amount: 0, settings: 0, ready: 0 };
  let store: ReturnType<typeof useSavedStateStore> | undefined;
  let amount = 0;
  let isReady = false;

  function Amount() {
    amount = useSavedState(({ state }) => state.euros);
    renders.amount += 1;
    return null;
  }

  function Settings() {
    useSavedState(({ state }) => state.settings);
    renders.settings += 1;
    return null;
  }

  function Ready() {
    isReady = useSavedState((snapshot) => snapshot.isReady);
    store = useSavedStateStore();
    renders.ready += 1;
    return null;
  }

  function View() {
    return (
      <SavedStateProvider>
        <Amount />
        <Settings />
        <Ready />
      </SavedStateProvider>
    );
  }

  try {
    await act(async () => {
      render(<View />, root);
    });
    expect(isReady).toBe(true);
    expect(amount).toBe(125);
    const before = { ...renders };
    await act(async () => {
      store?.updateState((previous) => ({ ...previous, euros: 500 }));
    });
    expect(amount).toBe(500);
    expect(renders.amount).toBeGreaterThan(before.amount);
    expect(renders.settings).toBe(before.settings);
    expect(renders.ready).toBe(before.ready);
    await act(async () => {
      render(null, root);
    });
    await act(async () => {
      render(<View />, root);
    });
    expect(isReady).toBe(true);
    expect(amount).toBe(500);
    expect(getItem).toHaveBeenCalledOnce();
  } finally {
    await act(async () => {
      render(null, root);
    });
    vi.unstubAllGlobals();
  }
});
