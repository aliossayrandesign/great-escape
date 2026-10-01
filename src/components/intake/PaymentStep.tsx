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
}: {
  product: ProductType;
  siteType: SiteType | null;
  platform: Platform | null;
  skuCount: number | null;
  details: DetailsData;
  onSubmit: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = product === "package" ? getPackagePrice(skuCount ?? 1) : PRODUCT_PRICE[product];
  const deposit = getDepositAmount(price);
  const balance = price - deposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

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
              ${price.toLocaleString()}
            </span>
          </div>
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
              disabled={!stripe || submitting}
              className="h-14 w-full whitespace-nowrap"
            >
              {submitting ? "Processing…" : `Pay deposit — $${deposit.toLocaleString()} →`}
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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create payment intent");
        return res.json();
      })
      .then((data: { clientSecret: string }) => {
        if (!cancelled) setClientSecret(data.clientSecret);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
    // Create exactly one PaymentIntent per checkout session. siteType/platform/details
    // are fixed by the time this step mounts (set in earlier steps) and intentionally
    // excluded so an in-progress edit never spawns a second PaymentIntent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

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
    <Elements stripe={getStripe()} options={options}>
      <PaymentForm
        product={product}
        siteType={siteType}
        platform={platform}
        skuCount={skuCount}
        details={details}
        onSubmit={onSubmit}
      />
    </Elements>
  );
}
