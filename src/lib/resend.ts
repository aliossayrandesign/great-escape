import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(apiKey);

export const ORDER_NOTIFICATION_TO =
  process.env.ORDER_NOTIFICATION_EMAIL ?? "greatesc_studio@gmail.com";
