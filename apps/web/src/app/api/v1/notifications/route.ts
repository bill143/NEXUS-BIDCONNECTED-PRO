import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@bidconnect/db";
import type { Prisma } from "@bidconnect/db";
import {
  apiResponse,
  apiError,
  parseSearchParams,
  paginationMeta,
  withAuth,
} from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

// ─────────────────────────────────────────
// Validation schema for POST actions
// ─────────────────────────────────────────

const notificationActionSchema = z.object({
  action: z.enum(["read-all"]),
});

// ─────────────────────────────────────────
// GET /api/v1/notifications
// ─────────────────────────────────────────

export const GET = withAuth(
  async (req: NextRequest, _ctx, user: AuthenticatedUser) => {
    const url = new URL(req.url);
    const { page, limit, skip } = parseSearchParams(url, {      sort: "createdAt",
      order: "desc",
      limit: 20,
    });

    const isRead = url.searchParams.get("isRead");
    const type = url.searchParams.get("type");

    const where: Prisma.NotificationWhereInput = {
      userId: user.id,
    };

    // Filter by read status
    if (isRead === "true") {
      where.isRead = true;
    } else if (isRead === "false") {
      where.isRead = false;
    }

    // Filter by notification type
    if (type) {
      const types = type.split(",");
      where.type = { in: types as Prisma.EnumNotificationTypeFilter["in"] };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              number: true,
              status: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return apiResponse(notifications, 200, {
      ...paginationMeta(total, page, limit),
      unreadCount,
    });
  },
);

// ─────────────────────────────────────────
// POST /api/v1/notifications
// Supports action: "read-all" to mark all as read
// ─────────────────────────────────────────
export const POST = withAuth(
  async (req: NextRequest, _ctx, user: AuthenticatedUser) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const result = notificationActionSchema.safeParse(body);
    if (!result.success) {
      return apiError("Validation failed", 422, result.error.flatten().fieldErrors);
    }

    const { action } = result.data;

    if (action === "read-all") {
      const { count } = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return apiResponse({
        success: true,
        markedRead: count,
      });
    }

    return apiError("Unknown action", 400);
  },
);
