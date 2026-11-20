import { describe, expect, it } from "vitest";
import { createAmountFormat } from "./createAmountFormat";

describe("createAmountFormat", () => {
  it.each([
    ["en-US", ",", ".", "0123456789", "1,234,568"],
    ["fr-FR", "\u202f", ",", "0123456789", "1\u202f234\u202f568"],
    ["en-IN", ",", ".", "0123456789", "12,34,568"],
    ["ar-EG", "٬", "٫", "٠١٢٣٤٥٦٧٨٩", "١٬٢٣٤٬٥٦٨"],
  ])(
    "builds the number format for %s",
    (locale, group, decimal, digits, integer) => {
      const format = createAmountFormat(locale);

      expect(format.group).toBe(group);
      expect(format.decimal).toBe(decimal);
      expect(format.digits).toEqual([...digits]);
      expect(format.integer.format(1_234_567.8)).toBe(integer);
    },
  );
});
