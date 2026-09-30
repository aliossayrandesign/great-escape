import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getResend, ORDER_NOTIFICATION_TO } from "@/lib/resend";
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
    brandFileUrl: string | null;
    currentProductFileName: string | null;
    currentProductFileUrl: string | null;
    currentProductLink: string;
    links: string[];
    notes: string;
  };
};

function fileLink(name: string | null, url: string | null) {
  if (url) {
    return `<a href="${url}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(name ?? "Download file")} →</a>`;
  }
  if (name) {
    return `${escapeHtml(name)} <span style="color:#8a8a8a;">(upload didn't finish — ask the customer to resend)</span>`;
  }
  return `<span style="color:#8a8a8a;">None provided</span>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function label(text: string, color: string = "#ff8a8a") {
  return `<div style="font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:${color};">+ ${escapeHtml(text)} +</div>`;
}

// This is the internal "heads up, a new brief came in" notification — kept
// plain and scannable since it's operational, not a brand moment. The
// client-facing confirmation (with the full branded treatment) lives at
// /api/send-order-confirmation.
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
    .map(
      (link) =>
        `<div style="margin-top:6px;"><a href="${escapeHtml(link)}" style="color:#ff8a8a; text-decoration:none; font-size:14px;">${escapeHtml(link)}</a></div>`
    )
    .join("");

  const section = (labelHtml: string, content: string) => `
    <tr>
      <td style="padding:20px 32px; border-top:1px solid #262626;">
        ${labelHtml}
        <div style="margin-top:8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:15px; line-height:1.6; color:#f3f3f3;">
          ${content}
        </div>
      </td>
    </tr>
  `;

  const html = `
    <div style="background:#0a0a0a; padding:40px 16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <table role="presentation" width="100%" style="max-width:560px; margin:0 auto; border-collapse:collapse; background:#141414; border:1px solid #262626; border-radius:20px; overflow:hidden;">
        <tr>
          <td style="padding:28px 32px 24px;">
            ${label("New Client")}
            <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
              ${escapeHtml(details.name)}
            </div>
            <div style="margin-top:4px; font-size:14px; color:#a8a8a8;">
              ${escapeHtml(PRODUCT_LABEL[product])} · $${price.toLocaleString()}
            </div>
            <a href="${dashboardUrl}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
              View payment in Stripe →
            </a>
          </td>
        </tr>

        ${section(
          label("Contact"),
          `${escapeHtml(details.email)}<br/>${details.company ? escapeHtml(details.company) : `<span style="color:#8a8a8a;">No company given</span>`}`
        )}

        ${
          product === "website" && siteType
            ? section(label("Platform"), `${escapeHtml(siteType)} · ${escapeHtml(platform ?? "n/a")}`)
            : ""
        }

        ${section(
          label("Brand file"),
          fileLink(details.brandFileName, details.brandFileUrl)
        )}

        ${section(
          label("Current product"),
          details.currentProductLink
            ? `<a href="${escapeHtml(details.currentProductLink)}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(details.currentProductLink)}</a>`
            : fileLink(details.currentProductFileName, details.currentProductFileUrl)
        )}

        ${section(
          label("Inspiration links"),
          linkRows || `<span style="color:#8a8a8a;">None provided</span>`
        )}

        ${section(
          label("Notes"),
          details.notes
            ? escapeHtml(details.notes).replace(/\n/g, "<br/>")
            : `<span style="color:#8a8a8a;">None provided</span>`
        )}
      </table>
    </div>
  `;

  const text = [
    `New client: ${details.name}`,
    `${PRODUCT_LABEL[product]} · $${price.toLocaleString()}`,
    `View payment in Stripe: ${dashboardUrl}`,
    "",
    `Contact: ${details.email}${details.company ? ` — ${details.company}` : ""}`,
    product === "website" && siteType ? `Platform: ${siteType} — ${platform ?? "n/a"}` : "",
    `Brand file: ${details.brandFileUrl ?? details.brandFileName ?? "None provided"}`,
    `Current product: ${details.currentProductLink || details.currentProductFileUrl || details.currentProductFileName || "None provided"}`,
    `Inspiration links: ${details.links.filter((l) => l.trim()).join(", ") || "None provided"}`,
    `Notes: ${details.notes || "None provided"}`,
  ]
    .filter(Boolean)
    .join("\n");

  const { error: sendError } = await getResend().emails.send({
    from: "Great Escape <orders@greatescape.studio>",
    to: ORDER_NOTIFICATION_TO,
    subject: `New client: ${details.name} · ${PRODUCT_LABEL[product]}`,
    html,
    text,
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
