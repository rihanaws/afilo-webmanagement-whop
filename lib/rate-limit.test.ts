import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getClientIp } from "@/lib/rate-limit";

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({}),
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    async limit(identifier: string) {
      return { success: true, limit: 20, remaining: 19, identifier };
    }
  },
}));

import { Ratelimit } from "@upstash/ratelimit";
import { applyRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

interface MockLimitArgs {
  identifier: string;
}

function makeRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as Parameters<typeof applyRateLimit>[0];
}

describe("getClientIp", () => {
  it("extracts the first x-forwarded-for value", () => {
    const request = makeRequest({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(getClientIp(request)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip", () => {
    const request = makeRequest({ "x-real-ip": "198.51.100.4" });
    expect(getClientIp(request)).toBe("198.51.100.4");
  });

  it("returns unknown when no IP headers exist", () => {
    expect(getClientIp(makeRequest())).toBe("unknown");
  });
});

describe("applyRateLimit", () => {
  let mockLimit: ReturnType<typeof vi.fn<(args: MockLimitArgs) => Promise<{ success: boolean; limit: number; remaining: number; identifier: string }>>>;

  beforeEach(() => {
    mockLimit = vi.fn<(args: MockLimitArgs) => Promise<{ success: boolean; limit: number; remaining: number; identifier: string }>>().mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      identifier: "",
    });

    vi.spyOn(Ratelimit.prototype, "limit").mockImplementation(
      ((identifier: string) => mockLimit({ identifier })) as never
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when the request is allowed", async () => {
    const limiter = new Ratelimit({
      redis: {} as never,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
    });
    const result = await applyRateLimit(makeRequest(), limiter);
    expect(result).toBeNull();
    expect(mockLimit).toHaveBeenCalledWith({ identifier: "unknown" });
  });

  it("returns a 429 response when the limit is exceeded", async () => {
    mockLimit.mockResolvedValueOnce({
      success: false,
      limit: 20,
      remaining: 0,
      identifier: "",
    });

    const limiter = new Ratelimit({
      redis: {} as never,
      limiter: Ratelimit.slidingWindow(20, "10 s"),
    });

    const result = await applyRateLimit(makeRequest({ "x-forwarded-for": "203.0.113.9" }), limiter);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(429);
    expect(result?.headers.get("retry-after")).toBe("10");
    expect(result?.headers.get("x-ratelimit-limit")).toBe("20");

    const body = await result?.json();
    expect(body.success).toBe(false);
  });
});