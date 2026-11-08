// @vitest-environment happy-dom

import { render } from "preact";
import { act } from "preact/test-utils";
import { expect, it, vi } from "vitest";
import { DEFAULT_STATE } from "../storage/model";
import { SavedStateProvider } from "../storage/useSavedState";
import {
  ConverterProvider,
  useConverterActions,
  useConverterCurrencyHighlight,
  useConverterNotice,
} from "./ConverterProvider";

it("keeps action consumers stable and isolates notifications from input revisions and currency highlights", async () => {
  vi.stubGlobal("chrome", undefined);
  vi.stubGlobal("localStorage", {
    getItem: () => JSON.stringify(DEFAULT_STATE),
  });
  const root = document.createElement("div");
  const renders = { actions: 0, notice: 0, currencyHighlight: 0 };
  let actions: ReturnType<typeof useConverterActions> | undefined;

  function Actions() {
    actions = useConverterActions();
    renders.actions += 1;
    return null;
  }

  function Notice() {
    useConverterNotice();
    renders.notice += 1;
    return null;
  }

  function CurrencyHighlight() {
    useConverterCurrencyHighlight();
    renders.currencyHighlight += 1;
    return null;
  }

  try {
    await act(async () => {
      render(
        <SavedStateProvider>
          <ConverterProvider>
            <Actions />
            <Notice />
            <CurrencyHighlight />
          </ConverterProvider>
        </SavedStateProvider>,
        root,
      );
    });
    const before = { ...renders };
    const initialActions = actions;
    await act(async () => {
      actions?.notify("refreshed");
    });
    expect(renders.notice).toBeGreaterThan(before.notice);
    expect(renders.currencyHighlight).toBe(before.currencyHighlight);
    expect(renders.actions).toBe(before.actions);
    const noticeRenders = renders.notice;
    await act(async () => {
      actions?.input("EUR", 200);
    });
    expect(renders.currencyHighlight).toBeGreaterThan(before.currencyHighlight);
    expect(renders.notice).toBe(noticeRenders);
    expect(renders.actions).toBe(before.actions);
    expect(actions).toBe(initialActions);
  } finally {
    await act(async () => {
      render(null, root);
    });
    vi.unstubAllGlobals();
  }
});
