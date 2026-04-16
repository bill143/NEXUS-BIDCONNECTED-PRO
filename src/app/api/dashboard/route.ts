import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, startOfMonth, endOfMonth, addMonths, format } from "date-fns";

export async function GET() {
  const now = new Date();
  const thirtyDaysOut = addDays(now, 30);

  const [
    totalBonds,
    activeBonds,
    expiringBonds,
    totalAmounts,
    bondsByStatus,
    bondsByType,
    recentTransitions,
    pendingReminders,
  ] = await Promise.all([
    prisma.bond.count(),
    prisma.bond.count({ where: { status: { in: ["active", "issued"] } } }),
    prisma.bond.count({
      where: {
        status: { in: ["active", "expiring"] },
        expirationDate: { lte: thirtyDaysOut },
      },
    }),
    prisma.bond.aggregate({
      _sum: { bondAmount: true, premiumAmount: true },
      where: { status: { in: ["active", "issued", "expiring"] } },
    }),
    prisma.bond.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.bond.groupBy({
      by: ["type"],
      _count: { type: true },
    }),
    prisma.bondStatusHistory.findMany({
      take: 10,
      orderBy: { changedAt: "desc" },
      include: { bond: { include: { project: true } } },
    }),
    prisma.reminder.count({
      where: { status: "pending", dueDate: { lte: thirtyDaysOut } },
    }),
  ]);

  // Build 6-month expiration timeline
  const expirationTimeline = [];
  for (let i = 0; i < 6; i++) {
    const monthStart = startOfMonth(addMonths(now, i));
    const monthEnd = endOfMonth(addMonths(now, i));
    const count = await prisma.bond.count({
      where: {
        expirationDate: { gte: monthStart, lte: monthEnd },
        status: { in: ["active", "expiring", "issued"] },
      },
    });
    expirationTimeline.push({
      month: format(monthStart, "MMM yyyy"),
      count,
    });
  }

  // Compliance score: percentage of non-expired active bonds
  const overdueCount = await prisma.bond.count({
    where: {
      status: { in: ["expiring", "expired"] },
      expirationDate: { lt: now },
    },
  });
  const totalActive = activeBonds + expiringBonds;
  const complianceScore =
    totalActive > 0
      ? Math.round(((totalActive - overdueCount) / totalActive) * 100)
      : 100;

  return NextResponse.json({
    totalBonds,
    activeBonds,
    expiringWithin30Days: expiringBonds,
    totalBondAmount: totalAmounts._sum.bondAmount ?? 0,
    totalPremiumAmount: totalAmounts._sum.premiumAmount ?? 0,
    pendingReminders,
    complianceScore,
    bondsByStatus: bondsByStatus.map((b) => ({
      status: b.status,
      count: b._count.status,
    })),
    bondsByType: bondsByType.map((b) => ({
      type: b.type,
      count: b._count.type,
    })),
    expirationTimeline,
    recentTransitions,
  });
}
