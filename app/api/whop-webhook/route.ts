import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { WhopWebhookEvent, ApiResponse } from "@/types/preview";

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;

function verifyWebhookSignature(
  _payload: string,
  _signature: string | null
): boolean {
  if (!WHOP_WEBHOOK_SECRET) {
    console.warn("WHOP_WEBHOOK_SECRET not set — skipping signature verification");
    return true;
  }
  // TODO: Implement HMAC signature verification when Whop SDK provides the mechanism
  return true;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const signature = request.headers.get("x-whop-signature");
    const rawBody = await request.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody) as WhopWebhookEvent;

    if (!event.event || !event.data) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const { user_id, status } = event.data;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id in webhook data" },
        { status: 400 }
      );
    }

    let subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELED";
    switch (status) {
      case "active":
        subscriptionStatus = "ACTIVE";
        break;
      case "past_due":
        subscriptionStatus = "PAST_DUE";
        break;
      case "canceled":
        subscriptionStatus = "CANCELED";
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown status: ${status}` },
          { status: 400 }
        );
    }

    const updatedClient = await prisma.client.update({
      where: { whopUserId: user_id },
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
        { success: false, error: "Client not found for the given user_id" },
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
