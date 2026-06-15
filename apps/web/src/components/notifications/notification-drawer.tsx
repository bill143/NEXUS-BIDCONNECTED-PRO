"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bell,
  FileText,
  FolderKanban,
  MessageSquare,
  AlertTriangle,
  BellOff,
} from "lucide-react";
import { cn } from "@bidconnect/ui/lib/utils";
import type { Notification } from "@bidconnect/types";
import type { NotificationType } from "@bidconnect/types";
import {
  useNotifications,
  useMarkNotificationRead,
} from "@/hooks/use-notifications";

// ───────────────────────────────────────────────────
// Filter types
// ───────────────────────────────────────────────────

type FilterKey = "all" | "unread" | "bids" | "documents" | "projects";
interface FilterPill {
  key: FilterKey;
  label: string;
}

const FILTER_PILLS: FilterPill[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "bids", label: "Bids" },
  { key: "documents", label: "Documents" },
  { key: "projects", label: "Projects" },
];

const BID_TYPES: NotificationType[] = [
  "ITB_RECEIVED",
  "ITB_REMINDER_48H",
  "ITB_REMINDER_24H",
  "BID_SUBMITTED",
  "BID_REVISED",
  "BID_DECLINED",
  "BID_VIEWED",
  "BID_AWARDED",
];

const DOCUMENT_TYPES: NotificationType[] = [
  "ADDENDUM_UPLOADED",
  "DOCUMENT_ADDED",
];

const PROJECT_TYPES: NotificationType[] = [  "PROJECT_CLOSED",
  "PROJECT_CREATED",
  "TEAM_MEMBER_ADDED",
];

// ───────────────────────────────────────────────────
// Icon mapping
// ───────────────────────────────────────────────────

function getNotificationIcon(type: NotificationType) {
  if (BID_TYPES.includes(type)) return Bell;
  if (DOCUMENT_TYPES.includes(type)) return FileText;
  if (PROJECT_TYPES.includes(type)) return FolderKanban;
  if (type === "COMMENT_MENTION") return MessageSquare;
  if (type === "DEADLINE_APPROACHING") return AlertTriangle;
  return Bell;
}

function getNotificationIconColor(type: NotificationType): string {
  if (BID_TYPES.includes(type)) return "text-sky-400";
  if (DOCUMENT_TYPES.includes(type)) return "text-amber-400";
  if (PROJECT_TYPES.includes(type)) return "text-emerald-400";
  if (type === "COMMENT_MENTION") return "text-violet-400";
  if (type === "DEADLINE_APPROACHING") return "text-red-400";
  return "text-slate-400";
}

// ───────────────────────────────────────────────────
// Relative time helper
// ───────────────────────────────────────────────────
function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ───────────────────────────────────────────────────
// Props
// ───────────────────────────────────────────────────

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ───────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────
export function NotificationDrawer({
  isOpen,
  onClose,
}: NotificationDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();

  // ── Filter logic ──────────────────────────────────
  const filteredNotifications = notifications
    .filter((n: Notification) => {
      switch (activeFilter) {
        case "unread":
          return !n.isRead;
        case "bids":
          return BID_TYPES.includes(n.type);
        case "documents":
          return DOCUMENT_TYPES.includes(n.type);
        case "projects":
          return PROJECT_TYPES.includes(n.type);
        default:
          return true;
      }
    })
    .sort(
      (a: Notification, b: Notification) =>        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const unreadCount = notifications.filter(
    (n: Notification) => !n.isRead
  ).length;

  // ── Mark all as read ──────────────────────────────
  const handleMarkAllRead = useCallback(() => {
    notifications
      .filter((n: Notification) => !n.isRead)
      .forEach((n: Notification) => markAsRead(n.id));
  }, [notifications, markAsRead]);

  // ── Click notification ────────────────────────────
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
      if (notification.deepLinkUrl) {
        onClose();
        router.push(notification.deepLinkUrl);
      }
    },
    [markAsRead, onClose, router]
  );

  // ── Click outside to close ────────────────────────
  useEffect(() => {    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // Delay to prevent the opening click from immediately closing
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ── Escape key to close ───────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Lock body scroll when open ────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[400px] max-w-[100vw] flex-col transition-transform duration-300 ease-out",
          "border-l border-slate-800/60",
          "bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-150",
          "shadow-2xl shadow-black/40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-500/15 px-1.5 text-[11px] font-semibold text-sky-400">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (              <button
                onClick={handleMarkAllRead}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/10 hover:text-sky-300"
              >
                Mark all read
              </button>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Filter pills ───────────────────────────── */}
        <div className="flex gap-1.5 border-b border-slate-800/60 px-5 py-3">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setActiveFilter(pill.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150",
                activeFilter === pill.key
                  ? "bg-sky-500/15 text-sky-400 shadow-sm shadow-sky-500/10"                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* ── Notification list ──────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-dark">
          {isLoading ? (
            <NotificationSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState activeFilter={activeFilter} />
          ) : (
            <ul className="divide-y divide-slate-800/40">
              {filteredNotifications.map((notification: Notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
// ───────────────────────────────────────────────────
// Notification row
// ───────────────────────────────────────────────────

interface NotificationRowProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationRow({ notification, onClick }: NotificationRowProps) {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationIconColor(notification.type);

  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "group flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors",
          "hover:bg-slate-800/60",
          notification.deepLinkUrl && "cursor-pointer",
          !notification.isRead && "bg-slate-900/40"
        )}
        style={{ minHeight: "60px" }}
      >
        {/* Unread indicator */}
        <div className="flex w-2 shrink-0 items-center pt-2">
          {!notification.isRead && (            <span className="block h-2 w-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/40" />
          )}
        </div>

        {/* Type icon */}
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            "bg-slate-800/80 transition-colors group-hover:bg-slate-700/80"
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "truncate text-sm leading-tight",
                notification.isRead
                  ? "font-medium text-slate-400"
                  : "font-semibold text-slate-200"
              )}
            >
              {notification.title}
            </p>
            <span className="shrink-0 text-[11px] text-slate-600">
              {formatRelativeTime(notification.createdAt)}            </span>
          </div>
          <p className="mt-0.5 truncate text-xs leading-relaxed text-slate-500">
            {notification.message}
          </p>
        </div>
      </button>
    </li>
  );
}

// ───────────────────────────────────────────────────
// Empty state
// ───────────────────────────────────────────────────

function EmptyState({ activeFilter }: { activeFilter: FilterKey }) {
  const message =
    activeFilter === "all" || activeFilter === "unread"
      ? "You're all caught up!"
      : `No ${activeFilter} notifications`;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60">
        <BellOff className="h-6 w-6 text-slate-600" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400">{message}</p>
      <p className="mt-1 text-xs text-slate-600">        We&apos;ll notify you when something needs your attention.
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────
// Loading skeleton
// ───────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="divide-y divide-slate-800/40">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-5 py-3.5">
          <div className="w-2 shrink-0" />
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
