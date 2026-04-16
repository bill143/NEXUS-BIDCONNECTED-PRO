import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate, getDaysUntilExpiration, getExpirationUrgency } from "@/lib/bond-utils";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import Link from "next/link";
import clsx from "clsx";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      bonds: {
        include: { statusHistory: { orderBy: { changedAt: "desc" }, take: 1 } },
        orderBy: { expirationDate: "asc" },
      },
    },
  });

  if (!project) notFound();

  const totalBondAmount = project.bonds.reduce((s, b) => s + b.bondAmount, 0);
  const activeBonds = project.bonds.filter((b) =>
    ["active", "issued", "expiring"].includes(b.status)
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Projects
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            #{project.projectNumber} &middot; {project.owner} &middot;{" "}
            {project.location}
          </p>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-sm font-medium",
            project.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          )}
        >
          {project.status}
        </span>
      </div>

      {/* Project Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Estimated Value</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(project.estimatedValue)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Bid Due Date</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatDate(project.bidDueDate)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Bonds</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {project.bonds.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Bond Amount</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatCurrency(totalBondAmount)}
          </p>
        </div>
      </div>

      {/* Bonds Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Associated Bonds
          </h2>
          <Link
            href={`/bonds/new`}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add Bond
          </Link>
        </div>

        {project.bonds.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bond Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expires
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {project.bonds.map((bond) => {
                const daysLeft = getDaysUntilExpiration(bond.expirationDate);
                const urgency = getExpirationUrgency(bond.expirationDate);
                return (
                  <tr key={bond.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/bonds/${bond.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        {bond.bondNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <TypeBadge type={bond.type} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={bond.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(bond.bondAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {formatDate(bond.expirationDate)}
                      </p>
                      <p
                        className={clsx(
                          "text-xs",
                          urgency === "critical"
                            ? "text-red-600 font-medium"
                            : urgency === "warning"
                            ? "text-yellow-600"
                            : urgency === "expired"
                            ? "text-red-500"
                            : "text-gray-400"
                        )}
                      >
                        {urgency === "expired"
                          ? "Expired"
                          : `${daysLeft} days`}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/bonds/${bond.id}`}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No bonds for this project yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
