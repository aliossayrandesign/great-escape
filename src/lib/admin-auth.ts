import { cookies } from "next/headers";

// Middleware only guards /admin pages, not /api routes — each admin-only
// API route calls this directly to check the same session cookie.
export async function isAdminRequest(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const store = await cookies();
  return store.get("admin_session")?.value === adminPassword;
}
