import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
  FunnelState,
  GenerateBlueprintResponse,
} from "@/types/preview";
import { applyRateLimit, ratelimitBlueprint } from "@/lib/rate-limit";
import {
  buildBlueprints,
  calculateChurn,
  validateFunnelState,
} from "@/lib/blueprint";

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateBlueprintResponse>> {
  try {
    const rateLimitResponse = await applyRateLimit(request, ratelimitBlueprint);
    if (rateLimitResponse) {
      return NextResponse.json(
        {
          success: false,
          churnMetrics: { annualLoss: 0, monthlyLoss: 0 },
          blueprints: [],
          error: "Too many requests. Please try again shortly.",
        },
        {
          status: 429,
          headers: rateLimitResponse.headers,
        }
      );
    }

    const body = await request.json();

    if (!validateFunnelState(body)) {
      return NextResponse.json(
        {
          success: false,
          churnMetrics: { annualLoss: 0, monthlyLoss: 0 },
          blueprints: [],
          error: "Invalid funnel state. Please check all fields and try again.",
        },
        { status: 400 }
      );
    }

    const state = body as FunnelState;
    const churnMetrics = calculateChurn(state.memberCount, state.pricePerMonth);
    const blueprints = buildBlueprints(state);

    return NextResponse.json({
      success: true,
      churnMetrics,
      blueprints,
    });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      {
        success: false,
        churnMetrics: { annualLoss: 0, monthlyLoss: 0 },
        blueprints: [],
        error: "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}