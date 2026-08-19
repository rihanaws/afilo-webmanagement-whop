"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

interface OnboardingIntakeFormProps {
  clientId: string;
  initialData?: {
    businessName?: string;
    domain?: string;
    registrar?: string;
    contactPhone?: string;
    primaryColor?: string;
    stagingApproved?: boolean;
  };
}

interface SubmitResult {
  success: boolean;
  error?: string;
}

export function OnboardingIntakeForm({ clientId, initialData }: OnboardingIntakeFormProps) {
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName ?? "",
    domain: initialData?.domain ?? "",
    registrar: initialData?.registrar ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    primaryColor: initialData?.primaryColor ?? "#ea580c",
    stagingApproved: initialData?.stagingApproved ?? false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, ...formData }),
      });

      const json = (await response.json()) as SubmitResult;

      if (!response.ok || !json.success) {
        setResult({ success: false, error: json.error ?? "Submission failed. Please try again." });
        return;
      }

      setResult({ success: true });
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#232529] bg-[#141517] p-6 shadow-sm">
      <div className="flex flex-col space-y-1.5 pb-4">
        <h3 className="text-lg font-semibold text-foreground leading-none tracking-tight">
          Onboarding Intake
        </h3>
        <p className="text-sm text-muted-foreground">
          Registrar, phone routing, and brand configuration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Business Name"
          placeholder="Austin Apex Plumbing"
          value={formData.businessName}
          onChange={(e) => updateField("businessName", e.target.value)}
          required
        />
        <Input
          label="Website Domain"
          placeholder="austinapexplumbing.com"
          value={formData.domain}
          onChange={(e) => updateField("domain", e.target.value)}
        />
        <Input
          label="Domain Registrar"
          placeholder="GoDaddy, Namecheap, Google Domains"
          value={formData.registrar}
          onChange={(e) => updateField("registrar", e.target.value)}
        />
        <Input
          label="SMS Lead Notification Phone"
          type="tel"
          placeholder="+1 (512) 555-0199"
          value={formData.contactPhone}
          onChange={(e) => updateField("contactPhone", e.target.value)}
          required
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Preferred Primary Brand Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => updateField("primaryColor", e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-[#232529] bg-surface p-1"
              aria-label="Brand color picker"
            />
            <Input
              type="text"
              placeholder="#ea580c"
              value={formData.primaryColor}
              onChange={(e) => updateField("primaryColor", e.target.value)}
              pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.stagingApproved}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, stagingApproved: e.target.checked }));
              setResult(null);
            }}
            className="mt-0.5 h-4 w-4 rounded border-[#232529] bg-surface accent-[#ea580c]"
          />
          <span className="text-sm text-muted-foreground">
            I approve the staging site for launch to production
          </span>
        </label>

        {result?.success && (
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Onboarding details saved.
          </div>
        )}
        {result && !result.success && (
          <p className="text-xs text-error">{result.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Onboarding Details"}
        </Button>
      </form>
    </div>
  );
}