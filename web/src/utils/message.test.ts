import { describe, expect, it } from "vitest";
import { getInitialMessageStatus, matchesMessageFilter } from "./message";

describe("message utils", () => {
  const now = new Date("2026-05-18T15:00:00-03:00");

  it("marks messages without schedule as sent", () => {
    expect(getInitialMessageStatus(null, now)).toBe("sent");
  });

  it("marks future scheduled messages as scheduled", () => {
    expect(getInitialMessageStatus(new Date("2026-05-18T15:10:00-03:00"), now)).toBe(
      "scheduled"
    );
  });

  it("marks past scheduled messages as sent", () => {
    expect(getInitialMessageStatus(new Date("2026-05-18T14:59:00-03:00"), now)).toBe("sent");
  });

  it("matches the all filter and exact status filters", () => {
    expect(matchesMessageFilter("sent", "all")).toBe(true);
    expect(matchesMessageFilter("scheduled", "scheduled")).toBe(true);
    expect(matchesMessageFilter("sent", "scheduled")).toBe(false);
  });
});
