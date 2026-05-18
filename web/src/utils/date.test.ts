import { describe, expect, it } from "vitest";
import { formatDateTime, fromDatetimeLocalValue, toDatetimeLocalValue } from "./date";

describe("date utils", () => {
  it("formats empty dates as a dash", () => {
    expect(formatDateTime(null)).toBe("-");
  });

  it("parses empty datetime-local values as null", () => {
    expect(fromDatetimeLocalValue("")).toBeNull();
  });

  it("round-trips datetime-local values", () => {
    const original = new Date(2026, 4, 18, 15, 45);
    const localValue = toDatetimeLocalValue(original);

    expect(localValue).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(fromDatetimeLocalValue(localValue)?.getTime()).toBe(original.getTime());
  });
});
