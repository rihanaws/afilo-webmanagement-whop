import { describe, expect, it } from "vitest";
import { addBusinessHours } from "@/lib/sla";

function dateAt(iso: string): Date {
  return new Date(iso);
}

describe("addBusinessHours", () => {
  it("adds hours within the same business day", () => {
    const start = dateAt("2026-08-17T09:00:00.000Z");
    const result = addBusinessHours(start, 4);
    expect(result.toISOString()).toBe("2026-08-17T13:00:00.000Z");
  });

  it("rolls over to the next business day when the window is exceeded", () => {
    const start = dateAt("2026-08-17T15:00:00.000Z");
    const result = addBusinessHours(start, 4);
    expect(result.toISOString()).toBe("2026-08-18T11:00:00.000Z");
  });

  it("skips weekends (Saturday)", () => {
    const friday = dateAt("2026-08-14T16:00:00.000Z");
    const result = addBusinessHours(friday, 4);
    expect(result.toISOString()).toBe("2026-08-17T12:00:00.000Z");
  });

  it("skips weekends (Sunday)", () => {
    const sunday = dateAt("2026-08-16T10:00:00.000Z");
    const result = addBusinessHours(sunday, 2);
    expect(result.toISOString()).toBe("2026-08-17T11:00:00.000Z");
  });

  it("handles a full 48-hour deadline across a weekend", () => {
    const monday = dateAt("2026-08-17T09:00:00.000Z");
    const result = addBusinessHours(monday, 48);
    expect(result.toISOString()).toBe("2026-08-24T17:00:00.000Z");
  });

  it("lands exactly on the end-of-day boundary when consuming the last hour", () => {
    const start = dateAt("2026-08-17T16:00:00.000Z");
    const result = addBusinessHours(start, 1);
    expect(result.toISOString()).toBe("2026-08-17T17:00:00.000Z");
  });

  it("advances to next day when starting at exactly 5pm", () => {
    const start = dateAt("2026-08-17T17:00:00.000Z");
    const result = addBusinessHours(start, 1);
    expect(result.toISOString()).toBe("2026-08-18T10:00:00.000Z");
  });
});