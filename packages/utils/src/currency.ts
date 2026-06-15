/**
 * Format a number or string as USD currency.
 * Example: 1500000 → "$1,500,000.00"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = "USD"
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Format a number as compact currency (e.g., $1.5M).
 */
export function formatCurrencyCompact(
  value: number | string | null | undefined,
  currency: string = "USD"
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
}

/**
 * Parse a currency string to a number.
 * Example: "$1,500,000.00" → 1500000
 */
export function parseCurrency(value: string): number | null {
  if (!value) return null;

  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}

/**
 * Format a number with commas.
 * Example: 1500000 → "1,500,000"
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US").format(numericValue);
}

/**
 * Format a percentage.
 * Example: 0.85 → "85%"
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(decimals)}%`;
}