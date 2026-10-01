import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createProject } from "@/lib/projects";
import { sendClientConfirmationEmail, sendInternalNotificationEmail } from "@/lib/emails";
import { incrementPromoCodeUsage } from "@/lib/promo-codes";
import type { ProductType } from "@/lib/products";

type CreateProjectPayload = {
  paymentIntentId: string;
  product: ProductType;
  siteType?: "ecommerce" | "marketing" | null;
  platform?: "shopify" | "framer" | "custom" | null;
  skuCount?: number | null;
  details: {
    name: string;
    email: string;
    company: string;
    brandFileName: string | null;
    brandFileUrl: string | null;
    currentProductFileName: string | null;
    currentProductFileUrl: string | null;
    currentProductLink: string;
    dielineFileName?: string | null;
    dielineFileUrl?: string | null;
    links: string[];
    notes: string;
  };
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateProjectPayload | null;

  if (!body?.paymentIntentId || !body.product || !body.details) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify the payment actually succeeded server-side — never trust the
  // client's word for it before creating a project record.
  const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json({ error: "Payment has not succeeded" }, { status: 402 });
  }

  if (paymentIntent.metadata?.product !== body.product) {
    return NextResponse.json({ error: "Product mismatch" }, { status: 400 });
  }

  const { details, product, siteType, platform, skuCount } = body;

  // totalPrice comes from the metadata set when the deposit PaymentIntent was
  // created — the actual Stripe charge (paymentIntent.amount) is only the
  // deposit (half), not the total project price.
  const totalPrice = Number(paymentIntent.metadata?.totalPrice) || paymentIntent.amount / 100;
  const depositAmount = paymentIntent.amount / 100;
  const balanceAmount = totalPrice - depositAmount;
  const promoCodeId = paymentIntent.metadata?.promoCodeId || null;
  const promoCode = paymentIntent.metadata?.promoCode || null;
  const discountAmount = Number(paymentIntent.metadata?.discountAmount) || 0;

  const project = await createProject({
    clientName: details.name,
    clientEmail: details.email,
    company: details.company || null,
    product,
    price: totalPrice,
    stripePaymentIntentId: paymentIntent.id,
    depositAmount,
    balanceAmount,
    brandFileName: details.brandFileName,
    brandFileUrl: details.brandFileUrl,
    currentProductLink: details.currentProductLink || null,
    currentProductFileName: details.currentProductFileName,
    currentProductFileUrl: details.currentProductFileUrl,
    dielineFileName: details.dielineFileName ?? null,
    dielineFileUrl: details.dielineFileUrl ?? null,
    inspirationLinks: details.links.filter((l) => l.trim()),
    notes: details.notes || null,
    siteType: siteType ?? null,
    platform: platform ?? null,
    skuCount: product === "package" ? (skuCount ?? null) : null,
    promoCode,
    discountAmount,
  });

  if (promoCodeId) {
    await incrementPromoCodeUsage(promoCodeId).catch((err) =>
      console.error("Failed to increment promo code usage", err)
    );
  }

  // Fire both emails in parallel — neither should block the customer's
  // success screen on failing; worth alerting on separately, but not
  // their problem.
  await Promise.all([
    sendClientConfirmationEmail(project).catch(() =>
      console.error("Failed to send client confirmation email")
    ),
    sendInternalNotificationEmail(project).catch(() =>
      console.error("Failed to send internal notification email")
    ),
  ]);

  return NextResponse.json({ ok: true, projectId: project.id });
}
