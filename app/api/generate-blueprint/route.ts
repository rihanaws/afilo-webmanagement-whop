import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { PreviewConfig, ApiResponse } from "@/types/preview";

interface BlueprintRequest {
  businessName: string;
  niche: string;
  domain?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const NICHE_TEMPLATES: Record<
  string,
  {
    heroHeadline: string;
    heroSubheadline: string;
    services: PreviewConfig["services"];
    ctaText: string;
  }
> = {
  contractor: {
    heroHeadline: "Fast, Reliable [Service] You Can Trust",
    heroSubheadline:
      "Licensed and insured professionals serving your area. Call now for a free estimate.",
    services: [
      { name: "Emergency Repairs", description: "24/7 same-day service" },
      { name: "Maintenance Plans", description: "Preventative care programs" },
      { name: "Free Estimates", description: "No-obligation quotes" },
    ],
    ctaText: "Get a Free Quote",
  },
  clinic: {
    heroHeadline: "Your Smile, Our Priority",
    heroSubheadline:
      "Gentle, modern dental care for the whole family. New patients welcome.",
    services: [
      { name: "General Dentistry", description: "Cleanings, fillings, exams" },
      { name: "Cosmetic Services", description: "Whitening, veneers, implants" },
      { name: "Emergency Care", description: "Same-day appointments" },
    ],
    ctaText: "Book Appointment",
  },
  salon: {
    heroHeadline: "Look Amazing, Feel Confident",
    heroSubheadline:
      "Expert stylists and premium products. Walk-ins and appointments welcome.",
    services: [
      { name: "Hair Styling", description: "Cuts, color, treatments" },
      { name: "Nail Services", description: "Manicures, pedicures, gel" },
      { name: "Skin Care", description: "Facials, waxing, treatments" },
    ],
    ctaText: "Book Now",
  },
  restaurant: {
    heroHeadline: "Fresh, Delicious, Unforgettable",
    heroSubheadline:
      "Farm-to-table flavors crafted with passion. Dine in or order online.",
    services: [
      { name: "Dine-In", description: "Elegant atmosphere" },
      { name: "Takeout", description: "Quick online ordering" },
      { name: "Catering", description: "Events of any size" },
    ],
    ctaText: "View Menu",
  },
};

function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PreviewConfig>>> {
  try {
    const body = await request.json();
    const { businessName, niche, domain, phone, email, address } =
      body as BlueprintRequest;

    if (!businessName || !niche) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: businessName, niche" },
        { status: 400 }
      );
    }

    const template = NICHE_TEMPLATES[niche];
    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid niche: ${niche}. Must be one of: ${Object.keys(NICHE_TEMPLATES).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const slug = generateSlug(businessName);

    const blueprint: PreviewConfig = {
      slug,
      businessName,
      niche: niche as PreviewConfig["niche"],
      primaryColor: "#ea580c",
      secondaryColor: "#f97316",
      phone: phone || "",
      email,
      address,
      heroHeadline: template.heroHeadline.replace("[Service]", niche),
      heroSubheadline: template.heroSubheadline,
      services: template.services,
      reviews: [
        {
          author: "Satisfied Customer",
          rating: 5,
          text: "Excellent service! Highly recommend to anyone looking for quality work.",
        },
      ],
      ctaText: template.ctaText,
      ctaUrl: domain ? `https://${domain}` : `https://preview.afilo.io/${slug}`,
    };

    return NextResponse.json({
      success: true,
      data: blueprint,
    });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
