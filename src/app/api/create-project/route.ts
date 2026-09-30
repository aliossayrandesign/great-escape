import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createProject } from "@/lib/projects";
import { sendClientConfirmationEmail, sendInternalNotificationEmail } from "@/lib/emails";
import { PRODUCT_PRICE, type ProductType } from "@/lib/products";

type CreateProjectPayload = {
  paymentIntentId: string;
  product: ProductType;
  siteType?: "ecommerce" | "marketing" | null;
  platform?: "shopify" | "framer" | "custom" | null;
  details: {
    name: string;
    email: string;
    company: string;
    brandFileName: string | null;
    brandFileUrl: string | null;
    currentProductFileName: string | null;
    currentProductFileUrl: string | null;
    currentProductLink: string;
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

  const { details, product, siteType, platform } = body;

  const project = await createProject({
    clientName: details.name,
    clientEmail: details.email,
    company: details.company || null,
    product,
    price: PRODUCT_PRICE[product],
    stripePaymentIntentId: paymentIntent.id,
    brandFileName: details.brandFileName,
    brandFileUrl: details.brandFileUrl,
    currentProductLink: details.currentProductLink || null,
    currentProductFileName: details.currentProductFileName,
    currentProductFileUrl: details.currentProductFileUrl,
    inspirationLinks: details.links.filter((l) => l.trim()),
    notes: details.notes || null,
    siteType: siteType ?? null,
    platform: platform ?? null,
  });

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
