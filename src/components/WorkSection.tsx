"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { GlowFog } from "./ui/GlowFog";

const PRODUCTS = [
  {
    id: "website",
    number: "01",
    title: "Website",
    tagline: "A site that looks like your best day, every day.",
    description:
      "Home, product, pricing, about, contact — a full marketing site laid out to convert, not just decorate, and written to sound like you.",
    included: [
      "Home + up to 5 core pages",
      "Responsive across every device",
      "Copy refined to your brand voice",
      "Contact & lead forms wired up",
      "Launch-ready structure, SEO built in",
    ],
    image: "/images/card-website.png",
  },
  {
    id: "app",
    number: "02",
    title: "App",
    tagline: "Every screen your product needs, mapped and designed.",
    description:
      "From first open to your core loop — onboarding, empty states, edge cases — the full experience designed with the same care as the happy path.",
    included: [
      "Onboarding + core product flows",
      "Every state: empty, loading, error",
      "A clickable prototype to test with real users",
      "Dev-ready specs & exportable assets",
      "Light & dark variants",
    ],
    image: "/images/card-app.png",
  },
  {
    id: "deck",
    number: "03",
    title: "Pitch Deck",
    tagline: "The story that gets you the yes.",
    description:
      "Problem, solution, traction, ask — a narrative deck designed to hold a room's attention for the two minutes that decide everything.",
    included: [
      "12–15 slide narrative deck",
      "Custom charts & data visuals",
      "Investor-grade visual system",
      "Editable source file, yours to keep",
    ],
    image: "/images/card-deck.png",
  },
];

type Product = (typeof PRODUCTS)[number];

function ProductPanel({ product }: { product: Product }) {
  return (
    <div className="grid w-full grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-16">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[28px] border border-panel-stroke">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 576px, 90vw"
        />
        <GlowFog />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
      </div>

      <div>
        <span className="font-mono text-xs tracking-[0.2em] text-coral">
          {product.number}
        </span>
        <h3 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {product.title}
        </h3>
        <p className="mt-4 text-xl font-semibold tracking-tight text-paper/90 sm:text-2xl">
          {product.tagline}
        </p>
        <p className="mt-4 max-w-md text-paper/60">{product.description}</p>
        <ul className="mt-8 space-y-3 border-t border-paper/10 pt-6">
          {product.included.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 font-mono text-sm text-paper/70"
            >
              <span className="text-coral">+</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StickyTakeover() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(
      PRODUCTS.length - 1,
      Math.max(0, Math.floor(progress * PRODUCTS.length))
    );
    setActive((current) => (current === next ? current : next));
  });

  return (
    <div ref={scrollRef} style={{ height: `${PRODUCTS.length * 100}vh` }}>
      <div className="sticky top-[105px] h-[calc(100vh-105px)] overflow-hidden">
        {/* Default (simultaneous) mode crossfades the outgoing and
            incoming panel together — at most two are ever mounted, and
            only for the transition's duration, instead of every panel
            staying mounted and scroll-scrubbed the whole time. */}
        <AnimatePresence>
          <motion.div
            key={PRODUCTS[active].id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center"
          >
            <ProductPanel product={PRODUCTS[active]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function WorkSection() {
  return (
    <section id="work" className="px-4 sm:px-8">
      <div className="py-20 text-center sm:py-32">
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + What You Get +
        </p>
        <h2 className="mt-4 text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
          Know exactly <span className="text-coral">what ships.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-paper/60">
          No vague scopes. Here&apos;s precisely what&apos;s in each escape.
        </p>
      </div>

      {/* Desktop: pinned takeover, scroll-driven */}
      <div className="hidden sm:block">
        <StickyTakeover />
      </div>

      {/* Mobile: plain stacked list — a full-viewport pin doesn't have
          room for image + copy + list on a small screen */}
      <div className="flex flex-col gap-20 pb-20 sm:hidden">
        {PRODUCTS.map((product) => (
          <ProductPanel key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
