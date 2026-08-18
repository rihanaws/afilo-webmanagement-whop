export interface PreviewConfig {
  slug: string;
  businessName: string;
  niche: "contractor" | "clinic" | "salon" | "restaurant";
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email?: string;
  address?: string;
  heroHeadline: string;
  heroSubheadline: string;
  services: Array<{
    name: string;
    description: string;
    icon?: string;
  }>;
  reviews: Array<{
    author: string;
    rating: number;
    text: string;
  }>;
  ctaText: string;
  ctaUrl: string;
}

export interface LeadIngestionPayload {
  clientSlug: string;
  customerName: string;
  customerPhone: string;
  serviceType?: string;
}

export interface WhopWebhookEvent {
  event: string;
  data: {
    membership_id: string;
    user_id: string;
    status: "active" | "canceled" | "past_due";
    plan_id: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
