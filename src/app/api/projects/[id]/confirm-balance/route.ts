import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProject, markBalancePaid } from "@/lib/projects";
import { sendBalancePaidEmail } from "@/lib/emails";

// Called right after the client's browser confirms the balance payment with
// Stripe — mirrors /api/create-project's role for the deposit. The webhook
// is the reliability fallback if this call never completes.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { paymentIntentId?: string } | null;

  if (!body?.paymentIntentId) {
    return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json({ error: "Payment has not succeeded" }, { status: 402 });
  }
  if (paymentIntent.metadata?.kind !== "balance" || paymentIntent.metadata?.projectId !== id) {
    return NextResponse.json({ error: "Payment intent mismatch" }, { status: 400 });
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const alreadyPaid = Boolean(project.balancePaidAt);
  await markBalancePaid(id);

  if (!alreadyPaid) {
    const updated = await getProject(id);
    if (updated) {
      await sendBalancePaidEmail(updated).catch((err) =>
        console.error("Failed to send balance-paid email", err)
      );
    }
  }

  return NextResponse.json({ ok: true });
}
