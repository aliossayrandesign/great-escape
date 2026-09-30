import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
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

// Most email clients (Gmail especially) strip @font-face CSS, so the site's
// actual DM Mono font can't be loaded as a webfont in the email body. To
// keep the recurring "+ LABEL +" eyebrows visually consistent with the site
// anyway, they're rasterized with the real font at request time and
// embedded as data-URI images — those render identically everywhere,
// regardless of what the client's CSS sanitizer allows.
const monoFontBase64 = fs
  .readFileSync(path.join(process.cwd(), "public/fonts-src/DMMono-Medium.ttf"))
  .toString("base64");

async function renderMonoLabel(text: string, color: string) {
  const fontSize = 34;
  const svg = `
    <svg width="1000" height="90" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: 'DM Mono Email';
            src: url(data:font/ttf;base64,${monoFontBase64}) format('truetype');
          }
        </style>
      </defs>
      <text x="0" y="62" font-family="DM Mono Email" font-size="${fontSize}" letter-spacing="3.5" fill="${color}">${text}</text>
    </svg>
  `;
  const buffer = await sharp(Buffer.from(svg)).png().trim().toBuffer();
  const meta = await sharp(buffer).metadata();
  const scale = 1 / 3;
  return {
    src: `data:image/png;base64,${buffer.toString("base64")}`,
    width: Math.round((meta.width ?? 0) * scale),
    height: Math.round((meta.height ?? 0) * scale),
  };
}

async function labelImg(text: string, color: string = "#ff8a8a") {
  const { src, width, height } = await renderMonoLabel(`+ ${text.toUpperCase()} +`, color);
  return `<img src="${src}" width="${width}" height="${height}" alt="${escapeHtml(text)}" style="display:block;" />`;
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
    .map(
      (link) =>
        `<div style="margin-top:6px;"><a href="${escapeHtml(link)}" style="color:#ff8a8a; text-decoration:none; font-size:14px;">${escapeHtml(link)}</a></div>`
    )
    .join("");

  const [
    newOrderLabel,
    contactLabel,
    platformLabel,
    brandFileLabel,
    currentProductLabel,
    inspirationLabel,
    notesLabel,
    footerLabel,
  ] = await Promise.all([
    labelImg("New Order"),
    labelImg("Contact"),
    labelImg("Platform"),
    labelImg("Brand file"),
    labelImg("Current product"),
    labelImg("Inspiration links"),
    labelImg("Notes"),
    labelImg("Escape the ordinary", "#5a5a5a"),
  ]);

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
            ${newOrderLabel}
            <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
              ${escapeHtml(PRODUCT_LABEL[product])} · $${price.toLocaleString()}
            </div>
            <a href="${dashboardUrl}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
              View payment in Stripe →
            </a>
          </td>
        </tr>

        ${section(
          contactLabel,
          `${escapeHtml(details.name)}<br/>${escapeHtml(details.email)}<br/>${details.company ? escapeHtml(details.company) : `<span style="color:#8a8a8a;">No company given</span>`}`
        )}

        ${
          product === "website" && siteType
            ? section(platformLabel, `${escapeHtml(siteType)} · ${escapeHtml(platform ?? "n/a")}`)
            : ""
        }

        ${section(
          brandFileLabel,
          details.brandFileName
            ? escapeHtml(details.brandFileName)
            : `<span style="color:#8a8a8a;">None provided</span>`
        )}

        ${section(
          currentProductLabel,
          details.currentProductLink
            ? `<a href="${escapeHtml(details.currentProductLink)}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(details.currentProductLink)}</a>`
            : details.currentProductFileName
              ? `${escapeHtml(details.currentProductFileName)} <span style="color:#8a8a8a;">(file attachments coming soon)</span>`
              : `<span style="color:#8a8a8a;">None provided</span>`
        )}

        ${section(
          inspirationLabel,
          linkRows || `<span style="color:#8a8a8a;">None provided</span>`
        )}

        ${section(
          notesLabel,
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
              ${footerLabel.replace('style="display:block;"', 'style="display:inline-block;"')}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  const { error: sendError } = await getResend().emails.send({
    from: "great esc. <orders@greatescape.studio>",
    to: ORDER_NOTIFICATION_TO,
    subject: `New order: ${PRODUCT_LABEL[product]} · ${details.name}`,
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
