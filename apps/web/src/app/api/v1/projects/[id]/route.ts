import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@bidconnect/db";
import { apiResponse, apiError, withAuth } from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth-helpers";

// ─────────────────────────────────────────
// Validation schema for PATCH
// ─────────────────────────────────────────

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  number: z.string().max(50).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
  projectType: z
    .enum(["GENERAL_CONTRACTING", "CM_AT_RISK", "DESIGN_BUILD", "OWNER_CONTROLLED", "OTHER"])
    .optional(),
  estimatedValue: z.number().nonnegative().optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  country: z.string().max(2).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),  clientName: z.string().max(255).optional().nullable(),
  bidsDueAt: z.string().datetime().optional().nullable(),
  bidsDueTimezone: z.string().optional(),
  dueToClientAt: z.string().datetime().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  leadUserId: z.string().cuid().optional(),
  officeId: z.string().cuid().optional().nullable(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]).optional(),
  csiDivisions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  bidFormTemplateId: z.string().cuid().optional().nullable(),
  isMuted: z.boolean().optional(),
});

// ─────────────────────────────────────────
// GET /api/v1/projects/[id]
// ─────────────────────────────────────────

export const GET = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    const project = await prisma.project.findFirst({
      where: {        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            title: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        office: {
          select: {
            id: true,
            name: true,
            city: true,            state: true,
          },
        },
        bidPackages: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            csiDivisionCode: true,
            csiDivisionName: true,
            status: true,
            budgetAmount: true,
            bidsDueAt: true,
            invitedCount: true,
            respondedCount: true,
            submittedCount: true,
            _count: {
              select: {
                invitations: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,                email: true,
                avatarUrl: true,
                title: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            bidPackages: true,
            documents: true,
            members: true,
            comments: true,
            activityLogs: true,
          },
        },
      },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    // Fetch analytics snapshot separately (optional relation)
    const analyticsSnapshot = await prisma.projectAnalyticsSnapshot.findUnique({
      where: { projectId: id },
    });
    return apiResponse({
      ...project,
      analyticsSnapshot,
    });
  },
);

// ─────────────────────────────────────────
// PATCH /api/v1/projects/[id]
// ─────────────────────────────────────────

export const PATCH = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    // Verify project exists and belongs to org
    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return apiError("Project not found", 404);
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const result = updateProjectSchema.safeParse(body);
    if (!result.success) {
      return apiError("Validation failed", 422, result.error.flatten().fieldErrors);
    }

    const data = result.data;

    // Validate lead user if being changed
    if (data.leadUserId) {
      const leadUser = await prisma.user.findFirst({
        where: { id: data.leadUserId, organizationId: user.organizationId },
        select: { id: true },
      });
      if (!leadUser) {
        return apiError("Lead user not found in your organization", 400);
      }
    }

    // Validate office if being changed
    if (data.officeId) {
      const office = await prisma.office.findFirst({        where: { id: data.officeId, organizationId: user.organizationId },
        select: { id: true },
      });
      if (!office) {
        return apiError("Office not found in your organization", 400);
      }
    }

    // Build update payload — only include fields that were explicitly provided
    const updateData: Record<string, unknown> = {};
    const changedFields: Record<string, { from: unknown; to: unknown }> = {};

    const scalarFields = [
      "name",
      "number",
      "status",
      "projectType",
      "estimatedValue",
      "description",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zip",
      "country",
      "latitude",
      "longitude",
      "clientName",
      "bidsDueTimezone",      "leadUserId",
      "officeId",
      "visibility",
      "bidFormTemplateId",
      "isMuted",
    ] as const;

    for (const field of scalarFields) {
      if (field in data) {
        const newValue = data[field as keyof typeof data];
        const oldValue = existing[field as keyof typeof existing];
        if (newValue !== oldValue) {
          updateData[field] = newValue;
          changedFields[field] = { from: oldValue, to: newValue };
        }
      }
    }

    // Handle date fields that need conversion
    const dateFields = ["bidsDueAt", "dueToClientAt", "startDate", "endDate"] as const;
    for (const field of dateFields) {
      if (field in data) {
        const rawValue = data[field as keyof typeof data] as string | null | undefined;
        const newValue = rawValue ? new Date(rawValue) : null;
        const oldValue = existing[field as keyof typeof existing];
        updateData[field] = newValue;
        changedFields[field] = {
          from: oldValue ? (oldValue as Date).toISOString() : null,
          to: rawValue ?? null,        };
      }
    }

    // Handle array fields
    const arrayFields = ["csiDivisions", "tags"] as const;
    for (const field of arrayFields) {
      if (field in data) {
        const newValue = data[field as keyof typeof data];
        updateData[field] = newValue;
        changedFields[field] = {
          from: existing[field as keyof typeof existing],
          to: newValue,
        };
      }
    }

    if (Object.keys(updateData).length === 0) {
      return apiError("No changes provided", 400);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,            email: true,
            avatarUrl: true,
          },
        },
        office: { select: { id: true, name: true } },
      },
    });

    // Determine the specific action based on what changed
    let action: "PROJECT_UPDATED" | "PROJECT_CLOSED" | "PROJECT_ARCHIVED" | "PROJECT_SETTINGS_CHANGED" =
      "PROJECT_UPDATED";
    if (changedFields.status) {
      if (changedFields.status.to === "CLOSED") action = "PROJECT_CLOSED";
      else if (changedFields.status.to === "ARCHIVED") action = "PROJECT_ARCHIVED";
    }

    // Log the update
    await prisma.activityLog.create({
      data: {
        organizationId: user.organizationId,
        projectId: id,
        entityType: "project",
        entityId: id,
        action,
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        actorEmail: user.email,
        metadata: { changedFields },      },
    });

    return apiResponse(updatedProject);
  },
);

// ─────────────────────────────────────────
// DELETE /api/v1/projects/[id]
// Soft-delete: sets status to ARCHIVED and records deletedAt
// Restricted to ORG_ADMIN, SUPER_ADMIN, PROJECT_MANAGER
// ─────────────────────────────────────────

export const DELETE = withAuth(
  async (
    _req: NextRequest,
    ctx: { params: Record<string, string> },
    user: AuthenticatedUser,
  ) => {
    const { id } = ctx.params;

    // Role check — only admin or manager can archive/delete
    const allowedRoles = ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"];
    if (!allowedRoles.includes(user.role)) {
      return apiError(
        "Insufficient permissions. Only admins and project managers can delete projects.",
        403,
      );
    }
    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return apiError("Project not found", 404);
    }

    const archivedProject = await prisma.project.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        organizationId: user.organizationId,
        projectId: id,
        entityType: "project",
        entityId: id,
        action: "PROJECT_ARCHIVED",
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,        actorEmail: user.email,
        metadata: {
          previousStatus: existing.status,
          projectName: existing.name,
        },
      },
    });

    return apiResponse({ id: archivedProject.id, status: archivedProject.status });
  },
);
