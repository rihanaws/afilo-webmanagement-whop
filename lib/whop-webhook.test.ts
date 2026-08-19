import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  verifyWhopWebhookSignature,
  isWebhookIpAllowed,
  evaluateWebhookRequest,
} from "@/lib/whop-webhook";
import { createHmac } from "node:crypto";

const SECRET = "whsec_test_secret";

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function makeRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as Parameters<typeof isWebhookIpAllowed>[0];
}

describe("verifyWhopWebhookSignature", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a valid HMAC signature", () => {
    const body = '{"type":"membership.activated"}';
    const sig = sign(body, SECRET);
    expect(verifyWhopWebhookSignature(body, sig, SECRET)).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const body = '{"type":"membership.activated"}';
    const sig = sign(body, SECRET);
    expect(verifyWhopWebhookSignature(body, sig + "00", SECRET)).toBe(false);
  });

  it("rejects a missing signature in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(verifyWhopWebhookSignature('{"a":1}', null, SECRET)).toBe(false);
  });

  it("rejects when secret is missing in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(verifyWhopWebhookSignature('{"a":1}', "somesig", undefined)).toBe(false);
  });

  it("skips verification in development when secret is missing", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(verifyWhopWebhookSignature('{"a":1}', null, undefined)).toBe(true);
  });

  it("rejects a signature generated with a different secret", () => {
    const body = '{"type":"membership.activated"}';
    const sig = sign(body, "different_secret");
    expect(verifyWhopWebhookSignature(body, sig, SECRET)).toBe(false);
  });
});

describe("isWebhookIpAllowed", () => {
  it("allows when no allowlist is configured", () => {
    expect(isWebhookIpAllowed(makeRequest(), undefined)).toBe(true);
  });

  it("allows an IP present in the allowlist", () => {
    const request = makeRequest({ "x-forwarded-for": "203.0.113.10" });
    expect(isWebhookIpAllowed(request, ["203.0.113.10"])).toBe(true);
  });

  it("rejects an IP not in the allowlist", () => {
    const request = makeRequest({ "x-forwarded-for": "198.51.100.5" });
    expect(isWebhookIpAllowed(request, ["203.0.113.10"])).toBe(false);
  });

  it("rejects when no client IP header is present", () => {
    expect(isWebhookIpAllowed(makeRequest(), ["203.0.113.10"])).toBe(false);
  });

  it("uses x-real-ip when x-forwarded-for is absent", () => {
    const request = makeRequest({ "x-real-ip": "203.0.113.10" });
    expect(isWebhookIpAllowed(request, ["203.0.113.10"])).toBe(true);
  });
});

describe("evaluateWebhookRequest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns verified when signature and IP are valid", () => {
    vi.stubEnv("WHOP_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("WHOP_WEBHOOK_ALLOWED_IPS", "203.0.113.10");
    const body = '{"type":"membership.activated"}';
    const sig = sign(body, SECRET);
    const result = evaluateWebhookRequest(
      makeRequest({ "x-forwarded-for": "203.0.113.10" }),
      body,
      sig
    );
    expect(result).toEqual({ verified: true });
  });

  it("returns 401 for a bad signature", () => {
    vi.stubEnv("WHOP_WEBHOOK_SECRET", SECRET);
    const body = '{"type":"membership.activated"}';
    const result = evaluateWebhookRequest(makeRequest(), body, "badsig");
    expect(result.verified).toBe(false);
    if (!result.verified) expect(result.status).toBe(401);
  });

  it("returns 403 for a disallowed IP", () => {
    vi.stubEnv("WHOP_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("WHOP_WEBHOOK_ALLOWED_IPS", "203.0.113.10");
    const body = '{"type":"membership.activated"}';
    const sig = sign(body, SECRET);
    const result = evaluateWebhookRequest(
      makeRequest({ "x-forwarded-for": "198.51.100.5" }),
      body,
      sig
    );
    expect(result.verified).toBe(false);
    if (!result.verified) expect(result.status).toBe(403);
  });
});