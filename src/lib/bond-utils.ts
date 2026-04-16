import { differenceInDays, format, addDays } from "date-fns";

export type BondType = "bid_bond" | "performance_bond" | "payment_bond";
export type BondStatus =
  | "draft"
  | "issued"
  | "active"
  | "expiring"
  | "expired"
  | "renewed"
  | "released"
  | "forfeited";
export type ReminderType =
  | "expiration_warning"
  | "renewal_due"
  | "bid_deadline"
  | "compliance_check";

export const BOND_TYPE_LABELS: Record<BondType, string> = {
  bid_bond: "Bid Bond",
  performance_bond: "Performance Bond",
  payment_bond: "Payment Bond",
};

export const BOND_STATUS_LABELS: Record<BondStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  active: "Active",
  expiring: "Expiring Soon",
  expired: "Expired",
  renewed: "Renewed",
  released: "Released",
  forfeited: "Forfeited",
};

export const BOND_STATUS_COLORS: Record<BondStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  expiring: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800",
  renewed: "bg-purple-100 text-purple-800",
  released: "bg-teal-100 text-teal-800",
  forfeited: "bg-red-200 text-red-900",
};

export const VALID_TRANSITIONS: Record<BondStatus, BondStatus[]> = {
  draft: ["issued"],
  issued: ["active"],
  active: ["expiring", "released", "forfeited"],
  expiring: ["renewed", "expired", "released"],
  expired: ["renewed"],
  renewed: ["active"],
  released: [],
  forfeited: [],
};

export function getDaysUntilExpiration(expirationDate: Date): number {
  return differenceInDays(new Date(expirationDate), new Date());
}

export function getExpirationUrgency(
  expirationDate: Date
): "safe" | "warning" | "critical" | "expired" {
  const days = getDaysUntilExpiration(expirationDate);
  if (days < 0) return "expired";
  if (days <= 14) return "critical";
  if (days <= 30) return "warning";
  return "safe";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function generateReminderDates(expirationDate: Date): Date[] {
  const exp = new Date(expirationDate);
  return [
    addDays(exp, -60), // 60 days before
    addDays(exp, -30), // 30 days before
    addDays(exp, -14), // 14 days before
    addDays(exp, -7), // 7 days before
    addDays(exp, -1), // 1 day before
  ].filter((d) => d > new Date());
}
