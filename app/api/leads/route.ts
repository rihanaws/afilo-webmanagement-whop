import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTwilioClientOrThrow } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const clientSlug = body.clientSlug || body.slug;
    const customerName = body.customerName || body.name;
    const customerPhone = body.customerPhone || body.phone;
    const serviceType = body.serviceType || body.service || "General Inquiry";

    if (!clientSlug || !customerName || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: clientSlug (or slug), customerName (or name), customerPhone (or phone)",
        },
        { status: 400 }
      );
    }

    const website = await prisma.website.findUnique({
      where: { slug: clientSlug },
      include: { client: true },
    });

    if (!website) {
      return NextResponse.json(
        { success: false, error: `Website with slug '${clientSlug}' not found` },
        { status: 404 }
      );
    }

    if (website.client.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Client subscription is not active" },
        { status: 403 }
      );
    }

    const lead = await prisma.leadCapture.create({
      data: {
        clientId: website.clientId,
        customerName,
        customerPhone,
        serviceType,
        smsSent: false,
      },
    });

    let smsSent = false;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioPhoneNumber && website.client.contactPhone) {
      try {
        const twilioClient = getTwilioClientOrThrow();
        await twilioClient.messages.create({
          body: `New Lead for ${website.client.businessName}!\nName: ${customerName}\nPhone: ${customerPhone}\nService: ${serviceType}\nTap to call back immediately.`,
          from: twilioPhoneNumber,
          to: website.client.contactPhone,
        });
        smsSent = true;

        await prisma.leadCapture.update({
          where: { id: lead.id },
          data: { smsSent: true },
        });
      } catch (smsError) {
        console.error("Twilio SMS dispatch failed:", smsError);
      }
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      smsDispatched: smsSent,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
