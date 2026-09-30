import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

// Lazily constructed — same reasoning as resend.ts/stripe.ts: a missing
// DATABASE_URL should only fail requests that touch the database, not
// break the entire production build.
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({ connectionString });
    // Keeps the pool alive across invocations on Vercel's Fluid Compute
    // instead of reconnecting every request.
    attachDatabasePool(pool);
  }
  return pool;
}

export function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params);
}
