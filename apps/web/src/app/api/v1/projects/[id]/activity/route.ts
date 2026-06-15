import { NextRequest } from "next/server";
import { prisma } from "@bidconnect/db";
import {
  apiResponse,
  apiError,
  parseSearchParams,
  paginationMeta,
  withAuth,
} from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

// ─────────────────────────────────────────
// GET /api/v1/projects/[id]/activity
// ─────────────────────────────────────────

export const GET = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;
    const url = new URL(req.url);
    const { page, limit, skip } = parseSearchParams(url, {
      sort: "timestamp",
      order: "desc",
      limit: 30,
    });
    // Verify project exists and belongs to org
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    // Optional action filter
    const actionFilter = url.searchParams.get("action");

    const where: Record<string, unknown> = {
      projectId: id,
      organizationId: user.organizationId,
    };

    if (actionFilter) {
      const actions = actionFilter.split(",");
      where.action = { in: actions };
    }
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return apiResponse(logs, 200, paginationMeta(total, page, limit));
  },
);