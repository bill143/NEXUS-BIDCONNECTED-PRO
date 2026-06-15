// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CursorPaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface SearchResult<T> {
  items: T[];
  type: string;
  total: number;
}

export interface GlobalSearchResponse {
  projects: SearchResult<ProjectSearchItem>;
  companies: SearchResult<CompanySearchItem>;
  contacts: SearchResult<ContactSearchItem>;
}

export interface ProjectSearchItem {
  id: string;
  name: string;
  number: string | null;
  status: string;
  clientName: string | null;
}

export interface CompanySearchItem {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  primaryTrade: string | null;
}

export interface ContactSearchItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  officeId: string | null;
  avatarUrl: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    defaultTimezone: string;
    defaultCurrency: string;
    plan: string;
  };
}

export interface NotificationPreferences {
  [key: string]: {
    inApp: boolean;
    email: boolean;
  };
}