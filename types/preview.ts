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
  id: string;
  api_version: "v1";
  data: WhopMembershipEventData;
  timestamp: string;
  type: "membership.activated" | "membership.deactivated" | "membership.cancel_at_period_end_changed";
  company_id?: string | null;
}

export interface WhopMembershipEventData {
  id: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  status: "active" | "trialing" | "past_due" | "canceled" | "expired" | "completed";
  user: {
    id: string;
    username: string | null;
    email: string | null;
  } | null;
  plan: {
    id: string;
    title: string;
  } | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type NicheCategory =
  | "SaaS / Tech / AI"
  | "Trading / Finance"
  | "Reselling"
  | "Coaching / Agency"
  | "Sports Betting"
  | "Gaming / Other";

export type PrimaryGoal =
  | "Increase Revenue"
  | "Reduce Churn"
  | "Boost Engagement"
  | "Automate Operations"
  | "Build a Custom Tool"
  | "Launch a SaaS";

export interface FunnelState {
  communityName: string;
  niche: NicheCategory;
  memberCount: number;
  pricePerMonth: number;
  primaryGoal: PrimaryGoal;
  appIdea: string;
  launchTimeline: "ASAP / within 1 week" | "Within a month" | "2 months+";
  selectedBlueprintId?: "option_a" | "option_b" | "option_c";
}

export interface BlueprintOption {
  id: "option_a" | "option_b" | "option_c";
  badge: string;
  title: string;
  tagline: string;
  features: string[];
  whyItFits: string;
}

export interface GenerateBlueprintResponse {
  success: boolean;
  churnMetrics: {
    annualLoss: number;
    monthlyLoss: number;
  };
  blueprints: BlueprintOption[];
  error?: string;
}
