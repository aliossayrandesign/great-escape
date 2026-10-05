"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PRODUCT_PRICE, PRODUCT_PRICE_STARTS_AT } from "@/lib/products";

const PLANS = [
  {
    id: "website",
    title: "Website Design & Development",
    description: "A full site, built around your business, not a template.",
  },
  {
    id: "app",
    title: "App Design & Build",
    description: "UX/UI design and a functional MVP, built within an agreed scope.",
  },
  {
    id: "package",
    title: "Package Design",
    description: "Label or packaging design for your product(s).",
  },
  {
    id: "deck",
    title: "Pitch Deck",
    description: "A deck built to raise, sell, or pitch.",
  },
] as const;

const INCLUDED = [
  "First look in 1 week",
  "Up to 3 rounds of revisions",
  "Creative-directed from first pass to final.",
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden px-4 py-20 sm:px-8 sm:py-32"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/atmosphere.png"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-dark-900/80" />
      </div>

      <div className="relative text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + Pricing +
        </p>
        <h2 className="mt-4 text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
          One price.
          <br />
          <span className="text-coral">No surprises.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-paper/60">
          Pick your product, pay once, get it built.
        </p>
      </div>

      <div className="relative mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col rounded-[28px] border border-panel-stroke bg-dark-950/75 p-8 backdrop-blur-md"
          >
            <h3 className="text-balance text-2xl font-semibold tracking-tight">
              {plan.title}
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-paper/60">
              {plan.description}
            </p>
            <div className="mt-6 text-5xl font-semibold tracking-tight">
              ${PRODUCT_PRICE[plan.id].toLocaleString()}
              {PRODUCT_PRICE_STARTS_AT[plan.id] ? "+" : ""}
            </div>
            <div className="mt-8 flex-1 space-y-3 border-t border-paper/10 pt-7">
              {INCLUDED.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 font-mono text-xs text-paper/70"
                >
                  <span className="text-coral">+</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-9">
              <Link
                href={`/start?product=${plan.id}`}
                className="inline-block transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Image
                  src="/images/nav-cta.svg"
                  alt="Start Your Project"
                  width={328}
                  height={70}
                  className="h-12 w-auto"
                />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
