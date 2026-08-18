"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function LeadActivityTable({ leads }: LeadActivityTableProps) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No leads captured yet. They will appear here as they come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  Service
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  SMS
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3 px-2 text-foreground">{lead.customerName}</td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {formatPhone(lead.customerPhone)}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {lead.serviceType || "—"}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={lead.smsSent ? "success" : "warning"}>
                      {lead.smsSent ? "Sent" : "Pending"}
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
      </CardContent>
    </Card>
  );
}
