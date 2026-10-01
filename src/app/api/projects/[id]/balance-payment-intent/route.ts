import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProject, setBalancePaymentIntent } from "@/lib/projects";
import { PRODUCT_LABEL } from "@/lib/products";

// Public — the project id is the magic-link credential, same model as the
// rest of the client-facing project routes. Creates (or reuses) the Stripe
// PaymentIntent for the remaining balance, payable once the project is
// delivered — "half now, half upon completion."
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (project.status !== "delivered") {
    return NextResponse.json(
      { error: "The balance is payable once the project is delivered" },
      { status: 400 }
    );
  }
  if (project.balancePaidAt) {
    return NextResponse.json({ error: "Balance already paid" }, { status: 400 });
  }
  if (project.balanceAmount <= 0) {
    return NextResponse.json({ error: "No balance due" }, { status: 400 });
  }

  // Reuse the existing PaymentIntent if one's already in flight, instead of
  // minting a new one on every page load/retry.
  if (project.balancePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(project.balancePaymentIntentId);
    if (existing.status !== "succeeded" && existing.status !== "canceled") {
      return NextResponse.json({ clientSecret: existing.client_secret });
    }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: project.balanceAmount * 100,
    currency: "usd",
    description: `great esc. — ${PRODUCT_LABEL[project.product]} balance`,
    statement_descriptor_suffix: "GREAT ESC",
    metadata: { kind: "balance", projectId: project.id },
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  await setBalancePaymentIntent(project.id, paymentIntent.id);

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
