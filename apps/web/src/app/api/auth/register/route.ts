import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@bidconnect/db";
import { hashPassword } from "@/lib/auth-helpers";

/**
 * Registration endpoint — creates a new Organization and its first User
 * (SUPER_ADMIN). This is the entry-point for new tenants in BidConnect Pro.
 *
 * Password storage: The hashed password is stored in `user.preferences._auth.passwordHash`
 * because the Prisma User model does not yet have a dedicated `passwordHash` column.
 * A schema migration to add `passwordHash String?` to the User model should be performed;
 * after that migration the hash should be read/written from the column instead of JSON.
 */

const registerSchema = z.object({
  email: z
    .string()
    .email("A valid email address is required.")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
  firstName: z    .string()
    .min(1, "First name is required.")
    .max(100),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(100),
  companyName: z
    .string()
    .min(1, "Company name is required.")
    .max(200),
});

/**
 * Derive a URL-safe slug from a company name.
 * Strips non-alphanumeric chars, collapses whitespace into hyphens,
 * lower-cases, and trims leading/trailing hyphens.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")    .replace(/^-|-$/g, "");
}

/**
 * Ensure the slug is unique within the organizations table by appending
 * a numeric suffix when collisions are detected.
 */
async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.organization.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, errors: fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, companyName } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,          errors: { email: ["An account with this email already exists."] },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const slug = await uniqueSlug(slugify(companyName));

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: companyName.trim(),
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: "SUPER_ADMIN",
          isActive: true,          isInternal: true,
          preferences: {
            _auth: {
              passwordHash,
            },
          },
        },
      });

      return { organization, user };
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[register] Unhandled error:", error);    return NextResponse.json(
      { success: false, errors: { _form: ["Registration failed. Please try again."] } },
      { status: 500 }
    );
  }
}
