import { notFound } from "next/navigation";
import { WhopWizardEngine } from "@/components/whop-wizard";

export const dynamic = "force-dynamic";

interface ExperiencePageProps {
  params: Promise<{ experienceId: string }>;
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { experienceId } = await params;

  if (!experienceId || experienceId.length < 1) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0c0d0e]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Build Your Custom App
          </h1>
          <p className="mt-3 text-base text-[#a1a1aa]">
            Answer a few questions and we&apos;ll generate 3 tailored blueprints
            for your community.
          </p>
        </div>

        <WhopWizardEngine experienceId={experienceId} />
      </div>
    </div>
  );
}
