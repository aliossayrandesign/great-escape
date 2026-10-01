import Link from "next/link";
import { listPromoCodes } from "@/lib/promo-codes";
import { SimpleNav } from "@/components/SimpleNav";
import { PromoCodesClient } from "@/components/pathway/PromoCodesClient";

// Must reflect live database state on every visit — same reasoning as the
// main dashboard.
export const dynamic = "force-dynamic";

export default async function PromoCodesPage() {
  const promoCodes = await listPromoCodes();

  return (
    <main className="min-h-screen bg-dark-950 px-6 pt-[81px] pb-16 sm:px-10 sm:pt-[105px]">
      <SimpleNav />
      <div className="mx-auto max-w-3xl py-10">
        <Link
          href="/pathway"
          className="font-mono text-xs tracking-[0.1em] text-paper/40 uppercase hover:text-paper"
        >
          ‹ All projects
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Promo codes
        </h1>
        <p className="mt-2 text-sm text-paper/60">
          For family-and-friends or one-off discounts at checkout.
        </p>
        <PromoCodesClient initialCodes={promoCodes} />
      </div>
    </main>
  );
}
