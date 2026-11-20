// @vitest-environment happy-dom

import { render } from "preact";
import { act } from "preact/test-utils";
import { expect, it, vi } from "vitest";
import { DEFAULT_STATE, type SavedState } from "../../storage/model";

const STORAGE_KEY = "folio.state.v1";

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
    vi.stubGlobal("chrome", undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 304 })),
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
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
      expect(dollars.value).toBe("221.00");
      expect(dollars.getAttribute("aria-invalid")).toBe("false");

      await enter(dollars, "221 - ");
      expect(euros.value).toBe("110.50");
      await act(async () => dollars.blur());
      expect(dollars.value).toBe("221 - ");
      expect(dollars.getAttribute("aria-invalid")).toBe("true");
      await enter(euros, "100 + 10.5");
      expect(dollars.value).toBe("221.00");
      expect(dollars.getAttribute("aria-invalid")).toBe("false");

      await enter(dollars, "221 / 0");
      await act(async () => {
        dollars.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
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

      const [localizedEuros, localizedDollars] =
        root.querySelectorAll<HTMLInputElement>(".money-input");
      await enter(localizedEuros, "1,234 + 1");
      expect(localizedDollars.value).toBe("2,470.00");
      await act(async () => {
        root.querySelector<HTMLButtonElement>(".settings-button")?.click();
      });
      await act(async () => {
        document.querySelector<HTMLButtonElement>(".language-select")?.click();
      });
      const german = [
        ...document.querySelectorAll<HTMLElement>('[role="option"]'),
      ].find((option) => option.textContent === "Deutsch");
      expect(german).toBeDefined();
      await act(async () => german?.click());
      await act(async () => {
        document
          .querySelector<HTMLButtonElement>(".settings-dialog .primary-button")
          ?.click();
      });
      expect(localizedEuros.value).toBe("1.235,00");
      expect(localizedDollars.value).toBe("2.470,00");
      await enter(localizedEuros, `${localizedEuros.value}=`);
      expect(localizedEuros.value).toBe("1.235");
      expect(localizedDollars.value).toBe("2.470,00");
    } finally {
      await act(async () => render(null, root));
      root.remove();
      localStorage.removeItem(STORAGE_KEY);
      vi.unstubAllGlobals();
    }
  },
);

it.each(["single", "multiple"] as const)(
  "updates the %s converter after a refresh and supports editing expressions with the keyboard",
  async (mode) => {
    const root = document.createElement("div");
    const rates = { date: "2026-11-19", usd: { USD: 1, EUR: 0.5 } };
    const saved: SavedState = {
      ...DEFAULT_STATE,
      mode,
      currencies: ["EUR", "USD"],
      hasSeenCalculationHint: true,
      settings: { ...DEFAULT_STATE.settings, language: "en" },
      rates,
    };
    const fetchRates = vi.fn(async () => new Response(null, { status: 304 }));
    vi.stubGlobal("chrome", undefined);
    vi.stubGlobal("fetch", fetchRates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    document.body.append(root);

    try {
      await openPopup(root);
      const [euros, dollars] =
        root.querySelectorAll<HTMLInputElement>(".money-input");
      const refresh = root.querySelector<HTMLButtonElement>(".refresh-button");

      await enter(dollars, "100 + 50");
      expect(euros.value).toBe("75.00");
      await act(async () => {
        refresh?.focus();
        refresh?.click();
      });
      expect(fetchRates).toHaveBeenCalledTimes(2);
      await vi.waitFor(() =>
        expect(refresh?.getAttribute("aria-busy")).toBe("false"),
      );
      expect(dollars.value).toBe("100 + 50");

      fetchRates.mockResolvedValueOnce(
        Response.json({
          date: "2026-11-20",
          usd: { USD: 1, EUR: 2 / 3 },
        }),
      );
      await act(async () => refresh?.click());
      expect(fetchRates).toHaveBeenCalledTimes(3);
      await vi.waitFor(() => expect(dollars.value).toBe("112.50"));
      expect(euros.value).toBe("75.00");

      await enter(dollars, "1 + ");
      expect(dollars.getAttribute("aria-invalid")).toBe("false");
      await act(async () => {
        dollars.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
      expect(dollars.value).toBe("112.50");
      expect(dollars.getAttribute("aria-invalid")).toBe("false");
      expect(document.activeElement).not.toBe(dollars);

      await enter(euros, "12,345 + 1");
      await act(async () => {
        euros.value = "12,34 + 1";
        euros.setSelectionRange(5, 5);
        euros.dispatchEvent(
          new InputEvent("input", {
            inputType: "deleteContentBackward",
            bubbles: true,
          }),
        );
      });
      expect(euros.value).toBe("1,234 + 1");
      expect(euros.selectionStart).toBe(5);
      expect(dollars.value).toBe("1,852.50");

      const equals = new KeyboardEvent("keydown", {
        key: "=",
        bubbles: true,
        cancelable: true,
      });
      await act(async () => {
        euros.dispatchEvent(equals);
      });
      expect(equals.defaultPrevented).toBe(true);
      expect(euros.value).toBe("1,235");
      expect(euros.selectionStart).toBe(euros.value.length);
      expect(document.activeElement).toBe(euros);
      expect(dollars.value).toBe("1,852.50");

      await enter(euros, "1,234 + 1");
      await act(async () => {
        euros.value = "1,23456 + 1";
        euros.setSelectionRange(7, 7);
        euros.dispatchEvent(
          new InputEvent("input", {
            inputType: "insertFromPaste",
            data: "56",
            bubbles: true,
          }),
        );
      });
      expect(euros.value).toBe("123,456 + 1");
      expect(euros.selectionStart).toBe(7);
      expect(dollars.value).toBe("185,185.50");

      await enter(euros, "1 / 300000000=");
      expect(euros.value).toBe("0");
      await act(async () => {
        euros.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "=",
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      await vi.waitFor(() => {
        expect(
          JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").euros,
        ).toBe(1 / 300000000);
      });
    } finally {
      await act(async () => render(null, root));
      root.remove();
      localStorage.removeItem(STORAGE_KEY);
      vi.unstubAllGlobals();
    }
  },
);
