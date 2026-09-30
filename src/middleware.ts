import { NextResponse, type NextRequest } from "next/server";

// Guards every /admin page (not the API routes — those check the cookie or
// password themselves) except the login page. No accounts, just a single
// shared password compared against the session cookie set at login.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session")?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || session !== adminPassword) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
