import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  formatCurrency,
  formatDate,
  getDaysUntilExpiration,
  getExpirationUrgency,
  VALID_TRANSITIONS,
  BOND_TYPE_LABELS,
} from "@/lib/bond-utils";
import type { BondStatus, BondType } from "@/lib/bond-utils";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import { BondTransitionForm } from "@/components/bond-transition-form";
import Link from "next/link";
import clsx from "clsx";

export default async function BondDetailPage({
  params,
}: {
  params: { bondId: string };
}) {
  const bond = await prisma.bond.findUnique({
    where: { id: params.bondId },
    include: {
      project: true,
      statusHistory: { orderBy: { changedAt: "desc" } },
      reminders: { orderBy: { dueDate: "asc" }, where: { status: "pending" } },
    },
  });

  if (!bond) notFound();

  const daysLeft = getDaysUntilExpiration(bond.expirationDate);
  const urgency = getExpirationUrgency(bond.expirationDate);
  const validTransitions =
    VALID_TRANSITIONS[bond.status as BondStatus] || [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/bonds"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Bonds
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {bond.bondNumber}
            </h1>
            <StatusBadge status={bond.status} />
            <TypeBadge type={bond.type} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {BOND_TYPE_LABELS[bond.type as BondType]} for{" "}
            <Link
              href={`/projects/${bond.projectId}`}
              className="text-brand-600 hover:text-brand-700"
            >
              {bond.project.name}
            </Link>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(bond.bondAmount)}
          </p>
          <p className="text-sm text-gray-500">
            Premium: {formatCurrency(bond.premiumAmount)}
            {bond.premiumRate && ` (${bond.premiumRate}%)`}
          </p>
        </div>
      </div>

      {/* Expiration Alert */}
      {(urgency === "critical" || urgency === "warning") && (
        <div
          className={clsx(
            "mb-6 rounded-xl border p-4",
            urgency === "critical"
              ? "border-red-200 bg-red-50"
              : "border-yellow-200 bg-yellow-50"
          )}
        >
          <p
            className={clsx(
              "text-sm font-medium",
              urgency === "critical" ? "text-red-800" : "text-yellow-800"
            )}
          >
            {urgency === "critical"
              ? `This bond expires in ${daysLeft} days — immediate action required`
              : `This bond expires in ${daysLeft} days — review and plan renewal`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bond Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Bond Details
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Surety Company" value={bond.suretyCompany} />
              <DetailItem label="Principal" value={bond.principalName} />
              <DetailItem label="Obligee" value={bond.obligeeName} />
              <DetailItem
                label="Effective Date"
                value={formatDate(bond.effectiveDate)}
              />
              <DetailItem
                label="Expiration Date"
                value={formatDate(bond.expirationDate)}
              />
              {bond.renewalDate && (
                <DetailItem
                  label="Last Renewed"
                  value={formatDate(bond.renewalDate)}
                />
              )}
              {bond.underwriter && (
                <DetailItem label="Underwriter" value={bond.underwriter} />
              )}
              {bond.agentName && (
                <DetailItem label="Agent" value={bond.agentName} />
              )}
              {bond.agentContact && (
                <DetailItem label="Agent Contact" value={bond.agentContact} />
              )}
            </dl>
            {bond.notes && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">{bond.notes}</p>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Status History
            </h2>
            {bond.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {bond.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-brand-400" />
                      {index < bond.statusHistory.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={history.fromStatus} />
                        <span className="text-xs text-gray-400">→</span>
                        <StatusBadge status={history.toStatus} />
                      </div>
                      {history.reason && (
                        <p className="mt-1 text-sm text-gray-500">
                          {history.reason}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(history.changedAt)} &middot;{" "}
                        {history.changedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No status changes recorded</p>
            )}
          </div>
        </div>

        {/* Right Column: Actions + Reminders */}
        <div className="space-y-6">
          {/* Transition Actions */}
          {validTransitions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Actions
              </h2>
              <BondTransitionForm
                bondId={bond.id}
                currentStatus={bond.status}
                validTransitions={validTransitions}
              />
            </div>
          )}

          {/* Pending Reminders */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Upcoming Reminders
            </h2>
            {bond.reminders.length > 0 ? (
              <div className="space-y-3">
                {bond.reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Due: {formatDate(reminder.dueDate)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No pending reminders</p>
            )}
          </div>

          {/* Project Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Project
            </h2>
            <Link
              href={`/projects/${bond.project.id}`}
              className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-brand-600">
                {bond.project.name}
              </p>
              <p className="text-xs text-gray-500">
                #{bond.project.projectNumber}
              </p>
              <p className="text-xs text-gray-400">{bond.project.location}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
