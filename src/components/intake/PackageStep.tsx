"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "../ui/PillButton";
import { PACKAGE_MAX_SKUS, PACKAGE_MIN_SKUS, getPackagePrice } from "@/lib/products";

const OPTIONS = Array.from(
  { length: PACKAGE_MAX_SKUS - PACKAGE_MIN_SKUS + 1 },
  (_, i) => PACKAGE_MIN_SKUS + i
);

export function PackageStep({
  skuCount,
  onSelect,
  onContinue,
}: {
  skuCount: number | null;
  onSelect: (count: number) => void;
  onContinue: () => void;
}) {
  const tooMany = skuCount !== null && skuCount > PACKAGE_MAX_SKUS;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-8 sm:pt-10">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + Package Design +
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          How many SKUs?
        </h1>
        <p className="mt-3 text-pretty text-paper/60">
          Each flavor, size, or variant of the same product counts as one
          SKU.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {OPTIONS.map((n) => {
          const isSelected = skuCount === n;
          return (
            <button
              key={n}
              onClick={() => onSelect(n)}
              className={`flex h-14 w-14 items-center justify-center rounded-full border font-mono text-lg transition-all duration-200 ${
                isSelected
                  ? "border-coral bg-coral/10 text-coral shadow-[0_0_40px_-10px_rgba(255,138,138,0.6)]"
                  : "border-panel-stroke text-paper/70 hover:border-dark-400"
              }`}
            >
              {n}
            </button>
          );
        })}
        <button
          onClick={() => onSelect(PACKAGE_MAX_SKUS + 1)}
          className={`flex h-14 items-center justify-center rounded-full border px-5 font-mono text-sm transition-all duration-200 ${
            tooMany
              ? "border-coral bg-coral/10 text-coral"
              : "border-panel-stroke text-paper/70 hover:border-dark-400"
          }`}
        >
          {PACKAGE_MAX_SKUS}+
        </button>
      </div>

      <AnimatePresence mode="wait">
        {skuCount !== null && !tooMany && (
          <motion.div
            key="price"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-10 text-center"
          >
            <div className="text-5xl font-semibold tracking-tight">
              ${getPackagePrice(skuCount).toLocaleString()}
            </div>
            <p className="mt-2 text-pretty text-sm text-paper/60">
              {skuCount === 1
                ? "One SKU, one fully designed label."
                : `${skuCount} SKUs, same system adapted across each.`}
            </p>
          </motion.div>
        )}

        {tooMany && (
          <motion.div
            key="too-many"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mt-10 max-w-md rounded-[24px] border border-panel-stroke bg-dark-950 p-6 text-center"
          >
            <p className="text-balance text-lg font-semibold tracking-tight">
              Let&apos;s talk for anything over {PACKAGE_MAX_SKUS} SKUs.
            </p>
            <p className="mt-2 text-pretty text-sm text-paper/60">
              Bigger product lines deserve a custom quote.
            </p>
            <a
              href="mailto:hello@greatescape.studio?subject=Package design — more than 5 SKUs"
              className="mt-5 inline-block font-mono text-xs tracking-[0.1em] text-coral uppercase hover:underline"
            >
              Email hello@greatescape.studio →
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {skuCount !== null && !tooMany && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            transition={{ duration: 0.35, ease: "backOut" }}
            className="mt-8 flex justify-center"
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
