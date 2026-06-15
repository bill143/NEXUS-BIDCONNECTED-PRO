"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  unreadCount: number;
}

interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

interface ApiError {
  error: {
    code: string;
    message: string;    details?: unknown;
  };
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

interface Notification {
  id: string;
  userId: string;
  projectId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  deepLinkUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    number: string | null;
    status: string;  } | null;
}

// ─────────────────────────────────────────
// Fetch helper
// ─────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message ?? `Request failed with status ${res.status}`);
  }

  return json as T;
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ─────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationFilters) =>
    [...notificationKeys.lists(), filters] as const,
};

// ─────────────────────────────────────────
// useNotifications — with 30s auto-refetch
// ─────────────────────────────────────────

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () =>
      apiFetch<ApiResponse<Notification[]>>(
        `/api/v1/notifications${buildQueryString(filters)}`,
      ),
    refetchInterval: 30_000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Only when tab is focused
  });
}
// ─────────────────────────────────────────
// useUnreadCount — derived from notifications query
// ─────────────────────────────────────────

export function useUnreadCount() {
  const { data } = useNotifications({ limit: 1 });

  return (data?.meta?.unreadCount ?? 0) as number;
}

// ─────────────────────────────────────────
// useMarkNotificationRead
// ─────────────────────────────────────────

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiFetch<ApiResponse<Notification>>(
        `/api/v1/notifications/${notificationId}/read`,
        { method: "PATCH" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}
// ─────────────────────────────────────────
// useMarkAllRead
// ─────────────────────────────────────────

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<ApiResponse<{ success: boolean; markedRead: number }>>(
        "/api/v1/notifications",
        {
          method: "POST",
          body: JSON.stringify({ action: "read-all" }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}
