import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "pending";
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const reminders = await prisma.reminder.findMany({
    where: { status },
    include: {
      bond: { select: { bondNumber: true, type: true, status: true } },
      project: { select: { name: true, projectNumber: true } },
    },
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    take: limit,
  });

  return NextResponse.json(reminders);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;

  const reminder = await prisma.reminder.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(reminder);
}
