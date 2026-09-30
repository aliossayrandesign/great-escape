import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { PRODUCT_LABEL, type ProductType } from "@/lib/products";

type DeliveryPayload = {
  password: string;
  clientName: string;
  clientEmail: string;
  product: ProductType;
  projectLink: string;
  note: string;
};

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

// No login system exists for this project, so this one route is guarded by
// a single shared password (ADMIN_PASSWORD) instead — good enough for a
// one-person studio sending a handful of delivery emails, not meant to
// scale past that.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as DeliveryPayload | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 }
    );
  }
  if (body.password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const { clientName, clientEmail, product, projectLink, note } = body;
  if (!clientName || !clientEmail || !product || !projectLink) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
            ${label("Delivered")}
            <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
              Your ${escapeHtml(PRODUCT_LABEL[product]).toLowerCase()} is ready.
            </div>
            <p style="margin-top:14px; font-size:14px; line-height:1.6; color:#a8a8a8;">
              Hey ${escapeHtml(clientName)} — take a look and let us know what you think. Up to 3 rounds of revisions are included.
            </p>
            <a href="${escapeHtml(projectLink)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
              View your ${escapeHtml(PRODUCT_LABEL[product]).toLowerCase()} →
            </a>
          </td>
        </tr>

        ${
          note
            ? `<tr>
                <td style="padding:20px 32px; border-top:1px solid #262626;">
                  ${label("A note from us")}
                  <div style="margin-top:8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:15px; line-height:1.6; color:#f3f3f3;">
                    ${escapeHtml(note).replace(/\n/g, "<br/>")}
                  </div>
                </td>
              </tr>`
            : ""
        }

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
              ${label("Escape the ordinary", "#5a5a5a")}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    `Your ${PRODUCT_LABEL[product]} is ready: ${projectLink}`,
    `Hey ${clientName} — take a look and let us know what you think. Up to 3 rounds of revisions are included.`,
    note ? `\nNote: ${note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { error: sendError } = await getResend().emails.send({
    from: "Great Escape <orders@greatescape.studio>",
    to: clientEmail,
    subject: `Your ${PRODUCT_LABEL[product]} is ready`,
    html,
    text,
  });

  if (sendError) {
    console.error("Resend failed to send delivery email:", sendError);
    return NextResponse.json(
      { error: "Failed to send delivery email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
