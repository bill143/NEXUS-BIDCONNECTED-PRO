import { NextRequest } from "next/server";
import { prisma } from "@bidconnect/db";
import { apiResponse, apiError, withAuth } from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

// ─────────────────────────────────────────
// PATCH /api/v1/notifications/[id]/read
// ─────────────────────────────────────────

export const PATCH = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    // Find the notification — must belong to current user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!notification) {
      return apiError("Notification not found", 404);
    }

    if (notification.isRead) {      // Already read — return current state without updating
      return apiResponse(notification);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
      },
    });

    return apiResponse(updated);
  },
);
