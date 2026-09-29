import Link from "next/link";
import { EscBadge } from "../ui/EscBadge";
import { PillButton } from "../ui/PillButton";

export function ConfirmationStep() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <EscBadge size={56} />
      <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        You&apos;re in.
      </h1>
      <p className="mt-4 max-w-md text-pretty text-paper/60">
        We&apos;re already looking at your inspo. Your first look lands in
        your inbox within 1 week — no meetings, no back-and-forth.
      </p>
      <Link href="/" className="mt-10">
        <PillButton size="lg" variant="paper">
          Back to home
        </PillButton>
      </Link>
    </div>
  );
}
