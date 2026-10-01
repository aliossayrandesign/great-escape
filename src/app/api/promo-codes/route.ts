import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listPromoCodes, createPromoCode, type DiscountType } from "@/lib/promo-codes";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const promoCodes = await listPromoCodes();
  return NextResponse.json({ promoCodes });
}

type CreatePromoCodePayload = {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
};

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CreatePromoCodePayload | null;

  if (!body?.code?.trim()) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }
  if (body.discountType !== "percent" && body.discountType !== "fixed") {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
  }
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return NextResponse.json({ error: "Invalid discount value" }, { status: 400 });
  }
  if (body.discountType === "percent" && discountValue > 100) {
    return NextResponse.json({ error: "Percent discount can't exceed 100" }, { status: 400 });
  }

  try {
    const promoCode = await createPromoCode({
      code: body.code,
      discountType: body.discountType,
      discountValue,
      maxUses: body.maxUses != null && body.maxUses !== undefined ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt || null,
    });
    return NextResponse.json({ promoCode });
  } catch (error) {
    if ((error as { code?: string } | null)?.code === "23505") {
      return NextResponse.json({ error: "That code already exists" }, { status: 409 });
    }
    throw error;
  }
}
