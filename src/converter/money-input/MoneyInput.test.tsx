// @vitest-environment happy-dom

import { render } from "preact";
import { act } from "preact/test-utils";
import { expect, it, vi } from "vitest";
import { DEFAULT_STATE, type SavedState } from "../../storage/model";

/** Simulates typing or pasting text into an amount input. */
async function enter(input: HTMLInputElement, text: string) {
  await act(async () => {
    input.focus();
    input.value = text;
    input.setSelectionRange(text.length, text.length);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/** Loads a fresh popup module so its store reads from persisted storage. */
async function openPopup(root: HTMLElement) {
  vi.resetModules();
  const [{ App }, { MotionConfig }] = await Promise.all([
    import("../../App"),
    import("framer-motion"),
  ]);
  await act(async () =>
    render(
      <MotionConfig skipAnimations>
        <App />
      </MotionConfig>,
      root,
    ),
  );
}

it.each(["single", "multiple"] as const)(
  "converts live, replaces on equals and restores the result in %s mode",
  async (mode) => {
    const root = document.createElement("div");
    const saved: SavedState = {
      ...DEFAULT_STATE,
      mode,
      currencies: ["EUR", "USD"],
      settings: { ...DEFAULT_STATE.settings, language: "en" },
      rates: { date: "2026-11-19", usd: { USD: 1, EUR: 0.5 } },
    };
    const storageKey = "folio.state.v1";
    vi.stubGlobal("chrome", undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 304 })),
    );
    localStorage.setItem(storageKey, JSON.stringify(saved));
    document.body.append(root);

    try {
      await openPopup(root);
      const inputs = root.querySelectorAll<HTMLInputElement>(".money-input");
      expect(inputs).toHaveLength(2);
      const [euros, dollars] = inputs;

      await act(async () => euros.focus());
      const hint = document.querySelector(".calculation-hint");
      expect(hint).not.toBeNull();
      expect(document.activeElement).toBe(euros);

      if (mode === "single") {
        await act(async () => {
          euros.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
          );
        });
        expect(document.activeElement).toBe(euros);
        await vi.waitFor(() => expect(hint?.isConnected).toBe(false));
      }

      await enter(euros, "100 +  5.25 * 2");
      await vi.waitFor(() => expect(hint?.isConnected).toBe(false));
      expect(euros.getAttribute("aria-invalid")).toBe("false");
      expect(euros.value).toBe("100 +  5.25 * 2");
      expect(dollars.value).toBe("221.00");

      await enter(dollars, "221 / 0");
      expect(dollars.getAttribute("aria-invalid")).toBe("true");
      expect(euros.value).toBe("100 +  5.25 * 2");

      await enter(euros, "100 +  5.25 * 2=");
      expect(euros.value).toBe("110.5");
      expect(euros.selectionStart).toBe(euros.value.length);
      expect(document.activeElement).toBe(euros);
      expect(dollars.value).toBe("221 / 0");
      expect(dollars.getAttribute("aria-invalid")).toBe("true");

      await act(async () => dollars.focus());
      expect(euros.value).toBe("110.50");
      await act(async () => {
        dollars.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
      expect(dollars.value).toBe("221.00");
      expect(dollars.getAttribute("aria-invalid")).toBe("false");

      await enter(dollars, "221 - ");
      await act(async () => dollars.blur());
      expect(dollars.value).toBe("221 - ");
      expect(dollars.getAttribute("aria-invalid")).toBe("true");
      await enter(euros, "100 + 10.5");
      expect(dollars.value).toBe("221.00");
      expect(dollars.getAttribute("aria-invalid")).toBe("false");

      await enter(dollars, "250 - 10");
      expect(dollars.value).toBe("250 - 10");
      expect(euros.value).toBe("120.00");
      await act(async () => render(null, root));
      await openPopup(root);
      expect(
        [...root.querySelectorAll<HTMLInputElement>(".money-input")].map(
          (input) => input.value,
        ),
      ).toEqual(["120.00", "240.00"]);
      const reopenedInput =
        root.querySelector<HTMLInputElement>(".money-input");
      await act(async () => reopenedInput?.focus());
      expect(document.querySelector(".calculation-hint")).toBeNull();
    } finally {
      await act(async () => render(null, root));
      root.remove();
      localStorage.removeItem(storageKey);
      vi.unstubAllGlobals();
    }
  },
);
