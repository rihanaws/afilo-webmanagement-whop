import { prisma } from "@/lib/prisma";
import { DashboardPortal } from "@/components/dashboard-portal";
import { fetchClientPortalData, findClientByWhopUserId } from "@/lib/portal-data";

export const dynamic = "force-dynamic";

const FALLBACK_WHOP_USER_ID = "user_test_123";

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof fetchClientPortalData>> | null = null;

  try {
    const whopUserId =
      process.env.NODE_ENV === "development"
        ? FALLBACK_WHOP_USER_ID
        : process.env.WHOP_DEMO_USER_ID;

    const client = whopUserId ? await findClientByWhopUserId(whopUserId) : null;
    if (client) {
      data = await fetchClientPortalData(client.id);
    }
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
  }

  if (!data) {
    try {
      const fallback = await prisma.client.findFirst({ orderBy: { createdAt: "asc" } });
      if (fallback) {
        data = await fetchClientPortalData(fallback.id);
      }
    } catch (error) {
      console.error("Dashboard fallback fetch error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {data ? (
          <DashboardPortal client={data.client} website={data.website} leads={data.leads} />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h1 className="text-xl font-semibold text-foreground">No client found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seed the database with <code className="text-primary">bun run db:seed</code> to
              activate the demo portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}