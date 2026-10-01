import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  PRODUCT_LABEL,
  PRODUCT_PRICE,
  PACKAGE_MAX_SKUS,
  PACKAGE_MIN_SKUS,
  getPackagePrice,
  getDepositAmount,
  type ProductType,
} from "@/lib/products";
import { buildPaymentMetadata } from "@/lib/payment-metadata";
import { validatePromoCode } from "@/lib/promo-codes";

const VALID_PRODUCTS: ProductType[] = ["website", "app", "deck", "package"];

type RequestBody = {
  product?: ProductType;
  siteType?: string | null;
  platform?: string | null;
  skuCount?: number | null;
  promoCode?: string | null;
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

  let skuCount: number | null = null;
  let totalPrice: number;

  if (product === "package") {
    skuCount = Number(body?.skuCount);
    if (!Number.isInteger(skuCount) || skuCount < PACKAGE_MIN_SKUS || skuCount > PACKAGE_MAX_SKUS) {
      return NextResponse.json(
        { error: `skuCount must be between ${PACKAGE_MIN_SKUS} and ${PACKAGE_MAX_SKUS}` },
        { status: 400 }
      );
    }
    // Price is computed server-side from skuCount — never trust a
    // client-supplied amount for a real charge.
    totalPrice = getPackagePrice(skuCount);
  } else {
    totalPrice = PRODUCT_PRICE[product];
  }

  let discountAmount = 0;
  let appliedPromo: { id: string; code: string } | null = null;
  const promoCodeInput = body?.promoCode?.trim();
  if (promoCodeInput) {
    const result = await validatePromoCode(promoCodeInput, totalPrice);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    discountAmount = result.discountAmount;
    appliedPromo = { id: result.promo.id, code: result.promo.code };
    totalPrice -= discountAmount;
  }

  // Standard split: half now, half on delivery. Only the deposit is charged
  // here — the balance is collected later from the client's project page.
  const depositAmount = getDepositAmount(totalPrice);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: depositAmount * 100, // Stripe expects cents
    currency: "usd",
    description: `great esc. — ${PRODUCT_LABEL[product]} deposit`,
    statement_descriptor_suffix: "GREAT ESC",
    // A truncated copy of the brief, used only as a fallback if the
    // client never completes the normal /api/create-project call — see
    // /api/webhooks/stripe.
    metadata: buildPaymentMetadata(
      product,
      body?.siteType ?? null,
      body?.platform ?? null,
      { ...(body?.details ?? { name: "", email: "" }), skuCount },
      totalPrice,
      appliedPromo ? { ...appliedPromo, discountAmount } : null
    ),
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, discountAmount });
}
