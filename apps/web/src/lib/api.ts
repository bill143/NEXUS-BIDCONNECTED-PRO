import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type AuthenticatedUser } from "@/lib/auth-helpers";

// ─────────────────────────────────────────
// Standard JSON response helpers
// ─────────────────────────────────────────

export function apiResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, unknown>,
): NextResponse {
  const body: Record<string, unknown> = { data };
  if (meta) {
    body.meta = meta;
  }
  return NextResponse.json(body, { status });
}

export function apiError(
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: httpStatusToCode(status),
        message,        ...(details !== undefined && { details }),
      },
    },
    { status },
  );
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 429:
      return "TOO_MANY_REQUESTS";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}
// ─────────────────────────────────────────
// Pagination / search-params parsing
// ─────────────────────────────────────────

export interface ParsedSearchParams {
  page: number;
  limit: number;
  skip: number;
  sort: string;
  order: "asc" | "desc";
  search: string;
  raw: URLSearchParams;
}

export function parseSearchParams(
  url: URL,
  defaults?: { sort?: string; order?: "asc" | "desc"; limit?: number },
): ParsedSearchParams {
  const params = url.searchParams;

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(params.get("limit") ?? String(defaults?.limit ?? 25), 10) || 25),
  );
  const sort = params.get("sort") ?? defaults?.sort ?? "createdAt";
  const orderRaw = params.get("order")?.toLowerCase();  const order: "asc" | "desc" =
    orderRaw === "asc" || orderRaw === "desc" ? orderRaw : defaults?.order ?? "desc";
  const search = (params.get("search") ?? "").trim();

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sort,
    order,
    search,
    raw: params,
  };
}

// ─────────────────────────────────────────
// Pagination meta builder
// ─────────────────────────────────────────

export function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}
// ─────────────────────────────────────────
// Auth higher-order function for route handlers
// ─────────────────────────────────────────

type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: Record<string, string> },
  user: AuthenticatedUser,
) => Promise<NextResponse>;

/**
 * Wraps a route handler to require authentication.
 * The authenticated user is injected as the third argument.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return apiError("Authentication required", 401);
      }

      if (!user.isActive) {
        return apiError("Account is deactivated", 403);
      }
      return await handler(req, context, user);
    } catch (error) {
      console.error("[API] Unhandled error:", error);

      if (error instanceof Error && error.message.startsWith("Access denied")) {
        return apiError(error.message, 403);
      }

      return apiError("Internal server error", 500);
    }
  };
}
