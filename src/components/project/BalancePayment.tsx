"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";
import { STRIPE_APPEARANCE, STRIPE_FONTS } from "@/lib/stripe-appearance";
import { PillButton } from "@/components/ui/PillButton";

function BalanceForm({
  projectId,
  balanceAmount,
  onPaid,
}: {
  projectId: string;
  balanceAmount: number;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(confirmError.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent) {
      await fetch(`/api/projects/${projectId}/confirm-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      }).catch(() => {});
    }

    setSubmitting(false);
    onPaid();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
      <PillButton
        type="submit"
        size="md"
        variant="paper"
        disabled={!stripe || submitting}
        className="mt-4 w-full"
      >
        {submitting ? "Processing…" : `Pay balance — $${balanceAmount.toLocaleString()} →`}
      </PillButton>
    </form>
  );
}

export function BalancePayment({
  projectId,
  balanceAmount,
  onPaid,
}: {
  projectId: string;
  balanceAmount: number;
  onPaid: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/balance-payment-intent`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to start balance payment");
        return res.json();
      })
      .then((data: { clientSecret: string }) => {
        if (!cancelled) setClientSecret(data.clientSecret);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (error) {
    return (
      <p className="mt-4 text-sm text-coral">
        Couldn&apos;t start the balance payment. Refresh and try again.
      </p>
    );
  }

  if (!clientSecret) {
    return <p className="mt-4 text-sm text-paper/40">Preparing payment…</p>;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: STRIPE_APPEARANCE,
    fonts: STRIPE_FONTS,
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      <BalanceForm projectId={projectId} balanceAmount={balanceAmount} onPaid={onPaid} />
    </Elements>
  );
}
