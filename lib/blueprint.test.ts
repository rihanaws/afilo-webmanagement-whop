import { describe, expect, it } from "vitest";
import {
  buildBlueprints,
  calculateChurn,
  validateFunnelState,
} from "@/lib/blueprint";
import type { FunnelState } from "@/types/preview";

const VALID_STATE: FunnelState = {
  communityName: "Apex Traders",
  niche: "Trading / Finance",
  memberCount: 500,
  pricePerMonth: 25,
  primaryGoal: "Increase Revenue",
  appIdea: "Trading performance dashboard",
  launchTimeline: "ASAP / within 1 week",
};

describe("calculateChurn", () => {
  it("computes the deterministic churn model", () => {
    const result = calculateChurn(500, 25);
    expect(result.annualLoss).toBe(18000);
    expect(result.monthlyLoss).toBe(1500);
  });

  it("handles small communities", () => {
    const result = calculateChurn(10, 5);
    expect(result.annualLoss).toBe(72);
    expect(result.monthlyLoss).toBe(6);
  });

  it("rounds fractional losses", () => {
    const result = calculateChurn(333, 19);
    expect(result.annualLoss).toBe(Math.round(333 * 19 * 0.12 * 12));
  });
});

describe("buildBlueprints", () => {
  it("returns exactly three options with stable ids", () => {
    const blueprints = buildBlueprints(VALID_STATE);
    expect(blueprints.map((b) => b.id)).toEqual(["option_a", "option_b", "option_c"]);
  });

  it("applies the goal modifier to features", () => {
    const blueprints = buildBlueprints(VALID_STATE);
    expect(blueprints[0].features[0]).toMatch(/^\[Revenue Focus\]/);
    expect(blueprints[0].features).toContain(
      "Upsell and cross-sell automation to maximize ARPU"
    );
  });

  it("injects the app idea into whyItFits", () => {
    const blueprints = buildBlueprints(VALID_STATE);
    expect(blueprints[0].whyItFits).toContain('"Trading performance dashboard"');
  });

  it("does not append app idea context when empty", () => {
    const blueprints = buildBlueprints({ ...VALID_STATE, appIdea: "" });
    expect(blueprints[0].whyItFits).not.toContain("Built specifically");
  });

  it("applies different goal modifiers per goal", () => {
    const retention = buildBlueprints({ ...VALID_STATE, primaryGoal: "Reduce Churn" });
    expect(retention[0].features[0]).toMatch(/^\[Retention Focus\]/);
    expect(retention[0].features).toContain(
      "Predictive churn alerts with automated win-back campaigns"
    );
  });
});

describe("validateFunnelState", () => {
  it("accepts a valid state", () => {
    expect(validateFunnelState(VALID_STATE)).toBe(true);
  });

  it("rejects null and non-objects", () => {
    expect(validateFunnelState(null)).toBe(false);
    expect(validateFunnelState("nope")).toBe(false);
    expect(validateFunnelState(42)).toBe(false);
  });

  it("rejects an empty community name", () => {
    expect(validateFunnelState({ ...VALID_STATE, communityName: "" })).toBe(false);
  });

  it("rejects an unknown niche", () => {
    expect(validateFunnelState({ ...VALID_STATE, niche: "Farming" })).toBe(false);
  });

  it("rejects a member count below the minimum", () => {
    expect(validateFunnelState({ ...VALID_STATE, memberCount: 5 })).toBe(false);
  });

  it("rejects an invalid price per month", () => {
    expect(validateFunnelState({ ...VALID_STATE, pricePerMonth: 2 })).toBe(false);
  });

  it("rejects an unknown primary goal", () => {
    expect(validateFunnelState({ ...VALID_STATE, primaryGoal: "Nap" })).toBe(false);
  });

  it("rejects an unknown launch timeline", () => {
    expect(validateFunnelState({ ...VALID_STATE, launchTimeline: "Someday" })).toBe(
      false
    );
  });
});