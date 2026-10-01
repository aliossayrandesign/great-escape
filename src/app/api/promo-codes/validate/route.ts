import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo-codes";
import { getTotalPrice, getDepositAmount, type ProductType } from "@/lib/products";

const VALID_PRODUCTS: ProductType[] = ["website", "app", "deck", "package"];

type RequestBody = {
  code?: string;
  product?: ProductType;
  skuCount?: number | null;
};

// Live preview only — the authoritative check (and the actual charge
// discount) happens again, independently, in /api/create-payment-intent.
// Never trust this endpoint's result for anything money-moving.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;

  if (!body?.code?.trim()) {
    return NextResponse.json({ valid: false, error: "Enter a code." }, { status: 400 });
  }
  if (!body.product || !VALID_PRODUCTS.includes(body.product)) {
    return NextResponse.json({ valid: false, error: "Invalid product" }, { status: 400 });
  }

  const totalPrice = getTotalPrice(body.product, body.skuCount ?? null);
  const result = await validatePromoCode(body.code, totalPrice);

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error });
  }

  const discountedTotal = totalPrice - result.discountAmount;
  const depositAmount = getDepositAmount(discountedTotal);

  return NextResponse.json({
    valid: true,
    code: result.promo.code,
    discountAmount: result.discountAmount,
    discountedTotal,
    depositAmount,
    balanceAmount: discountedTotal - depositAmount,
  });
}
