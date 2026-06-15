import { NextRequest } from "next/server";
import { z } from "zod";
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
// Validation schema
// ─────────────────────────────────────────

const createCommentSchema = z.object({
  body: z.string().min(1, "Comment body is required").max(10000),
  mentionedUserIds: z.array(z.string().cuid()).default([]),
  parentId: z.string().cuid().optional().nullable(),
});

// ─────────────────────────────────────────
// GET /api/v1/projects/[id]/comments
// ─────────────────────────────────────────

export const GET = withAuth(
  async (
    req: NextRequest,    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;
    const url = new URL(req.url);
    const { page, limit, skip } = parseSearchParams(url, {
      sort: "createdAt",
      order: "desc",
      limit: 25,
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

    const where = {
      projectId: id,
      parentId: null, // Only top-level comments
      deletedAt: null,
    };
    const authorSelect = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      title: true,
      role: true,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: authorSelect },
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: authorSelect },
              _count: {
                select: { replies: true },
              },
            },
          },          _count: {
            select: { replies: true },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return apiResponse(comments, 200, paginationMeta(total, page, limit));
  },
);

// ─────────────────────────────────────────
// POST /api/v1/projects/[id]/comments
// ─────────────────────────────────────────

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    // Verify project exists and belongs to org
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,        deletedAt: null,
      },
      select: { id: true, name: true, number: true },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const result = createCommentSchema.safeParse(body);
    if (!result.success) {
      return apiError("Validation failed", 422, result.error.flatten().fieldErrors);
    }

    const data = result.data;

    // Validate parentId if provided
    if (data.parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: data.parentId,
          projectId: id,          deletedAt: null,
        },
        select: { id: true },
      });
      if (!parentComment) {
        return apiError("Parent comment not found", 404);
      }
    }

    // Validate mentioned users belong to the same organization
    if (data.mentionedUserIds.length > 0) {
      const validUsers = await prisma.user.findMany({
        where: {
          id: { in: data.mentionedUserIds },
          organizationId: user.organizationId,
          isActive: true,
        },
        select: { id: true },
      });
      const validIds = new Set(validUsers.map((u) => u.id));
      const invalidIds = data.mentionedUserIds.filter((uid) => !validIds.has(uid));
      if (invalidIds.length > 0) {
        return apiError(
          `Some mentioned users are not in your organization: ${invalidIds.join(", ")}`,
          400,
        );
      }
    }
    const comment = await prisma.comment.create({
      data: {
        projectId: id,
        authorId: user.id,
        body: data.body,
        mentionedUserIds: data.mentionedUserIds,
        parentId: data.parentId ?? null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            title: true,
            role: true,
          },
        },
      },
    });

    // Create notifications for mentioned users
    if (data.mentionedUserIds.length > 0) {
      const mentionedNotifications = data.mentionedUserIds
        .filter((uid) => uid !== user.id) // Don't notify yourself
        .map((uid) => ({          userId: uid,
          projectId: id,
          type: "COMMENT_MENTION" as const,
          title: "You were mentioned in a comment",
          message: `${user.firstName} ${user.lastName} mentioned you in a comment on ${project.name}`,
          entityType: "comment",
          entityId: comment.id,
          deepLinkUrl: `/projects/${id}?tab=comments&comment=${comment.id}`,
          metadata: {
            commentId: comment.id,
            projectNumber: project.number,
            authorName: `${user.firstName} ${user.lastName}`,
          },
        }));

      if (mentionedNotifications.length > 0) {
        await prisma.notification.createMany({
          data: mentionedNotifications,
        });
      }
    }

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        organizationId: user.organizationId,
        projectId: id,
        entityType: "comment",
        entityId: comment.id,
        action: "COMMENT_POSTED",        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        actorEmail: user.email,
        metadata: {
          isReply: !!data.parentId,
          parentId: data.parentId ?? null,
          mentionedCount: data.mentionedUserIds.length,
        },
      },
    });

    return apiResponse(comment, 201);
  },
);
