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
// Validation schemas
// ─────────────────────────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  number: z.string().max(50).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]).default("DRAFT"),
  projectType: z
    .enum(["GENERAL_CONTRACTING", "CM_AT_RISK", "DESIGN_BUILD", "OWNER_CONTROLLED", "OTHER"])
    .default("GENERAL_CONTRACTING"),
  estimatedValue: z.number().nonnegative().optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  country: z.string().max(2).default("US"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  clientName: z.string().max(255).optional().nullable(),
  bidsDueAt: z.string().datetime().optional().nullable(),
  bidsDueTimezone: z.string().default("America/Chicago"),
  dueToClientAt: z.string().datetime().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  leadUserId: z.string().cuid().optional(),
  officeId: z.string().cuid().optional().nullable(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]).default("PRIVATE"),
  csiDivisions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  bidFormTemplateId: z.string().cuid().optional().nullable(),
});

// ─────────────────────────────────────────
// GET /api/v1/projects
// ─────────────────────────────────────────

export const GET = withAuth(async (req: NextRequest, _ctx, user: AuthenticatedUser) => {
  const url = new URL(req.url);
  const { page, limit, skip, sort, order, search } = parseSearchParams(url, {
    sort: "createdAt",
    order: "desc",
  });
  const scope = url.searchParams.get("scope") ?? "company";
  const status = url.searchParams.get("status");
  const tag = url.searchParams.get("tag");
  const csi = url.searchParams.get("csi");
  const lead = url.searchParams.get("lead");

  // Build where clause
  const where: Prisma.ProjectWhereInput = {
    organizationId: user.organizationId,
    deletedAt: null,
  };

  // Scope filtering
  if (scope === "mine") {
    where.OR = [
      { leadUserId: user.id },
      { createdBy: user.id },
      { members: { some: { userId: user.id } } },
    ];
  } else if (scope === "office") {
    // Projects from the same office as the user
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { officeId: true },
    });
    if (userRecord?.officeId) {
      where.officeId = userRecord.officeId;
    }
  }
  // scope === "company" uses org-level filter already applied
  // Status filter
  if (status) {
    const validStatuses = ["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"] as const;
    const statusArr = status.split(",").filter((s): s is typeof validStatuses[number] =>
      (validStatuses as readonly string[]).includes(s.toUpperCase()),
    );
    if (statusArr.length === 1) {
      where.status = statusArr[0];
    } else if (statusArr.length > 1) {
      where.status = { in: statusArr };
    }
  }

  // Tag filter
  if (tag) {
    where.tags = { hasSome: tag.split(",") };
  }

  // CSI division filter
  if (csi) {
    where.csiDivisions = { hasSome: csi.split(",") };
  }

  // Lead filter
  if (lead) {
    where.leadUserId = lead;
  }
  // Search filter — searches name, number, clientName, description
  if (search) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { number: { contains: search, mode: "insensitive" } },
          { clientName: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  // Determine sort field — only allow safe columns
  const allowedSortFields: Record<string, string> = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    name: "name",
    number: "number",
    status: "status",
    bidsDueAt: "bidsDueAt",
    estimatedValue: "estimatedValue",
    clientName: "clientName",
  };
  const sortField = allowedSortFields[sort] ?? "createdAt";
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: order },
      include: {
        lead: {
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
          },
        },
        _count: {
          select: {
            bidPackages: true,
            documents: true,
            members: true,
            comments: true,          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return apiResponse(projects, 200, paginationMeta(total, page, limit));
});

// ─────────────────────────────────────────
// POST /api/v1/projects
// ─────────────────────────────────────────

export const POST = withAuth(async (req: NextRequest, _ctx, user: AuthenticatedUser) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const result = createProjectSchema.safeParse(body);
  if (!result.success) {
    return apiError("Validation failed", 422, result.error.flatten().fieldErrors);
  }

  const data = result.data;
  // Auto-generate project number if not provided
  let projectNumber = data.number;
  if (!projectNumber) {
    const latestProject = await prisma.project.findFirst({
      where: {
        organizationId: user.organizationId,
        number: { not: null },
      },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    if (latestProject?.number) {
      const numericPart = parseInt(latestProject.number, 10);
      if (!isNaN(numericPart)) {
        projectNumber = String(numericPart + 1).padStart(latestProject.number.length, "0");
      } else {
        // Non-numeric numbering — append timestamp-based suffix
        projectNumber = `P-${Date.now()}`;
      }
    } else {
      // First project for this org — start at a conventional number
      projectNumber = "25001";
    }
  }

  // Validate lead user belongs to same org
  const leadUserId = data.leadUserId ?? user.id;  const leadUser = await prisma.user.findFirst({
    where: { id: leadUserId, organizationId: user.organizationId },
    select: { id: true },
  });
  if (!leadUser) {
    return apiError("Lead user not found in your organization", 400);
  }

  // Validate office belongs to same org (if provided)
  if (data.officeId) {
    const office = await prisma.office.findFirst({
      where: { id: data.officeId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!office) {
      return apiError("Office not found in your organization", 400);
    }
  }

  const project = await prisma.project.create({
    data: {
      organizationId: user.organizationId,
      officeId: data.officeId ?? null,
      number: projectNumber,
      name: data.name,
      status: data.status,
      projectType: data.projectType,
      estimatedValue: data.estimatedValue ?? null,
      description: data.description ?? null,      addressLine1: data.addressLine1 ?? null,
      addressLine2: data.addressLine2 ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zip: data.zip ?? null,
      country: data.country,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      clientName: data.clientName ?? null,
      bidsDueAt: data.bidsDueAt ? new Date(data.bidsDueAt) : null,
      bidsDueTimezone: data.bidsDueTimezone,
      dueToClientAt: data.dueToClientAt ? new Date(data.dueToClientAt) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      leadUserId,
      visibility: data.visibility,
      csiDivisions: data.csiDivisions,
      tags: data.tags,
      bidFormTemplateId: data.bidFormTemplateId ?? null,
      createdBy: user.id,
    },
    include: {
      lead: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,        },
      },
      office: {
        select: { id: true, name: true },
      },
    },
  });

  // Create activity log entry
  await prisma.activityLog.create({
    data: {
      organizationId: user.organizationId,
      projectId: project.id,
      entityType: "project",
      entityId: project.id,
      action: "PROJECT_CREATED",
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorEmail: user.email,
      metadata: {
        projectName: project.name,
        projectNumber: project.number,
        status: project.status,
      },
    },
  });

  return apiResponse(project, 201);
});
