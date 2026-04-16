import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

export async function POST() {
  const now = new Date();
  let processed = 0;
  let autoTransitioned = 0;

  // Find active bonds expiring within 30 days and auto-transition to "expiring"
  const soonExpiring = await prisma.bond.findMany({
    where: {
      status: "active",
      expirationDate: { lte: addDays(now, 30) },
    },
    include: { project: true },
  });

  for (const bond of soonExpiring) {
    await prisma.$transaction([
      prisma.bond.update({
        where: { id: bond.id },
        data: { status: "expiring" },
      }),
      prisma.bondStatusHistory.create({
        data: {
          bondId: bond.id,
          fromStatus: "active",
          toStatus: "expiring",
          changedBy: "system",
          reason: "Auto-transitioned: bond expiring within 30 days",
        },
      }),
    ]);
    autoTransitioned++;
  }

  // Find bonds that have passed expiration and mark expired
  const pastExpiration = await prisma.bond.findMany({
    where: {
      status: "expiring",
      expirationDate: { lt: now },
    },
  });

  for (const bond of pastExpiration) {
    await prisma.$transaction([
      prisma.bond.update({
        where: { id: bond.id },
        data: { status: "expired" },
      }),
      prisma.bondStatusHistory.create({
        data: {
          bondId: bond.id,
          fromStatus: "expiring",
          toStatus: "expired",
          changedBy: "system",
          reason: "Auto-transitioned: bond has expired",
        },
      }),
    ]);
    autoTransitioned++;
  }

  // Generate missing reminders for active/expiring bonds
  const activeBonds = await prisma.bond.findMany({
    where: { status: { in: ["active", "issued", "expiring"] } },
    include: {
      project: true,
      reminders: { where: { status: "pending" } },
    },
  });

  const thresholdDays = [60, 30, 14, 7];
  for (const bond of activeBonds) {
    for (const days of thresholdDays) {
      const reminderDate = addDays(bond.expirationDate, -days);
      if (reminderDate <= now) continue; // Already past this threshold

      const existingReminder = bond.reminders.find(
        (r) =>
          Math.abs(new Date(r.dueDate).getTime() - reminderDate.getTime()) <
          86400000 // within 1 day
      );

      if (!existingReminder) {
        await prisma.reminder.create({
          data: {
            bondId: bond.id,
            projectId: bond.projectId,
            type: days <= 14 ? "renewal_due" : "expiration_warning",
            title: `Bond ${bond.bondNumber} expires in ${days} days`,
            message: `Bond #${bond.bondNumber} for "${bond.project.name}" expires on ${bond.expirationDate.toLocaleDateString()}.`,
            dueDate: reminderDate,
            priority: days <= 7 ? "critical" : days <= 14 ? "high" : "medium",
          },
        });
        processed++;
      }
    }
  }

  return NextResponse.json({
    processed,
    autoTransitioned,
    message: `Processed ${processed} new reminders. Auto-transitioned ${autoTransitioned} bonds.`,
  });
}
