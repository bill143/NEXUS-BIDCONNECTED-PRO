import { format, formatDistanceToNow, isAfter, isBefore, addHours, addDays, differenceInHours, differenceInMinutes, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/**
 * Format a date string in the specified timezone with timezone abbreviation.
 * Example: "10/2/2025 11:00 AM CDT"
 */
export function formatDateTimeTz(
  dateString: string | Date,
  timezone: string = "America/Chicago"
): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return formatInTimeZone(date, timezone, "M/d/yyyy h:mm a zzz");
}

/**
 * Format a date for display (no time).
 * Example: "10/2/2025"
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "M/d/yyyy");
}

/**
 * Format a date as a short date.
 * Example: "Oct 2, 2025"
 */
export function formatDateShort(dateString: string | Date): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "MMM d, yyyy");
}

/**
 * Format a date as relative time.
 * Example: "3 days ago", "2 hours ago"
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a datetime for full display.
 * Example: "October 2, 2025 at 11:00 AM CDT"
 */
export function formatFullDateTime(
  dateString: string | Date,
  timezone: string = "America/Chicago"
): string {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return formatInTimeZone(date, timezone, "MMMM d, yyyy 'at' h:mm a zzz");
}

/**
 * Get a countdown string for a deadline.
 * Returns "2 days, 4 hours remaining" or "Past due" or "Due in 3 hours"
 */
export function getDeadlineCountdown(dateString: string | Date): {
  text: string;
  urgency: "normal" | "warning" | "critical" | "past";
} {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  const now = new Date();

  if (isAfter(now, date)) {
    return { text: "Past due", urgency: "past" };
  }

  const hoursRemaining = differenceInHours(date, now);
  const minutesRemaining = differenceInMinutes(date, now);

  if (hoursRemaining < 1) {
    return {
      text: `${minutesRemaining} minutes remaining`,
      urgency: "critical",
    };
  }

  if (hoursRemaining < 24) {
    return {
      text: `${hoursRemaining} hours remaining`,
      urgency: "critical",
    };
  }

  if (hoursRemaining < 72) {
    const days = Math.floor(hoursRemaining / 24);
    const hours = hoursRemaining % 24;
    return {
      text: `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""} remaining`,
      urgency: "warning",
    };
  }

  const days = Math.floor(hoursRemaining / 24);
  return {
    text: `${days} days remaining`,
    urgency: "normal",
  };
}

/**
 * Check if a date is within N hours from now.
 */
export function isWithinHours(dateString: string | Date, hours: number): boolean {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  const now = new Date();
  const threshold = addHours(now, hours);
  return isAfter(date, now) && isBefore(date, threshold);
}

/**
 * Check if a date is past.
 */
export function isPast(dateString: string | Date): boolean {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return isAfter(new Date(), date);
}

/**
 * Convert a date to a specific timezone for display.
 */
export function toTimezone(dateString: string | Date, timezone: string): Date {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return toZonedTime(date, timezone);
}

/**
 * Add days to a date.
 */
export function addDaysToDate(dateString: string | Date, days: number): Date {
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return addDays(date, days);
}