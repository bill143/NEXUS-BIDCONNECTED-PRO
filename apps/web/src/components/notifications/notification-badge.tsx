"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@bidconnect/ui/lib/utils";
import { useUnreadCount } from "@/hooks/use-notifications";

// ───────────────────────────────────────────────────
// Props
// ───────────────────────────────────────────────────

interface NotificationBadgeProps {
  className?: string;
}

// ───────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { data: unreadCount = 0 } = useUnreadCount();
  const previousCountRef = useRef(unreadCount);
  const [isPulsing, setIsPulsing] = useState(false);

  // Trigger pulse animation when unread count increases
  useEffect(() => {
    if (unreadCount > previousCountRef.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);    }
    previousCountRef.current = unreadCount;
  }, [unreadCount]);

  // Keep the ref updated after pulse check
  useEffect(() => {
    previousCountRef.current = unreadCount;
  }, [unreadCount]);

  if (unreadCount === 0) return null;

  const displayCount = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <span
      className={cn(
        "absolute flex items-center justify-center",
        "right-1.5 top-1.5",
        "h-4 min-w-[16px] rounded-full px-1",
        "bg-sky-500 text-[10px] font-bold leading-none text-white",
        "shadow-lg shadow-sky-500/30",
        "pointer-events-none select-none",
        className
      )}
      aria-label={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
    >
      {displayCount}
      {/* Pulse ring — appears when new notifications arrive */}
      {isPulsing && (
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            "animate-ping bg-sky-400 opacity-75"
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
