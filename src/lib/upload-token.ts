import { createHmac, timingSafeEqual } from "crypto";

// Short-lived signed token minted for a browser starting the intake flow,
// required by /api/upload before it will hand out a Blob upload token.
// Without this, anyone who found /api/upload could request upload tokens
// directly and store arbitrary files in our Blob storage for free.
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours — generous for filling out the form

function secret(): string {
  const value = process.env.UPLOAD_TOKEN_SECRET;
  if (!value) throw new Error("UPLOAD_TOKEN_SECRET is not set");
  return value;
}

function sign(expires: number): string {
  return createHmac("sha256", secret()).update(String(expires)).digest("hex");
}

export function signUploadToken(): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  return `${expires}.${sign(expires)}`;
}

export function verifyUploadToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expires || !signature || Date.now() > expires) return false;

  const expected = sign(expires);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
