import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@bidconnect/db";
import type { UserRole } from "@bidconnect/types";

/**
 * NextAuth.js configuration for BidConnect Pro.
 *
 * Authentication strategy: JWT-based sessions with a CredentialsProvider
 * for email/password login. The PrismaAdapter is wired for future OAuth
 * provider support but the JWT strategy bypasses adapter-based session
 * persistence (sessions live in the token, not the database).
 *
 * Password storage: Because the Prisma User model does not yet have a
 * dedicated `passwordHash` column, hashed passwords are stored inside the
 * User.preferences JSON field at `preferences._auth.passwordHash`.
 * A schema migration to add a proper column is recommended.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;      email: string;
      organizationId: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      image?: string | null;
      name?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    organizationId: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    organizationId: string;
    role: UserRole;    firstName: string;
    lastName: string;
  }
}

interface UserPreferences {
  _auth?: {
    passwordHash?: string;
  };
  [key: string]: unknown;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            organizationId: true,
            role: true,            isActive: true,
            preferences: true,
          },
        });

        if (!user) {
          throw new Error("No account found with that email address.");
        }

        if (!user.isActive) {
          throw new Error("This account has been deactivated.");
        }

        const prefs = user.preferences as UserPreferences;
        const passwordHash = prefs?._auth?.passwordHash;

        if (!passwordHash) {
          throw new Error(
            "Password login is not configured for this account."
          );
        }

        const isValid = await compare(credentials.password, passwordHash);

        if (!isValid) {          throw new Error("Invalid password.");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;        token.organizationId = user.organizationId;
        token.role = user.role as UserRole;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.userId,
        organizationId: token.organizationId,
        role: token.role,
        firstName: token.firstName,
        lastName: token.lastName,
        name: `${token.firstName} ${token.lastName}`,
      };
      return session;
    },
  },
};
