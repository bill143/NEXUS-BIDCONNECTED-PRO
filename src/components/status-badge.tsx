import clsx from "clsx";
import {
  BOND_STATUS_LABELS,
  BOND_STATUS_COLORS,
  BOND_TYPE_LABELS,
} from "@/lib/bond-utils";
import type { BondStatus, BondType } from "@/lib/bond-utils";

export function StatusBadge({ status }: { status: string }) {
  const label = BOND_STATUS_LABELS[status as BondStatus] || status;
  const color = BOND_STATUS_COLORS[status as BondStatus] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        color
      )}
    >
      {label}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const label = BOND_TYPE_LABELS[type as BondType] || type;
  const colors: Record<string, string> = {
    bid_bond: "bg-indigo-100 text-indigo-800",
    performance_bond: "bg-emerald-100 text-emerald-800",
    payment_bond: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[type] || "bg-gray-100 text-gray-800"
      )}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[priority] || "bg-gray-100 text-gray-700"
      )}
    >
      {priority}
    </span>
  );
}
