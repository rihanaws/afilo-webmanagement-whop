"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string | null;
  smsSent: boolean;
  createdAt: string;
}

interface LeadActivityTableProps {
  leads: Lead[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

function isThisMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function LeadActivityTable({ leads }: LeadActivityTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "dispatched" | "pending">("all");

  const stats = useMemo(() => {
    const monthLeads = leads.filter((lead) => isThisMonth(lead.createdAt));
    const smsSent = monthLeads.filter((lead) => lead.smsSent).length;
    const conversionRate =
      monthLeads.length > 0 ? Math.round((smsSent / monthLeads.length) * 100) : 0;

    return { total: monthLeads.length, smsSent, conversionRate };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "dispatched" && lead.smsSent) ||
        (statusFilter === "pending" && !lead.smsSent);

      if (!matchesStatus) return false;

      if (!query) return true;

      return (
        lead.customerName.toLowerCase().includes(query) ||
        lead.customerPhone.includes(query) ||
        (lead.serviceType ?? "").toLowerCase().includes(query)
      );
    });
  }, [leads, searchQuery, statusFilter]);

  const statCard = (label: string, value: string | number) => (
    <div className="rounded-xl border border-[#232529] bg-[#141517] px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCard("Total Leads This Month", stats.total)}
        {statCard("SMS Alerts Sent", stats.smsSent)}
        {statCard("Conversion Rate", `${stats.conversionRate}%`)}
      </div>

      <div className="rounded-xl border border-[#232529] bg-[#141517] p-6 shadow-sm">
        <div className="flex flex-col space-y-1.5 pb-4">
          <h3 className="text-lg font-semibold text-foreground leading-none tracking-tight">
            Live Lead Activity
          </h3>
          <p className="text-sm text-muted-foreground">
            Customer inquiries and SMS dispatch status
          </p>
        </div>

        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, phone, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-[#232529] bg-surface pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "dispatched", "pending"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  statusFilter === value
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-[#232529] bg-surface text-muted-foreground hover:bg-border/50"
                }`}
              >
                {value === "all" ? "All" : value === "dispatched" ? "Dispatched" : "Pending"}
              </button>
            ))}
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {leads.length === 0
              ? "No leads captured yet. They will appear here as they come in."
              : "No leads match your search or filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Phone
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Service Requested
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    SMS Status
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-2 text-foreground">{lead.customerName}</td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {formatPhone(lead.customerPhone)}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {lead.serviceType || "—"}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={lead.smsSent ? "success" : "warning"}>
                        {lead.smsSent ? "Dispatched" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}