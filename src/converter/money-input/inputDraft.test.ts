import { describe, expect, it } from "vitest";
import { getCurrentInputDraft, type InputDraft } from "./inputDraft";

describe("invalid draft recovery", () => {
  it("preserves an error while another field is only focused or also invalid", () => {
    const draft: InputDraft = {
      text: "1e",
      caret: 2,
      amount: null,
      revision: 3,
    };
    expect(getCurrentInputDraft({ draft, inputRevision: 3 })).toBe(draft);
  });

  it("clears every stale invalid draft after a valid edit, independently of its numeric value", () => {
    for (const text of ["1e", "", "-20", "1.2.3"]) {
      const draft: InputDraft = {
        text,
        caret: text.length,
        amount: null,
        revision: 3,
      };
      expect(getCurrentInputDraft({ draft, inputRevision: 4 })).toBeNull();
      expect(getCurrentInputDraft({ draft, inputRevision: 5 })).toBeNull();
    }
  });

  it("preserves the active valid draft's zeros, decimal separator and caret", () => {
    for (const text of ["1,234.00", "1,234.", "0"]) {
      const draft: InputDraft = { text, caret: 2, amount: 1234, revision: 3 };
      expect(getCurrentInputDraft({ draft, inputRevision: 4 })).toBe(draft);
    }
  });

  it("keeps an untouched input in formatted-output mode", () => {
    expect(getCurrentInputDraft({ draft: null, inputRevision: 1 })).toBeNull();
  });
});
