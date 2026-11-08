// @vitest-environment happy-dom

import { render } from "preact";
import { act } from "preact/test-utils";
import { expect, it, vi } from "vitest";
import { EN } from "../i18n/messages";
import { Toast } from "./Toast";

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => true,
}));

it("keeps Undo usable after the ordinary notification timeout", async () => {
  vi.useFakeTimers();
  const root = document.createElement("div");
  const onDismiss = vi.fn();
  const onUndo = vi.fn();

  try {
    await act(async () => {
      render(
        <Toast
          notice={{ id: 1, messageKey: "removed", canUndo: true }}
          isSuspended={false}
          messages={EN}
          onDismiss={onDismiss}
          onUndo={onUndo}
        />,
        root,
      );
    });
    await act(async () => {
      vi.advanceTimersByTime(6_000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    const undo = root.querySelector<HTMLButtonElement>(".toast-undo");
    expect(undo).not.toBeNull();
    await act(async () => {
      undo?.click();
    });
    expect(onUndo).toHaveBeenCalledOnce();
  } finally {
    await act(async () => {
      render(null, root);
    });
    vi.useRealTimers();
  }
});
