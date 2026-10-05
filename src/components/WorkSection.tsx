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

const TOOLS = {
  framer: { label: "Framer", icon: "/images/platforms/framer.svg", w: 179, h: 269 },
  shopify: { label: "Shopify", icon: "/images/platforms/shopify.svg", w: 258, h: 293 },
  code: { label: "Custom code", icon: "/images/platforms/custom-code.svg", w: 24, h: 24 },
  figma: { label: "Figma", icon: "/images/platforms/figma.svg", w: 24, h: 24 },
  pdf: { label: "PDF", icon: "/images/platforms/pdf.svg", w: 24, h: 24 },
  ai: { label: "Adobe Illustrator (.ai)", icon: "/images/platforms/ai-file.svg", w: 559, h: 430, heightClass: "h-3.5" },
};

const PRODUCTS = [
  {
    id: "website",
    number: "01",
    title: "Website",
    tagline: "A site built to convert, not just exist.",
    description:
      "Clear about what you do, confident about why it matters, easy to say yes to.",
    included: [
      "Home + up to 5 core pages",
      "Responsive across every device",
      "Copy refined to your brand voice",
      "Contact & lead forms wired up",
      "Launch-ready structure, SEO built in",
    ],
    image: "/images/card-website.png",
    tools: [TOOLS.framer, TOOLS.shopify, TOOLS.code],
  },
  {
    id: "app",
    number: "02",
    title: "App",
    tagline: "Every screen your product needs, mapped and designed.",
    description:
      "From first open to your core loop — onboarding, empty states, edge cases — the full experience, designed with the same care all the way through.",
    included: [
      "Onboarding + core product flows",
      "Every state: empty, loading, error",
      "A clickable prototype to test with real users",
      "Dev-ready specs & exportable assets",
      "Light & dark variants",
    ],
    image: "/images/card-app.png",
    tools: [TOOLS.figma, TOOLS.code],
  },
  {
    id: "package",
    number: "03",
    title: "Package Design",
    tagline: "A label that sells itself off the shelf.",
    description:
      "A complete label system designed around your brand, built to actual print specs so it goes straight to your printer.",
    included: [
      "Print-ready dieline & label design",
      "Delivered as a print-ready Adobe Illustrator (.ai) file",
      "Pantone/CMYK color-accurate artwork",
      "Scales with SKUs — $600 per additional variant",
    ],
    image: "/images/card-package.png",
    tools: [TOOLS.ai, TOOLS.pdf],
  },
  {
    id: "deck",
    number: "04",
    title: "Pitch Deck",
    tagline: "The story that gets you the yes.",
    description:
      "Built to hold a room's attention long enough to get the yes.",
    included: [
      "12–15 slide narrative deck",
      "Custom charts & data visuals",
      "Investor-grade visual system",
      "Editable source file, yours to keep",
    ],
    image: "/images/card-deck.png",
    tools: [TOOLS.figma, TOOLS.pdf],
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
        <h3 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {product.title}
        </h3>
        <p className="mt-4 text-balance text-xl font-semibold tracking-tight text-paper/90 sm:text-2xl">
          {product.tagline}
        </p>
        <p className="mt-4 max-w-md text-pretty text-paper/60">{product.description}</p>

        <div className="mt-6 flex items-center gap-6">
          {product.tools.map((tool) => (
            <div key={tool.label} className="flex items-center gap-2">
              <Image
                src={tool.icon}
                alt={tool.label}
                width={tool.w}
                height={tool.h}
                className={`w-auto opacity-60 ${"heightClass" in tool ? tool.heightClass : "h-5"}`}
              />
              <span className="font-mono text-xs tracking-[0.1em] text-paper/50 uppercase">
                {tool.label}
              </span>
            </div>
          ))}
        </div>

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
        <h2 className="mt-4 text-balance text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
          Know exactly <span className="text-coral">what ships.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-paper/60">
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
