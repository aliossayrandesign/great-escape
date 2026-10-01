import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  createProject,
  getProject,
  getProjectByPaymentIntentId,
  markBalancePaid,
} from "@/lib/projects";
import {
  sendClientConfirmationEmail,
  sendInternalNotificationEmail,
  sendBalancePaidEmail,
} from "@/lib/emails";
import { parsePaymentMetadata } from "@/lib/payment-metadata";
import type { ProductType } from "@/lib/products";

const VALID_PRODUCTS: ProductType[] = ["website", "app", "deck", "package"];

// Fallback safety net: if the client's browser never completes its own
// POST to /api/create-project right after a successful charge (closed tab,
// dropped connection, crashed before the request finished), this webhook —
// driven by Stripe's own servers, not the customer's browser — creates the
// project and sends the same emails, so a charge never silently goes
// unrecorded.
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  if (paymentIntent.metadata?.kind === "balance") {
    const projectId = paymentIntent.metadata.projectId;
    try {
      const project = projectId ? await getProject(projectId) : null;
      if (!project) {
        console.error("Stripe webhook: balance payment for unknown project", projectId);
        return NextResponse.json({ ok: true, skipped: "unknown project" });
      }
      const alreadyPaid = Boolean(project.balancePaidAt);
      await markBalancePaid(project.id);
      if (!alreadyPaid) {
        const updated = await getProject(project.id);
        if (updated) {
          await sendBalancePaidEmail(updated).catch((err) =>
            console.error("Webhook fallback: failed to send balance-paid email", err)
          );
        }
        console.warn(
          `Stripe webhook marked balance paid as a fallback for project ${project.id}, payment intent ${paymentIntent.id}`
        );
      }
      return NextResponse.json({ ok: true, balancePaid: project.id });
    } catch (error) {
      console.error("Stripe webhook: failed to process balance payment", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  try {
    const existing = await getProjectByPaymentIntentId(paymentIntent.id);
    if (existing) {
      return NextResponse.json({ ok: true, skipped: "already exists" });
    }

    const parsed = parsePaymentMetadata(paymentIntent.metadata as Record<string, string>);
    if (!VALID_PRODUCTS.includes(parsed.product)) {
      console.error(
        "Stripe webhook: payment intent missing valid product metadata",
        paymentIntent.id
      );
      return NextResponse.json({ ok: true, skipped: "no product metadata" });
    }

    // totalPrice comes from metadata set when the deposit PaymentIntent was
    // created — paymentIntent.amount is only the deposit (half), not the
    // total project price. Matches /api/create-project's approach.
    const depositAmount = paymentIntent.amount / 100;
    const totalPrice = parsed.totalPrice || depositAmount;
    const balanceAmount = totalPrice - depositAmount;

    const project = await createProject({
      clientName: parsed.name,
      clientEmail: parsed.email,
      company: parsed.company,
      product: parsed.product,
      price: totalPrice,
      stripePaymentIntentId: paymentIntent.id,
      depositAmount,
      balanceAmount,
      brandFileName: parsed.brandFileName,
      brandFileUrl: parsed.brandFileUrl,
      currentProductLink: parsed.currentProductLink,
      currentProductFileName: parsed.currentProductFileName,
      currentProductFileUrl: parsed.currentProductFileUrl,
      dielineFileName: parsed.dielineFileName,
      dielineFileUrl: parsed.dielineFileUrl,
      inspirationLinks: parsed.links,
      notes: parsed.notes,
      siteType: parsed.siteType,
      platform: parsed.platform,
      skuCount: parsed.product === "package" ? parsed.skuCount : null,
    });

    console.warn(
      `Stripe webhook created project ${project.id} as a fallback — /api/create-project was never completed for payment intent ${paymentIntent.id}`
    );

    await Promise.all([
      sendClientConfirmationEmail(project).catch((err) =>
        console.error("Webhook fallback: failed to send client confirmation email", err)
      ),
      sendInternalNotificationEmail(project).catch((err) =>
        console.error("Webhook fallback: failed to send internal notification email", err)
      ),
    ]);

    return NextResponse.json({ ok: true, created: project.id });
  } catch (error) {
    // A unique-violation on stripe_payment_intent_id means the normal
    // client-side call won the race and created it first — not an error.
    if ((error as { code?: string } | null)?.code === "23505") {
      return NextResponse.json({ ok: true, skipped: "race" });
    }
    console.error("Stripe webhook: failed to process payment_intent.succeeded", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
