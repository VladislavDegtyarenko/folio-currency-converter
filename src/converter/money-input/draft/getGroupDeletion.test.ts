import { describe, expect, it } from "vitest";
import { getGroupDeletion } from "./getGroupDeletion";

describe("getGroupDeletion", () => {
  it.each([
    ["1,234.50", ",", "Backspace", 2, { start: 0, end: 2 }],
    ["1,234.50", ",", "Delete", 1, { start: 1, end: 3 }],
    ["1\u202f234,50", "\u202f", "Backspace", 2, { start: 0, end: 2 }],
  ])(
    "extends %s group deletion with %s, %s at %d",
    (text, group, key, caret, expected) => {
      expect(
        getGroupDeletion({ text, group, key, start: caret, end: caret }),
      ).toEqual(expected);
    },
  );

  it.each([
    [",", "Backspace", 2, 4],
    [",", "Backspace", 4, 4],
    [",", "Delete", 6, 6],
    [",", "ArrowLeft", 2, 2],
    ["", "Backspace", 2, 2],
  ])(
    "keeps the selection for group %j, %s and selection %d to %d",
    (group, key, start, end) => {
      expect(
        getGroupDeletion({ text: "1,234.50", group, key, start, end }),
      ).toBeNull();
    },
  );
});
