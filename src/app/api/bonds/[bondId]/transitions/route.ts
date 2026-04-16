import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VALID_TRANSITIONS, generateReminderDates } from "@/lib/bond-utils";
import type { BondStatus } from "@/lib/bond-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { bondId: string } }
) {
  const bond = await prisma.bond.findUnique({
    where: { id: params.bondId },
    include: { project: true },
  });

  if (!bond) {
    return NextResponse.json({ error: "Bond not found" }, { status: 404 });
  }

  const body = await request.json();
  const { toStatus, reason, newExpirationDate } = body;

  const currentStatus = bond.status as BondStatus;
  const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

  if (!validNextStatuses.includes(toStatus)) {
    return NextResponse.json(
      {
        error: `Invalid transition from "${currentStatus}" to "${toStatus}". Valid transitions: ${validNextStatuses.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Build update data based on transition type
  const updateData: Record<string, unknown> = { status: toStatus };

  if (toStatus === "renewed") {
    if (!newExpirationDate) {
      return NextResponse.json(
        { error: "New expiration date is required for renewal" },
        { status: 400 }
      );
    }
    updateData.renewalDate = new Date();
    updateData.expirationDate = new Date(newExpirationDate);
  }

  // Execute transition atomically
  const [updatedBond] = await prisma.$transaction([
    prisma.bond.update({
      where: { id: params.bondId },
      data: updateData,
      include: { project: true },
    }),
    prisma.bondStatusHistory.create({
      data: {
        bondId: params.bondId,
        fromStatus: currentStatus,
        toStatus,
        reason: reason || `Transitioned from ${currentStatus} to ${toStatus}`,
      },
    }),
  ]);

  // If renewed, generate new reminders for the new expiration date
  if (toStatus === "renewed" && newExpirationDate) {
    // Clear old pending reminders
    await prisma.reminder.deleteMany({
      where: { bondId: params.bondId, status: "pending" },
    });

    const reminderDates = generateReminderDates(new Date(newExpirationDate));
    const daysOut = [60, 30, 14, 7, 1];
    const reminderData = reminderDates.map((dueDate, index) => ({
      bondId: params.bondId,
      projectId: bond.projectId,
      type: "renewal_due" as const,
      title: `Renewed bond ${bond.bondNumber} expires in ${daysOut[index]} days`,
      message: `Renewed bond #${bond.bondNumber} for "${bond.project.name}" expires on ${new Date(newExpirationDate).toLocaleDateString()}.`,
      dueDate,
      priority: daysOut[index] <= 7 ? "critical" : daysOut[index] <= 14 ? "high" : "medium",
    }));

    if (reminderData.length > 0) {
      await prisma.reminder.createMany({ data: reminderData });
    }
  }

  return NextResponse.json(updatedBond);
}
