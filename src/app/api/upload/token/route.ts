import { NextResponse } from "next/server";
import { signUploadToken } from "@/lib/upload-token";

// Mints a short-lived token the browser must present to /api/upload. Anyone
// can call this (no login on the intake flow), but the token only proves
// "a browser loaded our site recently" — enough to stop drive-by scripts
// from hitting /api/upload directly, without adding friction for clients.
export async function POST() {
  return NextResponse.json({ token: signUploadToken() });
}
