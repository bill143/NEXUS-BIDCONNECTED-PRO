import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@bidconnect/db";
import { apiResponse, apiError, withAuth } from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

// ─────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────

const addMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z
    .enum(["manager", "estimator", "coordinator", "viewer"])
    .default("member"),
  _method: z.string().optional(), // For method override (DELETE via POST)
});

const removeMemberSchema = z.object({
  _method: z.literal("DELETE"),
  userId: z.string().cuid("Invalid user ID"),
});

// ─────────────────────────────────────────
// GET /api/v1/projects/[id]/members
// ─────────────────────────────────────────

export const GET = withAuth(
  async (
    _req: NextRequest,    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    // Verify project exists and belongs to org
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      select: { id: true, leadUserId: true },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    const members = await prisma.projectMembership.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,            title: true,
            role: true,
            officeId: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Annotate whether each member is the project lead
    const membersWithLeadFlag = members.map((m) => ({
      ...m,
      isProjectLead: m.userId === project.leadUserId,
    }));

    return apiResponse(membersWithLeadFlag);
  },
);

// ─────────────────────────────────────────
// POST /api/v1/projects/[id]/members
// Handles both adding and removing members
// (via _method=DELETE override for DELETE operations)
// ─────────────────────────────────────────

export const POST = withAuth(
  async (
    req: NextRequest,    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    // Verify project exists and belongs to org
    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
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

    // Check if this is a DELETE operation via method override
    const rawBody = body as Record<string, unknown>;
    if (rawBody._method === "DELETE") {      return handleRemoveMember(id, body, user);
    }

    return handleAddMember(id, body, user, project);
  },
);

// ─────────────────────────────────────────
// DELETE /api/v1/projects/[id]/members
// ─────────────────────────────────────────

export const DELETE = withAuth(
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
        organizationId: user.organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!project) {
      return apiError("Project not found", 404);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      // Try to get userId from URL params for simpler clients
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");
      if (!userId) {
        return apiError("User ID is required", 400);
      }
      body = { _method: "DELETE", userId };
    }

    return handleRemoveMember(id, body, user);
  },
);

// ─────────────────────────────────────────
// Internal handlers
// ─────────────────────────────────────────

async function handleAddMember(
  projectId: string,
  body: unknown,
  user: AuthenticatedUser,  project: { id: string; name: string; number: string | null },
) {
  const result = addMemberSchema.safeParse(body);
  if (!result.success) {
    return apiError("Validation failed", 422, result.error.flatten().fieldErrors);
  }

  const { userId, role } = result.data;

  // Verify user belongs to same organization
  const targetUser = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId: user.organizationId,
      isActive: true,
    },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  if (!targetUser) {
    return apiError("User not found in your organization", 400);
  }

  // Check for existing membership
  const existingMembership = await prisma.projectMembership.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });
  if (existingMembership) {
    return apiError("User is already a member of this project", 409);
  }

  const membership = await prisma.projectMembership.create({
    data: {
      projectId,
      userId,
      role,
      addedBy: user.id,
    },
    include: {
      user: {
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

  // Create activity log
  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,      projectId,
      entityType: "project_membership",
      entityId: membership.id,
      action: "TEAM_MEMBER_ADDED",
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorEmail: user.email,
      metadata: {
        addedUserId: userId,
        addedUserName: `${targetUser.firstName} ${targetUser.lastName}`,
        addedUserEmail: targetUser.email,
        projectRole: role,
      },
    },
  });

  // Create notification for the added user
  if (userId !== user.id) {
    await prisma.notification.create({
      data: {
        userId,
        projectId,
        type: "TEAM_MEMBER_ADDED",
        title: "Added to project team",
        message: `${user.firstName} ${user.lastName} added you to ${project.name}`,
        entityType: "project",
        entityId: projectId,
        deepLinkUrl: `/projects/${projectId}`,        metadata: {
          projectNumber: project.number,
          addedByName: `${user.firstName} ${user.lastName}`,
          role,
        },
      },
    });
  }

  return apiResponse(membership, 201);
}

async function handleRemoveMember(
  projectId: string,
  body: unknown,
  user: AuthenticatedUser,
) {
  const result = removeMemberSchema.safeParse(body);
  if (!result.success) {
    return apiError("Validation failed", 422, result.error.flatten().fieldErrors);
  }

  const { userId } = result.data;

  // Find the membership
  const membership = await prisma.projectMembership.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!membership) {
    return apiError("User is not a member of this project", 404);
  }

  // Only allow admins, managers, or the user themselves to remove membership
  const canRemove =
    user.id === userId ||
    ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"].includes(user.role);
  if (!canRemove) {
    return apiError("Insufficient permissions to remove this member", 403);
  }

  await prisma.projectMembership.delete({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  // Log removal
  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      projectId,      entityType: "project_membership",
      entityId: membership.id,
      action: "TEAM_MEMBER_REMOVED",
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorEmail: user.email,
      metadata: {
        removedUserId: userId,
        removedUserName: `${membership.user.firstName} ${membership.user.lastName}`,
        removedUserEmail: membership.user.email,
      },
    },
  });

  return apiResponse({ success: true, removedUserId: userId });
}
