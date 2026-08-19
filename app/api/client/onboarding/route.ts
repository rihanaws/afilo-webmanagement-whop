import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveClientFromRequest } from "@/lib/resolve-client";
import type { ApiResponse } from "@/types/preview";

interface OnboardingPayload {
  businessName?: string;
  domain?: string;
  registrar?: string;
  contactPhone?: string;
  primaryColor?: string;
  stagingApproved?: boolean;
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = (await request.json()) as OnboardingPayload;

    if (body.primaryColor && !HEX_COLOR_PATTERN.test(body.primaryColor)) {
      return NextResponse.json(
        { success: false, error: "primaryColor must be a valid hex color (e.g. #ea580c)" },
        { status: 400 }
      );
    }

    if (body.contactPhone && !PHONE_PATTERN.test(body.contactPhone)) {
      return NextResponse.json(
        { success: false, error: "contactPhone must include a country code (e.g. +15125550199)" },
        { status: 400 }
      );
    }

    if (body.domain && !body.domain.includes(".")) {
      return NextResponse.json(
        { success: false, error: "domain must be a valid website domain (e.g. austinapexplumbing.com)" },
        { status: 400 }
      );
    }

    const client = await resolveClientFromRequest(request, body as Record<string, unknown>);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found. Provide clientId in the body or x-whop-user-id header." },
        { status: 404 }
      );
    }

    await prisma.client.update({
      where: { id: client.id },
      data: {
        businessName: body.businessName ?? client.businessName,
        domainName: body.domain ?? client.domainName,
        contactPhone: body.contactPhone ?? client.contactPhone,
      },
    });

    const website = await prisma.website.findFirst({
      where: { clientId: client.id },
      orderBy: { createdAt: "asc" },
    });

    if (website) {
      const existingConfig = (website.configJson ?? {}) as Record<string, unknown>;
      const nextConfig = {
        ...existingConfig,
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.registrar !== undefined && { domainRegistrar: body.registrar }),
        ...(body.stagingApproved !== undefined && { stagingApproved: body.stagingApproved }),
      };

      await prisma.website.update({
        where: { id: website.id },
        data: { configJson: nextConfig },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        clientId: client.id,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}