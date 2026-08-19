import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const redis = Redis.fromEnv();

export const ratelimitLeads = new Ratelimit({
  redis,
  prefix: "ratelimit:leads",
  limiter: Ratelimit.slidingWindow(20, "10 s"),
});

export const ratelimitBlueprint = new Ratelimit({
  redis,
  prefix: "ratelimit:blueprint",
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  const identifier = getClientIp(request);
  const { success, limit, remaining } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again shortly.",
      },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": String(limit),
          "x-ratelimit-remaining": String(remaining),
          "Retry-After": "10",
        },
      }
    );
  }

  return null;
}