import { notFound } from "next/navigation";
import { DashboardPortal } from "@/components/dashboard-portal";
import { fetchClientPortalData, resolveClientByCompanyId } from "@/lib/portal-data";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  const client = await resolveClientByCompanyId(companyId);
  if (!client) notFound();

  const data = await fetchClientPortalData(client.id);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardPortal client={data.client} website={data.website} leads={data.leads} />
      </div>
    </div>
  );
}