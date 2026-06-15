import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { hash, compare } from "bcryptjs";
import { prisma } from "@bidconnect/db";
import type { UserRole } from "@bidconnect/types";
import { authOptions } from "@/lib/auth";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Shape returned by getCurrentUser — the authenticated user record
 * joined with their organization.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  organizationId: string;
  organization: {
    id: string;
    name: string;    slug: string;
    plan: string;
    defaultTimezone: string;
    defaultCurrency: string;
  };
}

/**
 * Retrieve the currently authenticated user from the server session.
 * Returns `null` when no valid session exists.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,      lastName: true,
      role: true,
      isActive: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          defaultTimezone: true,
          defaultCurrency: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user as AuthenticatedUser;
}

/** * Require an authenticated user. Redirects to /login if the session
 * is missing or the user record cannot be resolved.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Require the authenticated user to hold one of the specified roles.
 * Redirects to /login when unauthenticated, throws a 403-style error
 * when the user's role is not in the allowed set.
 */
export async function requireRole(
  roles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new Error(      `Access denied. Required role: ${roles.join(" | ")}. Current role: ${user.role}.`
    );
  }

  return user;
}

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
