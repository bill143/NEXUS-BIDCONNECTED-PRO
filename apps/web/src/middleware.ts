import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Next.js middleware for BidConnect Pro authentication.
 *
 * Protected routes: everything under /(dashboard) group layouts, plus
 * any /projects, /settings, /companies, etc. routes that require login.
 *
 * Public routes (excluded via matcher):
 *   /login, /register, /api/auth/*, /bid/* (public portal), / (landing)
 *
 * Authenticated users visiting /login or /register are redirected to /projects.
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token && (pathname === "/login" || pathname === "/register")) {
      const url = req.nextUrl.clone();
      url.pathname = "/projects";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        const publicPaths = [
          "/login",
          "/register",
          "/api/auth",
          "/bid",
          "/",
        ];

        const isPublic = publicPaths.some((path) => {
          if (path === "/") {
            return pathname === "/";
          }
          return pathname === path || pathname.startsWith(`${path}/`);
        });

        if (isPublic) {          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets in /images, /fonts, /icons
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|images/|fonts/|icons/).*)",
  ],
};
