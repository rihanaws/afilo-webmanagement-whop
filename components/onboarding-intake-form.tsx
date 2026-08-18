"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OnboardingIntakeFormProps {
  onSubmit?: (data: IntakeFormData) => void;
}

export interface IntakeFormData {
  businessName: string;
  domain: string;
  contactPhone: string;
  niche: string;
}

const NICHE_OPTIONS = [
  { value: "contractor", label: "Contractor (HVAC, Plumbing, Electric)" },
  { value: "clinic", label: "Dental / Medical Clinic" },
  { value: "salon", label: "Salon / Spa" },
  { value: "restaurant", label: "Restaurant" },
] as const;

export function OnboardingIntakeForm({ onSubmit }: OnboardingIntakeFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>({
    businessName: "",
    domain: "",
    contactPhone: "",
    niche: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onSubmit?.(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof IntakeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Business Intake</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Business Name"
            placeholder="Austin Apex Plumbing"
            value={formData.businessName}
            onChange={(e) => updateField("businessName", e.target.value)}
            required
          />
          <Input
            label="Domain"
            placeholder="austinapexplumbing.com"
            value={formData.domain}
            onChange={(e) => updateField("domain", e.target.value)}
          />
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+1 (512) 555-0123"
            value={formData.contactPhone}
            onChange={(e) => updateField("contactPhone", e.target.value)}
            required
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Business Type
            </label>
            <select
              value={formData.niche}
              onChange={(e) => updateField("niche", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              required
            >
              <option value="">Select a type</option>
              {NICHE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Generate Preview"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
