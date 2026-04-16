import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      bonds: {
        include: { statusHistory: { orderBy: { changedAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
      reminders: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const body = await request.json();

  const project = await prisma.project.update({
    where: { id: params.projectId },
    data: {
      name: body.name,
      projectNumber: body.projectNumber,
      owner: body.owner,
      location: body.location,
      bidDueDate: body.bidDueDate ? new Date(body.bidDueDate) : undefined,
      estimatedValue: body.estimatedValue,
      status: body.status,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  await prisma.project.delete({ where: { id: params.projectId } });
  return NextResponse.json({ success: true });
}
