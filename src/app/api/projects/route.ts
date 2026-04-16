import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const projects = await prisma.project.findMany({
    where,
    include: {
      bonds: {
        select: {
          id: true,
          type: true,
          status: true,
          bondAmount: true,
          expirationDate: true,
        },
      },
      _count: { select: { bonds: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const project = await prisma.project.create({
    data: {
      name: body.name,
      projectNumber: body.projectNumber,
      owner: body.owner,
      location: body.location,
      bidDueDate: new Date(body.bidDueDate),
      estimatedValue: body.estimatedValue,
      status: body.status || "active",
    },
  });

  return NextResponse.json(project, { status: 201 });
}
