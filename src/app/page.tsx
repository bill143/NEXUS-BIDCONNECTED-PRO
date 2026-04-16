import { prisma } from "@/lib/prisma";
import { addDays, startOfMonth, endOfMonth, addMonths, format } from "date-fns";
import { formatCurrency, formatDate, getDaysUntilExpiration, getExpirationUrgency } from "@/lib/bond-utils";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import Link from "next/link";
import clsx from "clsx";

async function getDashboardData() {
  const now = new Date();
  const thirtyDaysOut = addDays(now, 30);

  const [
    totalBonds,
    activeBonds,
    expiringBonds,
    totalAmounts,
    bondsByStatus,
    recentTransitions,
    pendingReminders,
    upcomingExpirations,
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
    prisma.bondStatusHistory.findMany({
      take: 8,
      orderBy: { changedAt: "desc" },
      include: { bond: { include: { project: true } } },
    }),
    prisma.reminder.count({
      where: { status: "pending", dueDate: { lte: thirtyDaysOut } },
    }),
    prisma.bond.findMany({
      where: {
        status: { in: ["active", "expiring", "issued"] },
        expirationDate: { gte: now },
      },
      include: { project: true },
      orderBy: { expirationDate: "asc" },
      take: 5,
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
      month: format(monthStart, "MMM"),
      count,
    });
  }

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

  return {
    totalBonds,
    activeBonds,
    expiringBonds,
    totalBondAmount: totalAmounts._sum.bondAmount ?? 0,
    complianceScore,
    pendingReminders,
    bondsByStatus: bondsByStatus.map((b) => ({
      status: b.status,
      count: b._count.status,
    })),
    expirationTimeline,
    recentTransitions,
    upcomingExpirations,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bid Security Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track bond lifecycles, monitor compliance, and manage renewal deadlines
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Bonds"
          value={data.activeBonds.toString()}
          subtitle={`${data.totalBonds} total`}
          color="blue"
        />
        <StatCard
          title="Total Bond Amount"
          value={formatCurrency(data.totalBondAmount)}
          subtitle="Across active bonds"
          color="green"
        />
        <StatCard
          title="Expiring (30 days)"
          value={data.expiringBonds.toString()}
          subtitle={data.expiringBonds > 0 ? "Action required" : "All clear"}
          color={data.expiringBonds > 0 ? "red" : "green"}
        />
        <StatCard
          title="Compliance Score"
          value={`${data.complianceScore}%`}
          subtitle={
            data.complianceScore >= 90
              ? "Healthy"
              : data.complianceScore >= 70
              ? "Needs attention"
              : "Critical"
          }
          color={
            data.complianceScore >= 90
              ? "green"
              : data.complianceScore >= 70
              ? "yellow"
              : "red"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expiration Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Expiration Timeline
          </h2>
          <div className="flex items-end gap-3 h-40">
            {data.expirationTimeline.map((month) => {
              const maxCount = Math.max(
                ...data.expirationTimeline.map((m) => m.count),
                1
              );
              const height = (month.count / maxCount) * 100;
              return (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">
                    {month.count}
                  </span>
                  <div
                    className={clsx(
                      "w-full rounded-t-md transition-all",
                      month.count > 0 ? "bg-brand-500" : "bg-gray-100"
                    )}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-gray-500">{month.month}</span>
                </div>
              );
            })}
          </div>
          {data.expirationTimeline.every((m) => m.count === 0) && (
            <p className="mt-4 text-center text-sm text-gray-400">
              No upcoming expirations in the next 6 months
            </p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Bond Status Distribution
          </h2>
          {data.bondsByStatus.length > 0 ? (
            <div className="space-y-3">
              {data.bondsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-medium text-gray-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No bonds tracked yet</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Expirations */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Expirations
            </h2>
            <Link
              href="/bonds?status=expiring"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </div>
          {data.upcomingExpirations.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingExpirations.map((bond) => {
                const daysLeft = getDaysUntilExpiration(bond.expirationDate);
                const urgency = getExpirationUrgency(bond.expirationDate);
                return (
                  <Link
                    key={bond.id}
                    href={`/bonds/${bond.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {bond.bondNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bond.project.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={clsx(
                          "text-sm font-medium",
                          urgency === "critical"
                            ? "text-red-600"
                            : urgency === "warning"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        )}
                      >
                        {daysLeft} days
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(bond.expirationDate)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No upcoming expirations</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          {data.recentTransitions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransitions.map((transition) => (
                <div
                  key={transition.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-brand-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {transition.bond.bondNumber}
                      </span>{" "}
                      <StatusBadge status={transition.fromStatus} />
                      {" → "}
                      <StatusBadge status={transition.toStatus} />
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {transition.bond.project.name} &middot;{" "}
                      {formatDate(transition.changedAt)}
                    </p>
                    {transition.reason && (
                      <p className="mt-1 text-xs text-gray-400">
                        {transition.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No recent activity</p>
          )}
        </div>
      </div>

      {/* Pending Reminders Notice */}
      {data.pendingReminders > 0 && (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {data.pendingReminders} pending reminder{data.pendingReminders !== 1 ? "s" : ""}
              </p>
              <Link
                href="/reminders"
                className="text-xs font-medium text-yellow-700 underline hover:text-yellow-800"
              >
                Review reminders
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "green" | "red" | "yellow";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    red: "border-red-200 bg-red-50",
    yellow: "border-yellow-200 bg-yellow-50",
  };
  const valueColors = {
    blue: "text-blue-700",
    green: "text-green-700",
    red: "text-red-700",
    yellow: "text-yellow-700",
  };

  return (
    <div className={clsx("rounded-xl border p-5", colors[color])}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={clsx("mt-1 text-2xl font-bold", valueColors[color])}>
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
