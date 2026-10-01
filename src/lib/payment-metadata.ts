import type { ProductType } from "./products";

type BriefDetails = {
  name: string;
  email: string;
  company?: string | null;
  brandFileName?: string | null;
  brandFileUrl?: string | null;
  currentProductFileName?: string | null;
  currentProductFileUrl?: string | null;
  currentProductLink?: string | null;
  dielineFileName?: string | null;
  dielineFileUrl?: string | null;
  links?: string[];
  notes?: string | null;
  skuCount?: number | null;
};

const MAX_VALUE_LENGTH = 490; // Stripe caps each metadata value at 500 chars

function clip(value: string | null | undefined): string {
  return (value ?? "").slice(0, MAX_VALUE_LENGTH);
}

// Stripe PaymentIntent metadata is a flat string map with a 500-char-per-value
// limit, so this is a best-effort, truncated recovery copy of the brief — not
// the source of truth. The normal flow carries the full, untruncated details
// straight from the browser to /api/create-project. This copy only exists so
// the webhook fallback in /api/webhooks/stripe can still create a project
// (and notify the client) if that browser-side call never happens.
export function buildPaymentMetadata(
  product: ProductType,
  siteType: string | null,
  platform: string | null,
  details: BriefDetails
): Record<string, string> {
  return {
    product,
    siteType: siteType ?? "",
    platform: platform ?? "",
    name: clip(details.name),
    email: clip(details.email),
    company: clip(details.company),
    brandFileName: clip(details.brandFileName),
    brandFileUrl: clip(details.brandFileUrl),
    currentProductFileName: clip(details.currentProductFileName),
    currentProductFileUrl: clip(details.currentProductFileUrl),
    currentProductLink: clip(details.currentProductLink),
    dielineFileName: clip(details.dielineFileName),
    dielineFileUrl: clip(details.dielineFileUrl),
    notes: clip(details.notes),
    links: clip((details.links ?? []).filter(Boolean).join("|")),
    skuCount: details.skuCount != null ? String(details.skuCount) : "",
  };
}

export function parsePaymentMetadata(metadata: Record<string, string>) {
  return {
    product: metadata.product as ProductType,
    siteType: metadata.siteType || null,
    platform: metadata.platform || null,
    name: metadata.name || "",
    email: metadata.email || "",
    company: metadata.company || null,
    brandFileName: metadata.brandFileName || null,
    brandFileUrl: metadata.brandFileUrl || null,
    currentProductFileName: metadata.currentProductFileName || null,
    currentProductFileUrl: metadata.currentProductFileUrl || null,
    currentProductLink: metadata.currentProductLink || null,
    dielineFileName: metadata.dielineFileName || null,
    dielineFileUrl: metadata.dielineFileUrl || null,
    notes: metadata.notes || null,
    links: metadata.links ? metadata.links.split("|").filter(Boolean) : [],
    skuCount: metadata.skuCount ? Number(metadata.skuCount) : null,
  };
}
