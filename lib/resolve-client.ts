import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function resolveClientFromRequest(
  request: NextRequest,
  body: Record<string, unknown>
) {
  const whopUserId = request.headers.get("x-whop-user-id");
  const clientId = typeof body.clientId === "string" ? body.clientId : undefined;

  if (clientId) {
    return prisma.client.findUnique({ where: { id: clientId } });
  }

  if (whopUserId) {
    return prisma.client.findUnique({ where: { whopUserId } });
  }

  return null;
}