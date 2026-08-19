import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export type WebhookVerificationResult =
  | { verified: true }
  | { verified: false; status: 401; reason: string }
  | { verified: false; status: 403; reason: string };

function safeEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function verifyWhopWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!secret) {
    console.warn("WHOP_WEBHOOK_SECRET not set");
    return process.env.NODE_ENV !== "production";
  }

  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export function isWebhookIpAllowed(
  request: NextRequest,
  allowlist: string[] | undefined
): boolean {
  if (!allowlist || allowlist.length === 0) {
    console.warn(
      "WHOP_WEBHOOK_ALLOWED_IPS not set — webhook IP allowlist disabled"
    );
    return true;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const candidateIps = [
    forwarded?.split(",")[0]?.trim(),
    realIp?.trim(),
  ].filter((ip): ip is string => Boolean(ip));

  if (candidateIps.length === 0) return false;

  return candidateIps.some((ip) => allowlist.includes(ip));
}

export function evaluateWebhookRequest(
  request: NextRequest,
  rawBody: string,
  signature: string | null
): WebhookVerificationResult {
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  if (!verifyWhopWebhookSignature(rawBody, signature, secret)) {
    return {
      verified: false,
      status: 401,
      reason: "Invalid webhook signature",
    };
  }

  const allowlist = process.env.WHOP_WEBHOOK_ALLOWED_IPS?.split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (!isWebhookIpAllowed(request, allowlist)) {
    return {
      verified: false,
      status: 403,
      reason: "Webhook source IP is not allowed",
    };
  }

  return { verified: true };
}