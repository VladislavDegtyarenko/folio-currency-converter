// @vitest-environment happy-dom

import { render } from "preact";
import { act } from "preact/test-utils";
import { expect, it, vi } from "vitest";
import { EN } from "../i18n/messages";
import { LanguageSetting } from "./LanguageSetting";

it("mounts Ariakit refs, handles native focus, and confirms a language with the keyboard", async () => {
  const root = document.createElement("div");
  const onChange = vi.fn();
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => errors.push(event.error);
  window.addEventListener("error", onError);
  document.body.append(root);

  try {
    await act(async () => {
      render(
        <LanguageSetting value="en" messages={EN} onChange={onChange} />,
        root,
      );
    });

    const select = root.querySelector<HTMLElement>('[role="combobox"]');
    expect(select).not.toBeNull();

    await act(async () => {
      select?.focus();
      select?.click();
    });

    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    });

    const list = document.querySelector<HTMLElement>('[role="listbox"]');
    await act(async () => {
      list?.focus();
      list?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          code: "ArrowDown",
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    await vi.waitFor(() => {
      expect(list?.getAttribute("aria-activedescendant")).toBeTruthy();
    });

    await act(async () => {
      list?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      );
    });

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("auto");
    });
    expect(errors).toEqual([]);
  } finally {
    await act(async () => render(null, root));
    root.remove();
    window.removeEventListener("error", onError);
  }
});
