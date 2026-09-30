import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getResend } from "@/lib/resend";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fileLink(name: string | null, url: string | null) {
  if (url) {
    return `<a href="${url}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(name ?? "View file")} →</a>`;
  }
  if (name) {
    return `${escapeHtml(name)} <span style="color:#8a8a8a;">(upload didn't finish — you may want to resend this)</span>`;
  }
  return `<span style="color:#8a8a8a;">None provided</span>`;
}

const LABEL_TEXT = {
  confirmed: "Confirmed",
  contact: "Submitted by",
  platform: "Platform",
  brandFile: "Brand file",
  currentProduct: "Current product",
  inspiration: "Inspiration links",
  notes: "Notes",
  footer: "Escape the ordinary",
} as const;

function labelImg(key: keyof typeof LABEL_TEXT, color: string = "#ff8a8a") {
  return `<div style="font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:${color};">+ ${escapeHtml(LABEL_TEXT[key])} +</div>`;
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
          <td style="padding:0;">
            <img
              src="https://great-escape-five.vercel.app/images/email/mason-caption.png"
              width="560"
              height="313"
              alt="The work begins…"
              style="display:block; width:100%; height:auto;"
            />
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px;">
            ${labelImg("confirmed")}
            <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
              ${escapeHtml(PRODUCT_LABEL[product])} · $${price.toLocaleString()}
            </div>
            <p style="margin-top:14px; font-size:14px; line-height:1.6; color:#a8a8a8;">
              First look delivered within 1 week. Up to 3 rounds of revisions included.
            </p>
          </td>
        </tr>

        ${section(
          labelImg("contact"),
          `${escapeHtml(details.name)}<br/>${escapeHtml(details.email)}<br/>${details.company ? escapeHtml(details.company) : `<span style="color:#8a8a8a;">No company given</span>`}`
        )}

        ${
          product === "website" && siteType
            ? section(labelImg("platform"), `${escapeHtml(siteType)} · ${escapeHtml(platform ?? "n/a")}`)
            : ""
        }

        ${section(
          labelImg("brandFile"),
          fileLink(details.brandFileName, details.brandFileUrl)
        )}

        ${section(
          labelImg("currentProduct"),
          details.currentProductLink
            ? `<a href="${escapeHtml(details.currentProductLink)}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(details.currentProductLink)}</a>`
            : fileLink(details.currentProductFileName, details.currentProductFileUrl)
        )}

        ${section(
          labelImg("inspiration"),
          linkRows || `<span style="color:#8a8a8a;">None provided</span>`
        )}

        ${section(
          labelImg("notes"),
          details.notes
            ? escapeHtml(details.notes).replace(/\n/g, "<br/>")
            : `<span style="color:#8a8a8a;">None provided</span>`
        )}

        <tr>
          <td style="padding:28px 32px 32px; border-top:1px solid #262626; text-align:center;">
            <img
              src="https://great-escape-five.vercel.app/images/email/brandmark.png"
              width="30"
              height="44"
              alt=""
              style="display:inline-block; margin:0 auto;"
            />
            <div style="margin-top:14px; text-align:center;">
              ${labelImg("footer", "#5a5a5a")}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    `Confirmed: ${PRODUCT_LABEL[product]} · $${price.toLocaleString()}`,
    `First look delivered within 1 week. Up to 3 rounds of revisions included.`,
    "",
    `Submitted by: ${details.name} <${details.email}>${details.company ? ` — ${details.company}` : ""}`,
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
    to: details.email,
    subject: `You're locked in — ${PRODUCT_LABEL[product]}`,
    html,
    text,
  });

  if (sendError) {
    console.error("Resend failed to send order confirmation:", sendError);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
