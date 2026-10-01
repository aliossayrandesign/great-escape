"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import Link from "next/link";
import { getStripe } from "@/lib/stripe-client";
import { STRIPE_APPEARANCE, STRIPE_FONTS } from "@/lib/stripe-appearance";
import {
  PRODUCT_LABEL,
  PRODUCT_PRICE,
  getPackagePrice,
  getDepositAmount,
  type ProductType,
} from "@/lib/products";
import { PillButton } from "../ui/PillButton";
import type { DetailsData } from "./DetailsStep";
import type { Platform, SiteType } from "./PlatformStep";

async function createProject({
  paymentIntentId,
  product,
  siteType,
  platform,
  skuCount,
  details,
}: {
  paymentIntentId: string;
  product: ProductType;
  siteType: SiteType | null;
  platform: Platform | null;
  skuCount: number | null;
  details: DetailsData;
}) {
  const payload = JSON.stringify({
    paymentIntentId,
    product,
    siteType,
    platform,
    skuCount,
    details: {
      name: details.name,
      email: details.email,
      company: details.company,
      brandFileName: details.brandFile?.name ?? null,
      brandFileUrl: details.brandFileUrl,
      currentProductFileName: details.currentProductFile?.name ?? null,
      currentProductFileUrl: details.currentProductFileUrl,
      currentProductLink: details.currentProductLink,
      dielineFileName: details.dielineFile?.name ?? null,
      dielineFileUrl: details.dielineFileUrl,
      links: details.links,
      notes: details.notes,
    },
  });

  // Creates the project record and fires both emails (internal heads-up +
  // client confirmation) server-side. Shouldn't block the customer's
  // success screen on failing — worth alerting on separately, but not
  // their problem.
  try {
    await fetch("/api/create-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
  } catch {
    console.error("Failed to create project record");
  }
}

function PaymentForm({
  product,
  siteType,
  platform,
  skuCount,
  details,
  onSubmit,
  promoCode,
  discountAmount,
  promoError,
  applyingPromo,
  onApplyPromo,
  onRemovePromo,
}: {
  product: ProductType;
  siteType: SiteType | null;
  platform: Platform | null;
  skuCount: number | null;
  details: DetailsData;
  onSubmit: () => void;
  promoCode: string | null;
  discountAmount: number;
  promoError: string | null;
  applyingPromo: boolean;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const basePrice = product === "package" ? getPackagePrice(skuCount ?? 1) : PRODUCT_PRICE[product];
  const discountedTotal = basePrice - discountAmount;
  const deposit = getDepositAmount(discountedTotal);
  const balance = discountedTotal - deposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || applyingPromo) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(
        confirmError.message ?? "Something went wrong. Please try again."
      );
      setSubmitting(false);
      return;
    }

    if (paymentIntent) {
      await createProject({
        paymentIntentId: paymentIntent.id,
        product,
        siteType,
        platform,
        skuCount,
        details,
      });
    }

    onSubmit();
  };

  const handleApplyClick = () => {
    if (!promoInput.trim()) return;
    onApplyPromo(promoInput.trim());
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pt-6 pb-32 sm:px-16">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Lock it in.
        </h1>
        <p className="mt-3 text-pretty text-paper/60">
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
              {product === "package" && skuCount ? ` · ${skuCount} SKU${skuCount === 1 ? "" : "s"}` : ""}
            </span>
            <span className="font-mono text-sm text-paper/70">
              {discountAmount > 0 && (
                <span className="mr-2 text-paper/30 line-through">
                  ${basePrice.toLocaleString()}
                </span>
              )}
              ${discountedTotal.toLocaleString()}
            </span>
          </div>

          {!promoCode && promoError && (
            <p className="mt-4 text-xs text-coral">{promoError}</p>
          )}

          {promoCode ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#7ac47a]/30 bg-[#7ac47a]/5 px-4 py-3">
              <span className="text-xs text-[#7ac47a]">
                Promo <span className="font-mono">{promoCode}</span> applied — −${discountAmount.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={onRemovePromo}
                className="font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase hover:text-paper"
              >
                Remove
              </button>
            </div>
          ) : showPromoInput ? (
            <div className="mt-4 flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code"
                className="flex-1 rounded-xl border border-dark-700 bg-dark-900 px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-coral"
              />
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={applyingPromo || !promoInput.trim()}
                className="rounded-xl border border-dark-700 px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-paper/70 uppercase hover:border-paper disabled:opacity-50"
              >
                {applyingPromo ? "…" : "Apply"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPromoInput(true)}
              className="mt-4 text-xs text-paper/40 underline underline-offset-2 hover:text-paper"
            >
              Have a promo code?
            </button>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Due today (50%)
            </span>
            <span className="text-xl font-semibold">
              ${deposit.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Due on delivery
            </span>
            <span className="text-sm text-paper/60">
              ${balance.toLocaleString()}
            </span>
          </div>
          <p className="mt-6 text-pretty text-xs leading-relaxed text-dark-400">
            Half now, half upon completion. First look delivered within 1
            week of payment. Up to 3 rounds of revisions included.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[30px] bg-dark-950 p-8">
          <p className="mb-5 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
            Payment details
          </p>

          <PaymentElement />

          {error && (
            <p className="mt-4 text-pretty text-sm text-coral">{error}</p>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <span className="text-balance text-center text-xs text-dark-400">
              Secured by Stripe
            </span>
            <PillButton
              type="submit"
              size="xl"
              variant="paper"
              disabled={!stripe || submitting || applyingPromo}
              className="h-14 w-full whitespace-nowrap"
            >
              {submitting
                ? "Processing…"
                : applyingPromo
                  ? "Updating order…"
                  : `Pay deposit — $${deposit.toLocaleString()} →`}
            </PillButton>
            <p className="text-balance text-center text-xs text-dark-400">
              By completing this purchase, you agree to our{" "}
              <Link href="/terms" target="_blank" className="text-paper/70 hover:text-coral hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-paper/70 hover:text-coral hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PaymentStep({
  product,
  siteType,
  platform,
  skuCount,
  details,
  onSubmit,
}: {
  product: ProductType;
  siteType: SiteType | null;
  platform: Platform | null;
  skuCount: number | null;
  details: DetailsData;
  onSubmit: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product,
        siteType,
        platform,
        skuCount,
        promoCode,
        details: {
          name: details.name,
          email: details.email,
          company: details.company,
          brandFileName: details.brandFile?.name ?? null,
          brandFileUrl: details.brandFileUrl,
          currentProductFileName: details.currentProductFile?.name ?? null,
          currentProductFileUrl: details.currentProductFileUrl,
          currentProductLink: details.currentProductLink,
          dielineFileName: details.dielineFile?.name ?? null,
          dielineFileUrl: details.dielineFileUrl,
          links: details.links,
          notes: details.notes,
        },
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          // A promo code that stopped being valid between "Apply" and now
          // (e.g. it just hit its use limit elsewhere) shouldn't dead-end
          // checkout — fall back to full price instead of blocking payment.
          if (promoCode) {
            if (!cancelled) {
              setPromoError(data?.error ?? "That code is no longer valid.");
              setPromoCode(null);
            }
            return;
          }
          throw new Error("Failed to create payment intent");
        }
        if (!cancelled) {
          setClientSecret(data.clientSecret);
          setDiscountAmount(data.discountAmount ?? 0);
          setApplyingPromo(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
    // promoCode is the only user-driven input (via Apply/Remove in the order
    // summary) that should spawn a new, re-priced PaymentIntent after mount.
    // siteType/platform/details are fixed by the time this step mounts and
    // intentionally excluded so an in-progress edit never spawns one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, promoCode]);

  const handleApplyPromo = async (code: string) => {
    setApplyingPromo(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, product, skuCount }),
      });
      const data = await res.json();
      if (!data.valid) {
        setPromoError(data.error ?? "That code isn't valid.");
        setApplyingPromo(false);
        return;
      }
      // Triggers the effect above to fetch a new, discounted PaymentIntent.
      setPromoCode(data.code);
    } catch {
      setPromoError("Something went wrong. Please try again.");
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setApplyingPromo(true);
    setPromoError(null);
    setPromoCode(null);
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="text-pretty text-paper/60">
          Couldn&apos;t load payment. Please refresh and try again.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="text-paper/60">Preparing checkout…</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: STRIPE_APPEARANCE,
    fonts: STRIPE_FONTS,
  };

  return (
    <Elements key={clientSecret} stripe={getStripe()} options={options}>
      <PaymentForm
        product={product}
        siteType={siteType}
        platform={platform}
        skuCount={skuCount}
        details={details}
        onSubmit={onSubmit}
        promoCode={promoCode}
        discountAmount={discountAmount}
        promoError={promoError}
        applyingPromo={applyingPromo}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={handleRemovePromo}
      />
    </Elements>
  );
}
