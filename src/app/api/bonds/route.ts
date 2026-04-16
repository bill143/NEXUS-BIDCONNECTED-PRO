import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReminderDates } from "@/lib/bond-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (projectId) where.projectId = projectId;

  const bonds = await prisma.bond.findMany({
    where,
    include: {
      project: true,
      statusHistory: { orderBy: { changedAt: "desc" }, take: 1 },
    },
    orderBy: { expirationDate: "asc" },
  });

  return NextResponse.json(bonds);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const bond = await prisma.bond.create({
    data: {
      bondNumber: body.bondNumber,
      type: body.type,
      status: "issued",
      suretyCompany: body.suretyCompany,
      principalName: body.principalName,
      obligeeName: body.obligeeName,
      bondAmount: body.bondAmount,
      premiumAmount: body.premiumAmount,
      premiumRate: body.premiumRate,
      effectiveDate: new Date(body.effectiveDate),
      expirationDate: new Date(body.expirationDate),
      underwriter: body.underwriter,
      agentName: body.agentName,
      agentContact: body.agentContact,
      notes: body.notes,
      projectId: body.projectId,
      statusHistory: {
        create: {
          fromStatus: "new",
          toStatus: "issued",
          reason: "Bond created",
        },
      },
    },
    include: { project: true },
  });

  // Auto-generate renewal reminders
  const expirationDate = new Date(body.expirationDate);
  const reminderDates = generateReminderDates(expirationDate);
  const reminderData = reminderDates.map((dueDate, index) => {
    const daysOut = [60, 30, 14, 7, 1];
    return {
      bondId: bond.id,
      projectId: body.projectId,
      type: "expiration_warning" as const,
      title: `Bond ${body.bondNumber} expires in ${daysOut[index]} days`,
      message: `${body.type === "bid_bond" ? "Bid Bond" : body.type === "performance_bond" ? "Performance Bond" : "Payment Bond"} #${body.bondNumber} for project "${bond.project.name}" expires on ${expirationDate.toLocaleDateString()}.`,
      dueDate,
      priority: daysOut[index] <= 7 ? "critical" : daysOut[index] <= 14 ? "high" : "medium",
    };
  });

  if (reminderData.length > 0) {
    await prisma.reminder.createMany({ data: reminderData });
  }

  return NextResponse.json(bond, { status: 201 });
}
