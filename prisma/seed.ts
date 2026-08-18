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

  console.log("Seed successful!");
  console.log({ clientId: client.id, websiteSlug: website.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
