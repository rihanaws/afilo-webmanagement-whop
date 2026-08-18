import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface ExperiencePageProps {
  params: Promise<{ experienceId: string }>;
}

const EXPERIENCE_STEPS = [
  { id: 1, title: "Business Info", description: "Tell us about your business" },
  { id: 2, title: "Brand Identity", description: "Choose your colors and style" },
  { id: 3, title: "Content", description: "Add your headline and copy" },
  { id: 4, title: "Services", description: "List your services" },
  { id: 5, title: "Social Proof", description: "Add reviews and testimonials" },
  { id: 6, title: "Contact", description: "Set up your contact info" },
  { id: 7, title: "Preview", description: "Review your generated site" },
  { id: 8, title: "Launch", description: "Go live or share preview" },
];

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { experienceId } = await params;

  const website = await prisma.website.findUnique({
    where: { slug: experienceId },
    include: {
      client: {
        select: {
          businessName: true,
          email: true,
          plan: true,
        },
      },
    },
  });

  if (!website) {
    notFound();
  }

  const config = website.configJson as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Badge variant="primary" className="mb-2">
            Assessment Wizard
          </Badge>
          <h1 className="text-3xl font-bold text-foreground">
            {website.client.businessName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete the 8-step wizard to generate your website preview
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXPERIENCE_STEPS.map((step) => (
            <Card key={step.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {step.id}
                  </span>
                  <CardTitle className="text-sm">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Website Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Slug:</span>
                <span className="ml-2 text-foreground">{website.slug}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Niche:</span>
                <span className="ml-2 text-foreground">{website.niche}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Speed Score:</span>
                <span className="ml-2 text-foreground">{website.speedScore}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={website.isLive ? "success" : "default"} className="ml-2">
                  {website.isLive ? "Live" : "Preview"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
