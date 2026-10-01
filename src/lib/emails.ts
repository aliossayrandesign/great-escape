import { getResend, ORDER_NOTIFICATION_TO } from "./resend";
import { PRODUCT_LABEL } from "./products";
import type { Project } from "./types";

function productLabel(project: Project): string {
  const label = PRODUCT_LABEL[project.product];
  if (project.product === "package" && project.skuCount) {
    return `${label} · ${project.skuCount} SKU${project.skuCount === 1 ? "" : "s"}`;
  }
  return label;
}

const SITE_URL = "https://great-escape-five.vercel.app";
const MASON_BANNER = `${SITE_URL}/images/email/mason-caption.png`;
const REVIEW_BANNER = `${SITE_URL}/images/email/review-caption.png`;
const DELIVERY_BANNER = `${SITE_URL}/images/email/delivery-caption.png`;
const REPLY_BANNER = `${SITE_URL}/images/email/reply-caption.png`;
const BRANDMARK = `${SITE_URL}/images/email/brandmark.png`;
const FROM = "Great Escape <orders@greatescape.studio>";

export function projectUrl(id: string) {
  return `${SITE_URL}/project/${id}`;
}

export function adminProjectUrl(id: string) {
  return `${SITE_URL}/pathway/projects/${id}`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function label(text: string, color: string = "#ff8a8a") {
  return `<div style="font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:${color};">+ ${escapeHtml(text)} +</div>`;
}

function section(labelHtml: string, content: string) {
  return `
    <tr>
      <td style="padding:20px 32px; border-top:1px solid #262626;">
        ${labelHtml}
        <div style="margin-top:8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:15px; line-height:1.6; color:#f3f3f3;">
          ${content}
        </div>
      </td>
    </tr>
  `;
}

function fileLink(name: string | null, url: string | null, fallback = "None provided") {
  if (url) {
    return `<a href="${url}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(name ?? "Download file")} →</a>`;
  }
  if (name) {
    return `${escapeHtml(name)} <span style="color:#8a8a8a;">(upload didn't finish)</span>`;
  }
  return `<span style="color:#8a8a8a;">${fallback}</span>`;
}

function shell(
  bodyRows: string,
  withBanner: boolean,
  banner: { src: string; alt: string } = { src: MASON_BANNER, alt: "The work begins…" }
) {
  return `
    <div style="background:#0a0a0a; padding:40px 16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <table role="presentation" width="100%" style="max-width:560px; margin:0 auto; border-collapse:collapse; background:#141414; border:1px solid #262626; border-radius:20px; overflow:hidden;">
        ${
          withBanner
            ? `<tr><td style="padding:0;"><img src="${banner.src}" width="560" height="313" alt="${banner.alt}" style="display:block; width:100%; height:auto;" /></td></tr>`
            : ""
        }
        ${bodyRows}
        <tr>
          <td style="padding:28px 32px 32px; border-top:1px solid #262626; text-align:center;">
            <img src="${BRANDMARK}" width="30" height="44" alt="" style="display:inline-block; margin:0 auto;" />
            <div style="margin-top:14px; text-align:center;">
              ${label("Escape the ordinary", "#5a5a5a")}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendClientConfirmationEmail(project: Project) {
  const html = shell(
    `
      <tr>
        <td style="padding:24px 32px 28px;">
          ${label("Confirmed")}
          <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            ${escapeHtml(productLabel(project))} · $${project.price.toLocaleString()}
          </div>
          <p style="margin-top:14px; font-size:14px; line-height:1.6; color:#a8a8a8;">
            Half now, half upon completion — $${project.depositAmount.toLocaleString()} paid today, $${project.balanceAmount.toLocaleString()} due when your project is delivered.
          </p>
          <p style="margin-top:10px; font-size:14px; line-height:1.6; color:#a8a8a8;">
            First look delivered within 1 week. Up to 3 rounds of revisions included.
          </p>
          <a href="${projectUrl(project.id)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            Track your project →
          </a>
        </td>
      </tr>
      ${section(
        label("Submitted by"),
        `${escapeHtml(project.clientEmail)}<br/>${project.company ? escapeHtml(project.company) : `<span style="color:#8a8a8a;">No company given</span>`}`
      )}
      ${
        project.product === "website" && project.siteType
          ? section(label("Platform"), `${escapeHtml(project.siteType)} · ${escapeHtml(project.platform ?? "n/a")}`)
          : ""
      }
      ${section(label("Brand file"), fileLink(project.brandFileName, project.brandFileUrl))}
      ${section(
        label("Current product"),
        project.currentProductLink
          ? `<a href="${escapeHtml(project.currentProductLink)}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(project.currentProductLink)}</a>`
          : fileLink(project.currentProductFileName, project.currentProductFileUrl)
      )}
      ${section(
        label("Notes"),
        project.notes ? escapeHtml(project.notes).replace(/\n/g, "<br/>") : `<span style="color:#8a8a8a;">None provided</span>`
      )}
    `,
    true
  );

  const text = [
    `Confirmed: ${productLabel(project)} · $${project.price.toLocaleString()}`,
    `Half now, half upon completion — $${project.depositAmount.toLocaleString()} paid today, $${project.balanceAmount.toLocaleString()} due when your project is delivered.`,
    `Track your project: ${projectUrl(project.id)}`,
    `First look delivered within 1 week. Up to 3 rounds of revisions included.`,
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to: project.clientEmail,
    subject: `You're locked in — ${PRODUCT_LABEL[project.product]}`,
    html,
    text,
  });
}

