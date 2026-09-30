import { NextResponse } from "next/server";

// Single shared password, no accounts — matches the rest of this project's
// "one-person studio" auth model (see ADMIN_PASSWORD elsewhere). The cookie
// value is the password itself, checked again by middleware on every
// request; fine for an internal, low-stakes tool behind HttpOnly+Secure.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured" }, { status: 500 });
  }
  if (body?.password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", adminPassword, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
