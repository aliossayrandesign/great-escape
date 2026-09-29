import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { resend, ORDER_NOTIFICATION_TO } from "@/lib/resend";
import { PRODUCT_LABEL, PRODUCT_PRICE, type ProductType } from "@/lib/products";

type OrderPayload = {
  paymentIntentId: string;
  product: ProductType;
  siteType?: "ecommerce" | "marketing" | null;
  platform?: "shopify" | "framer" | "custom" | null;
  details: {
    name: string;
    email: string;
    company: string;
    brandFileName: string | null;
    currentProductFileName: string | null;
    currentProductLink: string;
    links: string[];
    notes: string;
  };
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as OrderPayload | null;

  if (!body?.paymentIntentId || !body.product || !body.details) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify the payment actually succeeded server-side — never trust the
  // client's word for it before sending a "you got paid" notification.
  const paymentIntent = await stripe.paymentIntents.retrieve(
    body.paymentIntentId
  );

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: "Payment has not succeeded" },
      { status: 402 }
    );
  }

  if (paymentIntent.metadata?.product !== body.product) {
    return NextResponse.json({ error: "Product mismatch" }, { status: 400 });
  }

  const { details, product, siteType, platform } = body;
  const price = PRODUCT_PRICE[product];
  const dashboardUrl = `https://dashboard.stripe.com/test/payments/${paymentIntent.id}`;

  const linkRows = details.links
    .filter((link) => link.trim())
    .map((link) => `<li>${escapeHtml(link)}</li>`)
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>New order — ${escapeHtml(PRODUCT_LABEL[product])} ($${price.toLocaleString()})</h2>
      <p><a href="${dashboardUrl}">View payment in Stripe →</a></p>

      <h3>Contact</h3>
      <p>
        ${escapeHtml(details.name)}<br/>
        ${escapeHtml(details.email)}<br/>
        ${details.company ? escapeHtml(details.company) : "<em>No company given</em>"}
      </p>

      ${
        product === "website" && siteType
          ? `<h3>Platform</h3><p>${escapeHtml(siteType)} — ${escapeHtml(platform ?? "n/a")}</p>`
          : ""
      }

      <h3>Brand file</h3>
      <p>${details.brandFileName ? escapeHtml(details.brandFileName) + " (uploaded — file attachments coming soon, ask customer to resend for now)" : "None provided"}</p>

      <h3>Current product</h3>
      <p>${details.currentProductLink ? `<a href="${escapeHtml(details.currentProductLink)}">${escapeHtml(details.currentProductLink)}</a>` : details.currentProductFileName ? escapeHtml(details.currentProductFileName) + " (file attachments coming soon)" : "None provided"}</p>

      <h3>Inspiration links</h3>
      ${linkRows ? `<ul>${linkRows}</ul>` : "<p>None provided</p>"}

      <h3>Notes</h3>
      <p>${details.notes ? escapeHtml(details.notes).replace(/\n/g, "<br/>") : "None provided"}</p>
    </div>
  `;

  const { error: sendError } = await resend.emails.send({
    from: "great esc. <onboarding@resend.dev>",
    to: ORDER_NOTIFICATION_TO,
    subject: `New order: ${PRODUCT_LABEL[product]} — ${details.name}`,
    html,
  });

  if (sendError) {
    console.error("Resend failed to send order notification:", sendError);
    return NextResponse.json(
      { error: "Failed to send notification email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
