import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCT_LABEL, PRODUCT_PRICE, type ProductType } from "@/lib/products";

const VALID_PRODUCTS: ProductType[] = ["website", "app", "deck"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const product = body?.product as ProductType | undefined;

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
    metadata: { product },
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
