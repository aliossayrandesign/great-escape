"use client";

import { useState } from "react";
import type { ProductType } from "./ProductStep";
import { PillButton } from "../ui/PillButton";

const PRODUCT_LABEL: Record<ProductType, string> = {
  website: "Website",
  app: "App",
  deck: "Pitch Deck",
};

const PRODUCT_PRICE: Record<ProductType, number> = {
  website: 1200,
  app: 1800,
  deck: 800,
};

export function PaymentStep({
  product,
  onSubmit,
}: {
  product: ProductType;
  onSubmit: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const price = PRODUCT_PRICE[product];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire up real Stripe checkout/payment intent once account keys are available.
    setTimeout(() => {
      setSubmitting(false);
      onSubmit();
    }, 900);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pt-6 pb-32 sm:px-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Lock it in.
        </h1>
        <p className="mt-3 text-paper/60">
          One last step — then we start on your {PRODUCT_LABEL[product].toLowerCase()}.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1.4fr]">
        <div className="rounded-[30px] bg-dark-950 p-8">
          <p className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            Order summary
          </p>
          <div className="mt-6 flex items-center justify-between border-b border-dark-800 pb-4">
            <span className="text-lg font-semibold">
              {PRODUCT_LABEL[product]}
            </span>
            <span className="font-mono text-sm text-paper/70">
              ${price.toLocaleString()}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Total
            </span>
            <span className="text-xl font-semibold">
              ${price.toLocaleString()}
            </span>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-dark-400">
            First look delivered within 1 week of payment. Up to 3 rounds
            of revisions included.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] bg-dark-950 p-8"
        >
          <p className="mb-5 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            Payment details
          </p>
          <div className="flex flex-col gap-4">
            <input
              required
              placeholder="Card number"
              inputMode="numeric"
              className="rounded-2xl bg-dark-800 px-5 py-4 text-sm outline-none placeholder:text-dark-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="MM / YY"
                className="rounded-2xl bg-dark-800 px-5 py-4 text-sm outline-none placeholder:text-dark-400"
              />
              <input
                required
                placeholder="CVC"
                className="rounded-2xl bg-dark-800 px-5 py-4 text-sm outline-none placeholder:text-dark-400"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <span className="text-center text-xs text-dark-400">
              Secured by Stripe — placeholder form for now
            </span>
            <PillButton
              type="submit"
              size="xl"
              variant="paper"
              disabled={submitting}
              className="h-14 w-full whitespace-nowrap"
            >
              {submitting ? "Processing…" : "Complete →"}
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}
