"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditTicketModalProps {
  clientId: string;
  usedEditMin: number;
  monthlyEditMin: number;
}

const CATEGORIES = ["Text Change", "Pricing Update", "Image Swap", "Other"] as const;

type Category = (typeof CATEGORIES)[number];

interface SubmitResult {
  success: boolean;
  error?: string;
}

export function EditTicketModal({ clientId, usedEditMin, monthlyEditMin }: EditTicketModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Text Change");
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const remaining = monthlyEditMin - usedEditMin;
  const canSubmit = remaining > 0;

  const resetForm = () => {
    setTitle("");
    setCategory("Text Change");
    setDescription("");
    setUrgent(false);
    setResult(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, title, category, description, urgent }),
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
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(true)}
        disabled={!canSubmit}
      >
        Request a Change
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#232529] bg-[#141517] p-6 shadow-xl">
            <div className="flex items-start justify-between pb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground leading-none tracking-tight">
                  Request a Change
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Under your monthly edit allowance (48-hour SLA)
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-muted-foreground hover:bg-border/50 hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <span className="text-sm text-muted-foreground">Monthly SLA minutes</span>
              <span
                className={`text-sm font-semibold ${
                  remaining > 0 ? "text-success" : "text-error"
                }`}
              >
                {remaining} / {monthlyEditMin} mins available
              </span>
            </div>

            {canSubmit ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Ticket Title"
                  placeholder="Update pricing on services page"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setResult(null);
                  }}
                  required
                  minLength={3}
                />

                <div className="w-full">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                          category === cat
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-[#232529] bg-surface text-muted-foreground hover:bg-border/50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Description"
                  placeholder="Describe the exact change you need..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setResult(null);
                  }}
                  required
                  minLength={10}
                />

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={urgent}
                    onChange={(e) => setUrgent(e.target.checked)}
                    className="h-4 w-4 rounded border-[#232529] bg-surface accent-[#ea580c]"
                  />
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-warning" />
                    Mark as urgent
                  </span>
                </label>

                {result?.success && (
                  <p className="text-xs text-success">
                    Change request submitted. Our team will action it within 48 business hours.
                  </p>
                )}
                {result && !result.success && (
                  <p className="text-xs text-error">{result.error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  You have used all {monthlyEditMin} minutes of your monthly SLA allowance.
                  New requests will be available next month.
                </p>
                <div className="flex justify-end pt-4">
                  <Button type="button" variant="ghost" onClick={closeModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}