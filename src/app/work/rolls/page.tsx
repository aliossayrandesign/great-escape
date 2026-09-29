import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PillButton } from "@/components/ui/PillButton";
import { RollsSequence } from "@/components/case-study/RollsSequence";
import { ScreenshotReveal } from "@/components/case-study/ScreenshotReveal";

export const metadata: Metadata = {
  title: "Watch it ship — great esc.",
  description:
    "A real brief, a real turnaround: watch what happens between the intake and the finished product.",
};

const STATS = [
  { label: "Turnaround", value: "7 days" },
  { label: "Built on", value: "Shopify" },
  { label: "Revisions", value: "2 rounds" },
];

export default function RollsCaseStudy() {
  return (
    <main className="min-h-screen pt-[81px] sm:pt-[105px]">
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-panel-stroke/40 bg-dark-950/70 px-4 py-5 backdrop-blur-md sm:px-8 sm:py-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.svg"
            alt="great escape"
            width={204}
            height={39}
            className="h-[26px] w-auto sm:h-[30px]"
            priority
          />
        </Link>
        <Link
          href="/start"
          className="inline-block transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          <Image
            src="/images/nav-cta.svg"
            alt="Start your escape"
            width={328}
            height={70}
            className="h-10 w-auto sm:h-14"
          />
        </Link>
      </nav>

      <RollsSequence />

      <ScreenshotReveal />

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-8">
        <div className="grid grid-cols-3 gap-4 border-y border-panel-stroke py-8 text-center sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase sm:text-xs">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center sm:mt-20">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Want yours to look like this?
          </h2>
          <div className="mt-8 flex justify-center">
            <Link href="/start">
              <PillButton size="xl" variant="paper" className="h-14 w-[262px]">
                Start your escape →
              </PillButton>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
