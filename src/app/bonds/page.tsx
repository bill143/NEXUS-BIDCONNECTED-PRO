import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, getDaysUntilExpiration, getExpirationUrgency } from "@/lib/bond-utils";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import Link from "next/link";
import clsx from "clsx";

export default async function BondsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.type) where.type = searchParams.type;

  const bonds = await prisma.bond.findMany({
    where,
    include: { project: true },
    orderBy: { expirationDate: "asc" },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonds</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage bid bonds, performance bonds, and payment bonds
          </p>
        </div>
        <Link
          href="/bonds/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          New Bond
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <FilterLink href="/bonds" label="All" active={!searchParams.status && !searchParams.type} />
        <FilterLink href="/bonds?status=active" label="Active" active={searchParams.status === "active"} />
        <FilterLink href="/bonds?status=expiring" label="Expiring" active={searchParams.status === "expiring"} />
        <FilterLink href="/bonds?status=expired" label="Expired" active={searchParams.status === "expired"} />
        <FilterLink href="/bonds?type=bid_bond" label="Bid Bonds" active={searchParams.type === "bid_bond"} />
        <FilterLink href="/bonds?type=performance_bond" label="Performance" active={searchParams.type === "performance_bond"} />
        <FilterLink href="/bonds?type=payment_bond" label="Payment" active={searchParams.type === "payment_bond"} />
      </div>

      {bonds.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Surety
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expires
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bonds.map((bond) => {
                const daysLeft = getDaysUntilExpiration(bond.expirationDate);
                const urgency = getExpirationUrgency(bond.expirationDate);
                return (
                  <tr key={bond.id} className="hover:bg-gray-50 transition-colors">
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
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      <Link href={`/projects/${bond.projectId}`} className="hover:text-brand-600">
                        {bond.project.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(bond.bondAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {bond.suretyCompany}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
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
                            : `${daysLeft} days left`}
                        </p>
                      </div>
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
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No bonds found</p>
          <Link
            href="/bonds/new"
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Create your first bond
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-100 text-brand-700"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      )}
    >
      {label}
    </Link>
  );
}