export async function sendInternalNotificationEmail(project: Project) {
  const html = shell(
    `
      <tr>
        <td style="padding:28px 32px 24px;">
          ${label("New Client")}
          <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            ${escapeHtml(project.clientName)}
          </div>
          <div style="margin-top:4px; font-size:14px; color:#a8a8a8;">
            ${escapeHtml(productLabel(project))} · $${project.price.toLocaleString()} total — $${project.depositAmount.toLocaleString()} deposit paid, $${project.balanceAmount.toLocaleString()} due on delivery
          </div>
          <a href="${adminProjectUrl(project.id)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            Open in dashboard →
          </a>
        </td>
      </tr>
      ${section(
        label("Contact"),
        `${escapeHtml(project.clientEmail)}<br/>${project.company ? escapeHtml(project.company) : `<span style="color:#8a8a8a;">No company given</span>`}`
      )}
      ${
        project.product === "website" && project.siteType
          ? section(label("Platform"), `${escapeHtml(project.siteType)} · ${escapeHtml(project.platform ?? "n/a")}`)
          : ""
      }
      ${section(label("Brand file"), fileLink(project.brandFileName, project.brandFileUrl))}
      ${section(
        label("Current product"),
        project.currentProductLink
          ? `<a href="${escapeHtml(project.currentProductLink)}" style="color:#ff8a8a; text-decoration:none;">${escapeHtml(project.currentProductLink)}</a>`
          : fileLink(project.currentProductFileName, project.currentProductFileUrl)
      )}
      ${section(
        label("Inspiration links"),
        project.inspirationLinks.length
          ? project.inspirationLinks
              .map((l) => `<div style="margin-top:6px;"><a href="${escapeHtml(l)}" style="color:#ff8a8a; text-decoration:none; font-size:14px;">${escapeHtml(l)}</a></div>`)
              .join("")
          : `<span style="color:#8a8a8a;">None provided</span>`
      )}
      ${section(
        label("Notes"),
        project.notes ? escapeHtml(project.notes).replace(/\n/g, "<br/>") : `<span style="color:#8a8a8a;">None provided</span>`
      )}
    `,
    false
  );

  const text = [
    `New client: ${project.clientName}`,
    `${productLabel(project)} · $${project.price.toLocaleString()}`,
    `Dashboard: ${adminProjectUrl(project.id)}`,
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to: ORDER_NOTIFICATION_TO,
    subject: `New client: ${project.clientName} · ${PRODUCT_LABEL[project.product]}`,
    html,
    text,
  });
}

export async function sendDeliveryEmail(project: Project) {
  if (!project.projectLink) return;
  const html = shell(
    `
      <tr>
        <td style="padding:24px 32px 28px;">
          ${label("Delivered")}
          <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            Your ${escapeHtml(PRODUCT_LABEL[project.product]).toLowerCase()} is ready.
          </div>
          <p style="margin-top:14px; font-size:14px; line-height:1.6; color:#a8a8a8;">
            Hey ${escapeHtml(project.clientName)} — take a look and let us know what you think on your project page.
          </p>
          ${
            project.balanceAmount > 0 && !project.balancePaidAt
              ? `<p style="margin-top:10px; font-size:14px; line-height:1.6; color:#a8a8a8;">The remaining $${project.balanceAmount.toLocaleString()} balance is ready to pay on your project page.</p>`
              : ""
          }
          <a href="${escapeHtml(project.projectLink)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            View your ${escapeHtml(PRODUCT_LABEL[project.product]).toLowerCase()} →
          </a>
          <div style="margin-top:12px;">
            <a href="${projectUrl(project.id)}" style="color:#ff8a8a; text-decoration:none; font-size:13px;">Leave feedback, pay your balance, or book a call →</a>
          </div>
        </td>
      </tr>
    `,
    true,
    { src: DELIVERY_BANNER, alt: "It's ready." }
  );

  const text = [
    `Your ${PRODUCT_LABEL[project.product]} is ready: ${project.projectLink}`,
    `Leave feedback or book a call: ${projectUrl(project.id)}`,
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to: project.clientEmail,
    subject: `Your ${PRODUCT_LABEL[project.product]} is ready`,
    html,
    text,
  });
}

