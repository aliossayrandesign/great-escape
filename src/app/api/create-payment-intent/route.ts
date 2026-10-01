import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCT_LABEL, PRODUCT_PRICE, type ProductType } from "@/lib/products";
import { buildPaymentMetadata } from "@/lib/payment-metadata";

const VALID_PRODUCTS: ProductType[] = ["website", "app", "deck"];

type RequestBody = {
  product?: ProductType;
  siteType?: string | null;
  platform?: string | null;
  details?: {
    name: string;
    email: string;
    company?: string | null;
    brandFileName?: string | null;
    brandFileUrl?: string | null;
    currentProductFileName?: string | null;
    currentProductFileUrl?: string | null;
    currentProductLink?: string | null;
    links?: string[];
    notes?: string | null;
  };
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const product = body?.product;

  if (!product || !VALID_PRODUCTS.includes(product)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  // Amount is looked up server-side from PRODUCT_PRICE — never trust a
  // client-supplied amount for a real charge.
  const amount = PRODUCT_PRICE[product] * 100; // Stripe expects cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    description: `great esc. — ${PRODUCT_LABEL[product]} package`,
    statement_descriptor_suffix: "GREAT ESC",
    // A truncated copy of the brief, used only as a fallback if the
    // client never completes the normal /api/create-project call — see
    // /api/webhooks/stripe.
    metadata: buildPaymentMetadata(
      product,
      body?.siteType ?? null,
      body?.platform ?? null,
      body?.details ?? { name: "", email: "" }
    ),
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
