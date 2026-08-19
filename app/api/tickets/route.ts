import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveClientFromRequest } from "@/lib/resolve-client";
import { addBusinessHours } from "@/lib/sla";
import type { ApiResponse } from "@/types/preview";

interface TicketPayload {
  title?: string;
  category?: string;
  description?: string;
  urgent?: boolean;
}

const ALLOWED_CATEGORIES = ["Text Change", "Pricing Update", "Image Swap", "Other"] as const;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = (await request.json()) as TicketPayload;

    if (!body.title || body.title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "title is required (minimum 3 characters)" },
        { status: 400 }
      );
    }

    if (!body.description || body.description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "description is required (minimum 10 characters)" },
        { status: 400 }
      );
    }

    const category =
      body.category && (ALLOWED_CATEGORIES as readonly string[]).includes(body.category)
        ? body.category
        : "Other";

    const client = await resolveClientFromRequest(request, body as Record<string, unknown>);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found. Provide clientId in the body or x-whop-user-id header." },
        { status: 404 }
      );
    }

    if (client.usedEditMin >= client.monthlyEditMin) {
      return NextResponse.json(
        { success: false, error: "Monthly SLA edit minutes exhausted" },
        { status: 400 }
      );
    }

    const slaDeadline = addBusinessHours(new Date(), 48);

    const ticket = await prisma.editTicket.create({
      data: {
        clientId: client.id,
        title: body.title.trim(),
        category,
        description: body.description.trim(),
        urgent: body.urgent ?? false,
        slaDeadline,
      },
    });

    await prisma.client.update({
      where: { id: client.id },
      data: { usedEditMin: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: {
        ticketId: ticket.id,
        status: ticket.status,
        slaDeadline: ticket.slaDeadline.toISOString(),
        usedEditMin: client.usedEditMin + 1,
        monthlyEditMin: client.monthlyEditMin,
      },
    });
  } catch (error) {
    console.error("Ticket submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}