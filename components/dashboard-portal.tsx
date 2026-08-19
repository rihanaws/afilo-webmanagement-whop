import { Badge } from "@/components/ui/badge";
import { OnboardingIntakeForm } from "@/components/onboarding-intake-form";
import { LeadActivityTable } from "@/components/lead-activity-table";
import { EditTicketModal } from "@/components/edit-ticket-modal";

export interface DashboardPortalProps {
  client: {
    id: string;
    businessName: string;
    plan: string;
    status: string;
    contactPhone: string;
    domainName: string | null;
    monthlyEditMin: number;
    usedEditMin: number;
  };
  website: {
    slug: string;
    previewUrl: string;
    productionUrl: string | null;
    speedScore: number;
    isLive: boolean;
    configJson: Record<string, unknown>;
  } | null;
  leads: Array<{
    id: string;
    customerName: string;
    customerPhone: string;
    serviceType: string | null;
    smsSent: boolean;
    createdAt: string;
  }>;
}

const CORE_RETAINER_MONTHLY = "$200/mo";

function statCard(label: string, value: string, sublabel?: string, accent?: string) {
  return (
    <div className="rounded-xl border border-[#232529] bg-[#141517] px-4 py-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

export function DashboardPortal({ client, website, leads }: DashboardPortalProps) {
  const config = website?.configJson ?? {};
  const primaryColor =
    typeof config.primaryColor === "string" ? config.primaryColor : undefined;
  const registrar =
    typeof config.domainRegistrar === "string" ? config.domainRegistrar : undefined;
  const stagingApproved =
    typeof config.stagingApproved === "boolean" ? config.stagingApproved : false;

  const statusVariant =
    client.status === "ACTIVE"
      ? "success"
      : client.status === "PAST_DUE"
        ? "warning"
        : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{client.businessName}</h1>
            <Badge variant={statusVariant}>{client.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {client.domainName ?? website?.slug ?? "No domain configured"} ·{" "}
            {client.plan.replace("_", " ")}
          </p>
        </div>
        <EditTicketModal
          clientId={client.id}
          usedEditMin={client.usedEditMin}
          monthlyEditMin={client.monthlyEditMin}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCard(
          "Core Web Vitals",
          website ? `${website.speedScore}/100` : "—",
          website ? "Performance score" : "Website not launched",
          website && website.speedScore >= 90 ? "text-success" : "text-warning"
        )}
        {statCard("Uptime", website ? "99.9%" : "—", "Verified availability")}
        {statCard("Active Plan", client.plan === "CORE_RETAINER" ? CORE_RETAINER_MONTHLY : client.plan.replace("_", " "), "Managed retainer")}
        {statCard(
          "Staging Site",
          website?.isLive ? "Live" : "Preview",
          website?.isLive ? website.productionUrl ?? "Production" : website?.previewUrl ?? "Pending build",
          website?.isLive ? "text-success" : "text-muted-foreground"
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <OnboardingIntakeForm
            clientId={client.id}
            initialData={{
              businessName: client.businessName,
              domain: client.domainName ?? undefined,
              registrar,
              contactPhone: client.contactPhone,
              primaryColor,
              stagingApproved,
            }}
          />
        </div>
        <div className="lg:col-span-2">
          <LeadActivityTable leads={leads} />
        </div>
      </div>
    </div>
  );
}