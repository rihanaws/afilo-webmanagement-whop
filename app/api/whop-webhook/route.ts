import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateWebhookRequest } from "@/lib/whop-webhook";
import type { WhopWebhookEvent, ApiResponse } from "@/types/preview";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const signature = request.headers.get("x-whop-signature");
    const rawBody = await request.text();

    const verification = evaluateWebhookRequest(request, rawBody, signature);
    if (!verification.verified) {
      return NextResponse.json(
        { success: false, error: verification.reason },
        { status: verification.status }
      );
    }

    let event: WhopWebhookEvent;
    try {
      event = JSON.parse(rawBody) as WhopWebhookEvent;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!event.type || !event.data) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const userId = event.data.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user id in webhook data" },
        { status: 400 }
      );
    }

    let subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELED";
    switch (event.type) {
      case "membership.activated":
        subscriptionStatus = "ACTIVE";
        break;
      case "membership.deactivated":
        subscriptionStatus = "CANCELED";
        break;
      case "membership.cancel_at_period_end_changed":
        subscriptionStatus = event.data.status === "past_due" ? "PAST_DUE" : "ACTIVE";
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown event type: ${event.type}` },
          { status: 400 }
        );
    }

    const updatedClient = await prisma.client.update({
      where: { whopUserId: userId },
      data: { status: subscriptionStatus },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientId: updatedClient.id,
        status: updatedClient.status,
        updatedAt: updatedClient.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { success: false, error: "Client not found for the given user id" },
        { status: 404 }
      );
    }

    console.error("Whop webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}