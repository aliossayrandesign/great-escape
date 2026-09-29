"use client";

import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "../ui/PillButton";

export type SiteType = "ecommerce" | "marketing";
export type Platform = "shopify" | "framer" | "custom";

const SITE_TYPES: { id: SiteType; title: string; description: string }[] = [
  {
    id: "ecommerce",
    title: "E-commerce",
    description: "Selling products online, with a cart and checkout.",
  },
  {
    id: "marketing",
    title: "Marketing site",
    description: "Showcasing your business, service, or brand.",
  },
];

const PLATFORMS: Record<
  Platform,
  {
    title: string;
    description: string;
    icon: string;
    iconWidth: number;
    iconHeight: number;
  }
> = {
  shopify: {
    title: "Shopify",
    description: "The standard for online stores — built to sell.",
    icon: "/images/platforms/shopify.svg",
    iconWidth: 258,
    iconHeight: 293,
  },
  framer: {
    title: "Framer",
    description: "Fast, flexible, and easy for you to edit yourself.",
    icon: "/images/platforms/framer.svg",
    iconWidth: 179,
    iconHeight: 269,
  },
  custom: {
    title: "Custom-coded",
    description: "Fully bespoke, for when off-the-shelf won't cut it.",
    icon: "/images/platforms/custom-code.svg",
    iconWidth: 24,
    iconHeight: 24,
  },
};

const PLATFORM_OPTIONS: Record<SiteType, Platform[]> = {
  ecommerce: ["shopify", "custom"],
  marketing: ["framer", "custom"],
};

const RECOMMENDED: Record<SiteType, Platform> = {
  ecommerce: "shopify",
  marketing: "framer",
};

export function PlatformStep({
  siteType,
  platform,
  onSelectSiteType,
  onSelectPlatform,
  onContinue,
}: {
  siteType: SiteType | null;
  platform: Platform | null;
  onSelectSiteType: (type: SiteType) => void;
  onSelectPlatform: (platform: Platform) => void;
  onContinue: () => void;
}) {
  useEffect(() => {
    if (siteType) onSelectPlatform(RECOMMENDED[siteType]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteType]);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + Build It On +
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          What kind of site?
        </h1>
        <p className="mt-3 text-pretty text-paper/60">
          This decides what we build it on — you can go either way.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6">
        {SITE_TYPES.map((type) => {
          const isSelected = siteType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelectSiteType(type.id)}
              className={`rounded-[24px] border border-panel-stroke bg-dark-950 p-6 text-left ring-2 transition-all duration-300 ${
                isSelected
                  ? "ring-coral shadow-[0_0_70px_-12px_rgba(255,138,138,0.6)]"
                  : "ring-transparent hover:ring-dark-600"
              }`}
            >
              <h3 className="text-balance text-xl font-semibold tracking-tight">
                {type.title}
              </h3>
              <p className="mt-2 text-pretty text-sm text-paper/60">{type.description}</p>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {siteType && (
          <motion.div
            key={siteType}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-10"
          >
            <p className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Recommended for this
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PLATFORM_OPTIONS[siteType].map((id) => {
                const p = PLATFORMS[id];
                const isSelected = platform === id;
                const isRecommended = RECOMMENDED[siteType] === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectPlatform(id)}
                    className={`flex items-start gap-4 rounded-[24px] border border-panel-stroke bg-dark-950 p-6 text-left ring-2 transition-all duration-300 ${
                      isSelected
                        ? "ring-coral shadow-[0_0_70px_-12px_rgba(255,138,138,0.6)]"
                        : "ring-transparent hover:ring-dark-600"
                    }`}
                  >
                    <Image
                      src={p.icon}
                      alt={p.title}
                      width={p.iconWidth}
                      height={p.iconHeight}
                      className="mt-1 h-6 w-auto shrink-0 opacity-70"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-balance text-lg font-semibold tracking-tight">
                          {p.title}
                        </h3>
                        {isRecommended && (
                          <span className="rounded-full bg-coral/10 px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-coral uppercase">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-pretty text-sm text-paper/60">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {siteType && platform && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            transition={{ duration: 0.35, ease: "backOut" }}
            className="mt-10 flex justify-center"
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
}