export async function sendReviewReadyEmail(project: Project) {
  const html = shell(
    `
      <tr>
        <td style="padding:24px 32px 28px;">
          ${label("In Review")}
          <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            Your ${escapeHtml(PRODUCT_LABEL[project.product]).toLowerCase()} is ready for a first look.
          </div>
          <p style="margin-top:14px; font-size:14px; line-height:1.6; color:#a8a8a8;">
            Hey ${escapeHtml(project.clientName)} — we just moved things into review. Check your project page for where things stand, and leave feedback whenever you're ready.
          </p>
          <a href="${projectUrl(project.id)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            View your project →
          </a>
        </td>
      </tr>
    `,
    true,
    { src: REVIEW_BANNER, alt: "Take a look…" }
  );

  const text = [
    `Your ${PRODUCT_LABEL[project.product]} is ready for a first look.`,
    `View your project: ${projectUrl(project.id)}`,
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to: project.clientEmail,
    subject: `Take a look — ${PRODUCT_LABEL[project.product]}`,
    html,
    text,
  });
}

export async function sendRevisionToStudioEmail(project: Project, message: string, videoUrl: string | null) {
  const revisionNumber = project.revisionsUsed + 1;
  const html = shell(
    `
      <tr>
        <td style="padding:28px 32px 24px;">
          ${label("New Feedback")}
          <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            ${escapeHtml(project.clientName)}
          </div>
          <div style="margin-top:4px; font-size:14px; color:#a8a8a8;">
            ${escapeHtml(PRODUCT_LABEL[project.product])} · Revision ${revisionNumber} of 3
          </div>
          <a href="${adminProjectUrl(project.id)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            Open in dashboard →
          </a>
        </td>
      </tr>
      ${section(label("Feedback"), escapeHtml(message).replace(/\n/g, "<br/>"))}
      ${videoUrl ? section(label("Video"), `<a href="${escapeHtml(videoUrl)}" style="color:#ff8a8a; text-decoration:none;">▶ Watch video</a>`) : ""}
    `,
    false
  );

  const text = [
    `New feedback from ${project.clientName} (revision ${revisionNumber} of 3)`,
    message,
    videoUrl ? `Video: ${videoUrl}` : "",
    `Dashboard: ${adminProjectUrl(project.id)}`,
  ]
    .filter(Boolean)
    .join("\n");

  await getResend().emails.send({
    from: FROM,
    to: ORDER_NOTIFICATION_TO,
    subject: `New feedback from ${project.clientName} · Revision ${revisionNumber} of 3`,
    html,
    text,
  });
}

export async function sendStudioUpdateToClientEmail(project: Project, message: string) {
  const html = shell(
    `
      <tr>
        <td style="padding:24px 32px 28px;">
          ${label("New Update")}
          <div style="margin-top:8px; font-size:22px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            Hey ${escapeHtml(project.clientName)} — we replied.
          </div>
        </td>
      </tr>
      ${section(label("Message"), escapeHtml(message).replace(/\n/g, "<br/>"))}
      <tr>
        <td style="padding:8px 32px 28px;">
          <a href="${projectUrl(project.id)}" style="display:inline-block; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            View your project →
          </a>
        </td>
      </tr>
    `,
    true,
    { src: REPLY_BANNER, alt: "We replied." }
  );

  const text = [
    `Hey ${project.clientName} — we replied to your feedback:`,
    message,
    `View your project: ${projectUrl(project.id)}`,
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to: project.clientEmail,
    subject: `We replied — ${PRODUCT_LABEL[project.product]} update`,
    html,
    text,
  });
}

export async function sendBalancePaidEmail(project: Project) {
  const html = shell(
    `
      <tr>
        <td style="padding:28px 32px 24px;">
          ${label("Balance Paid")}
          <div style="margin-top:8px; font-size:26px; font-weight:600; letter-spacing:-0.01em; color:#f3f3f3;">
            ${escapeHtml(project.clientName)}
          </div>
          <div style="margin-top:4px; font-size:14px; color:#a8a8a8;">
            ${escapeHtml(productLabel(project))} · $${project.balanceAmount.toLocaleString()} balance paid in full
          </div>
          <a href="${adminProjectUrl(project.id)}" style="display:inline-block; margin-top:18px; padding:12px 22px; background:#f3f3f3; color:#0a0a0a; text-decoration:none; border-radius:999px; font-family:'SF Mono', ui-monospace, Menlo, monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; font-weight:600;">
            Open in dashboard →
          </a>
        </td>
      </tr>
    `,
    false
  );

  const text = [
    `Balance paid: ${project.clientName} — ${productLabel(project)}`,
    `$${project.balanceAmount.toLocaleString()} balance paid in full.`,
    `Dashboard: ${adminProjectUrl(project.id)}`,
  ].join("\n");

  await getResend().emails.send({
    from: FROM,
    to: ORDER_NOTIFICATION_TO,
    subject: `Balance paid: ${project.clientName} · ${PRODUCT_LABEL[project.product]}`,
    html,
    text,
  });
}
