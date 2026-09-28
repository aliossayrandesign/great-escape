"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "../ui/PillButton";
import { GlowFog } from "../ui/GlowFog";

export type ProductType = "website" | "app" | "deck";

const PRODUCTS: {
  id: ProductType;
  title: string;
  price: number;
  description: string;
  included: string[];
  image: string;
}[] = [
  {
    id: "website",
    title: "Website",
    price: 2500,
    description: "A full marketing site — home, pages, and everything in between.",
    included: [
      "Home + up to 5 core pages",
      "Responsive across every device",
      "Copy refined to your brand voice",
    ],
    image: "/images/card-website-wide6.png",
  },
  {
    id: "app",
    title: "App",
    price: 4500,
    description: "A product interface — screens, flows, and states.",
    included: [
      "Onboarding + core product flows",
      "Every state: empty, loading, error",
      "Dev-ready specs & exportable assets",
    ],
    image: "/images/card-app-wide.png",
  },
  {
    id: "deck",
    title: "Pitch Deck",
    price: 1000,
    description: "A deck built to raise, sell, or pitch.",
    included: [
      "12–15 slide narrative deck",
      "Custom charts & data visuals",
      "Investor-grade visual system",
    ],
    image: "/images/card-deck-wide.png",
  },
];

export function ProductStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ProductType | null;
  onSelect: (id: ProductType) => void;
  onContinue: () => void;
}) {
  return (
    <div className="px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + Your Escape +
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          What are we building?
        </h1>
        <p className="mt-3 text-paper/60">
          Pick one — you can always come back for another.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-8">
        {PRODUCTS.map((product) => {
          const isSelected = selected === product.id;
          return (
            <div key={product.id} className="flex flex-col items-center">
              <button
                onClick={() => onSelect(product.id)}
                className={`group relative flex w-full flex-col overflow-hidden rounded-[28px] border border-panel-stroke bg-dark-950 text-left ring-2 transition-all duration-300 ${
                  isSelected
                    ? "ring-coral shadow-[0_0_70px_-12px_rgba(255,138,138,0.6)]"
                    : "ring-transparent hover:ring-dark-600"
                }`}
              >
                <div className="relative aspect-[16/11] w-full overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                  {isSelected && <GlowFog />}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {product.title}
                    </h3>
                    <span className="shrink-0 rounded-full bg-dark-900/80 px-3 py-1 font-mono text-xs tracking-[0.1em] text-coral">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-paper/60">
                    {product.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-paper/10 pt-5">
                    {product.included.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 font-mono text-xs text-paper/70"
                      >
                        <span className="text-coral">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: -10 }}
                    transition={{ duration: 0.35, ease: "backOut" }}
                    className="mt-6"
                  >
                    <PillButton
                      size="xl"
                      variant="paper"
                      onClick={onContinue}
                      className="h-14 w-[262px]"
                    >
                      Continue →
                    </PillButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
