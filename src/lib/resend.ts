import { Resend } from "resend";

let client: Resend | null = null;

// Lazily constructed so a missing RESEND_API_KEY only fails requests to
// routes that actually send email, instead of throwing at module load and
// failing the entire production build (as happened before this fix).
export function getResend() {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(apiKey);
  }
  return client;
}

export const ORDER_NOTIFICATION_TO =
  process.env.ORDER_NOTIFICATION_EMAIL ?? "greatesc_studio@gmail.com";
