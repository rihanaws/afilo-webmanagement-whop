import { prisma } from "@/lib/prisma";

export async function fetchClientPortalData(clientId: string) {
  const [client, leads] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        websites: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.leadCapture.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  if (!client) return null;

  const website = client.websites[0] ?? null;

  return {
    client: {
      id: client.id,
      businessName: client.businessName,
      plan: client.plan,
      status: client.status,
      contactPhone: client.contactPhone,
      domainName: client.domainName,
      monthlyEditMin: client.monthlyEditMin,
      usedEditMin: client.usedEditMin,
    },
    website: website
      ? {
          slug: website.slug,
          previewUrl: website.previewUrl,
          productionUrl: website.productionUrl,
          speedScore: website.speedScore,
          isLive: website.isLive,
          configJson: website.configJson as Record<string, unknown>,
        }
      : null,
    leads: leads.map((lead) => ({
      id: lead.id,
      customerName: lead.customerName,
      customerPhone: lead.customerPhone,
      serviceType: lead.serviceType,
      smsSent: lead.smsSent,
      createdAt: lead.createdAt.toISOString(),
    })),
  };
}

export async function findClientByWhopUserId(whopUserId: string) {
  return prisma.client.findUnique({ where: { whopUserId } });
}

export async function resolveClientByCompanyId(companyId: string) {
  const byId = await prisma.client.findUnique({ where: { id: companyId } });
  if (byId) return byId;

  const byWhopUser = await prisma.client.findUnique({ where: { whopUserId: companyId } });
  if (byWhopUser) return byWhopUser;

  const bySlug = await prisma.website.findUnique({
    where: { slug: companyId },
    include: { client: true },
  });
  if (bySlug) return bySlug.client;

  return null;
}