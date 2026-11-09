import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/features/admin/auth/constants";
import { findRedirect } from "@/features/admin/redirects-cache";

/**
 * Host routing for the admin. In production the admin lives only on
 * ADMIN_HOST (admin.sedrakidsegypt.com); the public domain answers 404 for
 * /admin. Without ADMIN_HOST (local development) nothing changes.
 * This is only a first filter: every admin page and action also checks the
 * session itself (requireAdmin).
 */
export async function proxy(request: NextRequest) {
  const adminHost = process.env.ADMIN_HOST;
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  // Optimistic filter: no session cookie means go to the login page (a real 307).
  // The signature is verified by requireAdmin() on every page and action.
  const onAdminHost = !adminHost || request.headers.get("host")?.split(":")[0] === adminHost;
  if (
    (isAdminPath || (adminHost && onAdminHost && pathname === "/")) &&
    pathname !== "/admin/login" &&
    !request.cookies.has(SESSION_COOKIE) &&
    onAdminHost
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Retired product/collection URLs (renamed or removed in the admin): real 308 redirect.
  if (pathname.startsWith("/products/") || pathname.startsWith("/collections/")) {
    const target = await findRedirect(pathname);
    if (target) return NextResponse.redirect(new URL(target, request.url), 308);
  }

  if (!adminHost) return NextResponse.next();

  const host = request.headers.get("host")?.split(":")[0];

  if (host === adminHost) {
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", {
        headers: { "content-type": "text/plain", "x-robots-tag": "noindex" },
      });
    }
    let response: NextResponse;
    if (pathname === "/") {
      response = NextResponse.rewrite(new URL("/admin", request.url));
    } else if (isAdminPath || pathname.startsWith("/media/") || pathname === "/icon.png") {
      response = NextResponse.next();
    } else {
      return new NextResponse("Not found", { status: 404 });
    }
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    return response;
  }

  if (isAdminPath) return new NextResponse("Not found", { status: 404 });
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
