import { afterEach, expect, it, vi } from "vitest";
import { DEFAULT_STATE } from "./model";
import { createSavedStateStore } from "./savedStateStore";

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Creates an independently resolvable storage operation for race-condition checks. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it("restores validated preview data before the first render, including mode and preferences", () => {
  vi.stubGlobal("chrome", undefined);
  vi.stubGlobal("localStorage", {
    getItem: () =>
      JSON.stringify({
        ...DEFAULT_STATE,
        mode: "single",
        euros: 456,
        settings: { ...DEFAULT_STATE.settings, theme: "dark", digits: 9 },
      }),
  });
  const store = createSavedStateStore();
  expect(store.getSnapshot()).toMatchObject({
    isReady: true,
    hasStorageError: false,
    state: {
      mode: "single",
      euros: 456,
      settings: { theme: "dark", digits: 2 },
    },
  });
});

it("deduplicates extension reads, blocks edits until restoration and reuses loaded data", async () => {
  const pending = deferred<Record<string, unknown>>();
  const get = vi.fn(() => pending.promise);
  const set = vi.fn(async () => undefined);
  vi.stubGlobal("chrome", { storage: { local: { get, set } } });
  const store = createSavedStateStore();
  expect(store.getSnapshot().isReady).toBe(false);
  const loading = store.load();
  expect(store.load()).toBe(loading);
  store.updateState((previous) => ({ ...previous, euros: 999 }));
  expect(set).not.toHaveBeenCalled();
  pending.resolve({
    "folio.state.v1": { ...DEFAULT_STATE, euros: 250, mode: "single" },
  });
  await loading;
  expect(store.getSnapshot()).toMatchObject({
    isReady: true,
    state: { euros: 250, mode: "single" },
  });
  await store.load();
  expect(get).toHaveBeenCalledOnce();
  expect(set).not.toHaveBeenCalled();
});

it("serializes rapid writes and keeps the latest in-memory value while saving", async () => {
  const first = deferred<void>();
  const set = vi
    .fn()
    .mockImplementationOnce(() => first.promise)
    .mockResolvedValue(undefined);
  vi.stubGlobal("chrome", {
    storage: { local: { get: async () => ({}), set } },
  });
  const store = createSavedStateStore();
  await store.load();
  store.updateState((previous) => ({ ...previous, euros: 200 }));
  store.updateState((previous) => ({
    ...previous,
    euros: previous.euros + 50,
  }));
  await vi.waitFor(() => expect(set).toHaveBeenCalledOnce());
  expect(store.getState().euros).toBe(250);
  expect(set.mock.calls[0][0]["folio.state.v1"].euros).toBe(200);
  first.resolve();
  await vi.waitFor(() => expect(set).toHaveBeenCalledTimes(2));
  expect(set.mock.calls[1][0]["folio.state.v1"].euros).toBe(250);
});

it("retains edits after a failed save, exposes the error and recovers on a later save", async () => {
  const set = vi
    .fn()
    .mockRejectedValueOnce(new Error("quota"))
    .mockResolvedValue(undefined);
  vi.stubGlobal("chrome", {
    storage: { local: { get: async () => ({}), set } },
  });
  const store = createSavedStateStore();
  await store.load();
  store.updateState((previous) => ({ ...previous, euros: 200 }));
  await vi.waitFor(() =>
    expect(store.getSnapshot().hasStorageError).toBe(true),
  );
  expect(store.getState().euros).toBe(200);
  store.updateState((previous) => ({ ...previous, euros: 300 }));
  await vi.waitFor(() =>
    expect(store.getSnapshot().hasStorageError).toBe(false),
  );
  expect(store.getState().euros).toBe(300);
});

it("finishes loading with a persistent error when extension storage is unavailable", async () => {
  vi.stubGlobal("chrome", {
    storage: {
      local: {
        get: async () => {
          throw new Error("unavailable");
        },
      },
    },
  });
  const store = createSavedStateStore();
  await store.load();
  expect(store.getSnapshot()).toMatchObject({
    isReady: true,
    hasStorageError: true,
  });
});

it.each(["{broken", null])(
  "handles malformed or unavailable preview storage without crashing (%s)",
  (value) => {
    vi.stubGlobal("chrome", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        if (value === null) {
          throw new Error("blocked");
        }

        return value;
      },
    });
    expect(createSavedStateStore().getSnapshot()).toMatchObject({
      isReady: true,
      hasStorageError: true,
    });
  },
);
