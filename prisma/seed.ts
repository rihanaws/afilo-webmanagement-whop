import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding test client and website...");

  const client = await prisma.client.upsert({
    where: { whopUserId: "user_test_123" },
    update: {},
    create: {
      whopUserId: "user_test_123",
      email: "test@afilo.io",
      businessName: "Austin Apex Plumbing",
      contactPhone: "+15125550199",
      domainName: "austinapexplumbing.com",
      plan: "CORE_RETAINER",
      status: "ACTIVE",
    },
  });

  const website = await prisma.website.upsert({
    where: { slug: "austin-apex-plumbing" },
    update: {},
    create: {
      clientId: client.id,
      slug: "austin-apex-plumbing",
      previewUrl: "https://preview.afilo.io/austin-apex-plumbing",
      niche: "contractor",
      configJson: {
        headline: "Austin's #1 Emergency Plumbing",
        rating: 4.9,
      },
      isLive: false,
    },
  });

  const existingLeads = await prisma.leadCapture.count({
    where: { clientId: client.id },
  });

  if (existingLeads === 0) {
    await prisma.leadCapture.createMany({
      data: [
        {
          clientId: client.id,
          customerName: "John Miller",
          customerPhone: "+15125550199",
          serviceType: "Emergency Drain Cleaning",
          leadType: "INQUIRY",
          smsSent: true,
        },
        {
          clientId: client.id,
          customerName: "Sarah Kim",
          customerPhone: "+17325550144",
          serviceType: "Water Heater Replacement",
          leadType: "INQUIRY",
          smsSent: false,
        },
        {
          clientId: client.id,
          customerName: "Apex Traders (Whop Queue)",
          customerPhone: "whop_lead",
          serviceType: "whop-queue:Trading / Finance:Increase Revenue",
          leadType: "WAITLIST",
          smsSent: false,
        },
      ],
    });
  }

  console.log("Seed successful!");
  console.log({
    clientId: client.id,
    websiteSlug: website.slug,
    leadCount: existingLeads,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
