import { query } from "./db";

export type DiscountType = "percent" | "fixed";

export type PromoCode = {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  createdAt: string;
};

type PromoCodeRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
};

function rowToPromoCode(row: PromoCodeRow): PromoCode {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type as DiscountType,
    discountValue: row.discount_value,
    maxUses: row.max_uses,
    usesCount: row.uses_count,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const result = await query(`SELECT * FROM promo_codes WHERE code = $1`, [normalizeCode(code)]);
  if (result.rows.length === 0) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToPromoCode(result.rows[0] as any);
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const result = await query(`SELECT * FROM promo_codes ORDER BY created_at DESC`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.rows.map((row) => rowToPromoCode(row as any));
}

export async function createPromoCode(input: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  expiresAt: string | null;
}): Promise<PromoCode> {
  const result = await query(
    `INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      normalizeCode(input.code),
      input.discountType,
      input.discountValue,
      input.maxUses,
      input.expiresAt,
    ]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToPromoCode(result.rows[0] as any);
}

export async function deletePromoCode(id: string) {
  await query(`DELETE FROM promo_codes WHERE id = $1`, [id]);
}

export async function incrementPromoCodeUsage(id: string) {
  await query(`UPDATE promo_codes SET uses_count = uses_count + 1 WHERE id = $1`, [id]);
}

// Fixed discounts never exceed the total (no negative prices); percent
// discounts round to the nearest dollar.
export function computeDiscount(promo: PromoCode, totalPrice: number): number {
  if (promo.discountType === "percent") {
    return Math.round((totalPrice * promo.discountValue) / 100);
  }
  return Math.min(promo.discountValue, totalPrice);
}

export type PromoValidationResult =
  | { valid: true; promo: PromoCode; discountAmount: number }
  | { valid: false; error: string };

// Single source of truth for whether a code can be applied right now — used
// by both the public validate endpoint (live preview at checkout) and
// create-payment-intent (the actual charge), so a code is never accepted at
// preview time and rejected at charge time, or vice versa.
export async function validatePromoCode(
  code: string,
  totalPrice: number
): Promise<PromoValidationResult> {
  const promo = await getPromoCodeByCode(code);
  if (!promo) return { valid: false, error: "That code isn't valid." };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, error: "That code has expired." };
  }
  if (promo.maxUses != null && promo.usesCount >= promo.maxUses) {
    return { valid: false, error: "That code has already been used." };
  }
  const discountAmount = computeDiscount(promo, totalPrice);
  return { valid: true, promo, discountAmount };
}
