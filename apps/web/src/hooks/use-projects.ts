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
}

interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;  };
}

export interface ProjectFilters {
  scope?: "mine" | "office" | "company";
  status?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  tag?: string;
  csi?: string;
  lead?: string;
}

export interface CreateProjectInput {
  name: string;
  number?: string | null;
  status?: string;
  projectType?: string;
  estimatedValue?: number | null;
  description?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string;  clientName?: string | null;
  bidsDueAt?: string | null;
  bidsDueTimezone?: string;
  dueToClientAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  leadUserId?: string;
  officeId?: string | null;
  visibility?: string;
  csiDivisions?: string[];
  tags?: string[];
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
  isMuted?: boolean;
}

export interface CreateCommentInput {
  body: string;
  mentionedUserIds?: string[];
  parentId?: string | null;
}

// ─────────────────────────────────────────
// Fetch helper
// ─────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {  const res = await fetch(url, {
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
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ─────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  activity: (id: string) => [...projectKeys.all, "activity", id] as const,
  comments: (id: string) => [...projectKeys.all, "comments", id] as const,
  members: (id: string) => [...projectKeys.all, "members", id] as const,
};

// ─────────────────────────────────────────
// useProjects — list with filters & pagination
// ─────────────────────────────────────────

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () =>
      apiFetch<ApiResponse<unknown[]>>(
        `/api/v1/projects${buildQueryString(filters)}`,
      ),
  });
}

// ─────────────────────────────────────────
// useProject — single project detail
// ─────────────────────────────────────────
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => apiFetch<ApiResponse<unknown>>(`/api/v1/projects/${id}`),
    enabled: !!id,
  });
}

// ─────────────────────────────────────────
// useCreateProject
// ─────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiFetch<ApiResponse<unknown>>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────
// useUpdateProject// ─────────────────────────────────────────

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProjectInput) =>
      apiFetch<ApiResponse<unknown>>(`/api/v1/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────
// useDeleteProject
// ─────────────────────────────────────────

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ApiResponse<unknown>>(`/api/v1/projects/${id}`, {        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────
// useProjectActivity
// ─────────────────────────────────────────

export function useProjectActivity(
  id: string | undefined,
  options?: { page?: number; limit?: number },
) {
  const params = buildQueryString({
    page: options?.page ?? 1,
    limit: options?.limit ?? 30,
  });

  return useQuery({
    queryKey: [...projectKeys.activity(id!), options],
    queryFn: () =>
      apiFetch<ApiResponse<unknown[]>>(
        `/api/v1/projects/${id}/activity${params}`,
      ),
    enabled: !!id,
  });
}
// ─────────────────────────────────────────
// useProjectComments
// ─────────────────────────────────────────

export function useProjectComments(
  id: string | undefined,
  options?: { page?: number; limit?: number },
) {
  const params = buildQueryString({
    page: options?.page ?? 1,
    limit: options?.limit ?? 25,
  });

  return useQuery({
    queryKey: [...projectKeys.comments(id!), options],
    queryFn: () =>
      apiFetch<ApiResponse<unknown[]>>(
        `/api/v1/projects/${id}/comments${params}`,
      ),
    enabled: !!id,
  });
}

// ─────────────────────────────────────────
// useCreateComment
// ─────────────────────────────────────────

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      apiFetch<ApiResponse<unknown>>(`/api/v1/projects/${projectId}/comments`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.comments(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.activity(projectId),
      });
    },
  });
}

// ─────────────────────────────────────────
// useProjectMembers
// ─────────────────────────────────────────

export function useProjectMembers(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.members(id!),
    queryFn: () =>
      apiFetch<ApiResponse<unknown[]>>(`/api/v1/projects/${id}/members`),
    enabled: !!id,
  });
}
// ─────────────────────────────────────────
// useAddProjectMember
// ─────────────────────────────────────────

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; role?: string }) =>
      apiFetch<ApiResponse<unknown>>(`/api/v1/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}

// ─────────────────────────────────────────
// useRemoveProjectMember
// ─────────────────────────────────────────
export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<ApiResponse<unknown>>(`/api/v1/projects/${projectId}/members`, {
        method: "DELETE",
        body: JSON.stringify({ _method: "DELETE", userId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}
