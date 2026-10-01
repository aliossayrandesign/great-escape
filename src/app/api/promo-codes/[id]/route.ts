import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deletePromoCode } from "@/lib/promo-codes";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deletePromoCode(id);
  return NextResponse.json({ ok: true });
}
