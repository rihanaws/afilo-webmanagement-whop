import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAdminData() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: { select: { leads: true, tickets: true } },
        websites: { select: { slug: true, isLive: true, speedScore: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLeads = clients.reduce((acc, c) => acc + c._count.leads, 0);
    const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
    const openTickets = clients.reduce((acc, c) => acc + c._count.tickets, 0);

    return {
      stats: {
        totalClients: clients.length,
        activeClients,
        totalLeads,
        openTickets,
      },
      clients: clients.slice(0, 10).map((c) => ({
        id: c.id,
        businessName: c.businessName,
        status: c.status,
        plan: c.plan,
        websites: c.websites,
        leadCount: c._count.leads,
      })),
    };
  } catch (error) {
    console.error("Admin dashboard data fetch error:", error);
    return {
      stats: { totalClients: 0, activeClients: 0, totalLeads: 0, openTickets: 0 },
      clients: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const { stats, clients } = await getAdminData();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Portal</h1>
          <p className="text-muted-foreground mt-1">
            Manage your websites, leads, and support tickets
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalClients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.activeClients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.openTickets}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No clients found. Clients will appear here once they sign up.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        Business
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        Plan
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        Website
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        Speed
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        Leads
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-2">
                          <Link
                            href={`/dashboard/${client.id}`}
                            className="text-foreground font-medium hover:text-primary"
                          >
                            {client.businessName}
                          </Link>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={
                              client.status === "ACTIVE"
                                ? "success"
                                : client.status === "PAST_DUE"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {client.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {client.plan.replace("_", " ")}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {client.websites[0]?.slug || "—"}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {client.websites[0]?.speedScore || "—"}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {client.leadCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}