"use client";

import { motion } from "framer-motion";

const LOGO_CLASS =
  "h-3 w-auto shrink-0 brightness-0 invert opacity-40 transition-opacity duration-200 hover:opacity-80 sm:h-5 md:h-6 lg:h-8";

const BRANDS = [
  { name: "Disney", src: "/images/logos/disney.png", className: "h-4 sm:h-7 md:h-8 lg:h-10" },
  { name: "Spotify", src: "/images/logos/spotify.svg", className: "h-4 sm:h-7 md:h-8 lg:h-10" },
  { name: "GoPuff", src: "/images/logos/gopuff.svg" },
  { name: "BevMo", src: "/images/logos/bevmo.svg" },
  { name: "Halo Top", src: "/images/logos/halotop.svg", className: "h-4 sm:h-6 md:h-7 lg:h-9" },
  { name: "Sunrun", src: "/images/logos/sunrun.svg" },
];

export function TrustedBySection() {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xs text-center font-mono text-[10px] leading-relaxed tracking-[0.08em] text-coral uppercase sm:mx-0 sm:max-w-none sm:whitespace-nowrap sm:text-[10px] sm:tracking-[0.12em] xl:text-xs xl:tracking-[0.2em]"
      >
        + Designer-trained AI — every project personally refined by
        designers who&apos;ve created work for these brands +
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mt-6 flex max-w-full flex-nowrap items-center justify-center gap-x-3 overflow-x-auto px-2 sm:mt-8 sm:gap-x-6 md:gap-x-8 lg:gap-x-12"
      >
        {BRANDS.map(({ name, src, className }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={name}
            src={src}
            alt={name}
            className={`${LOGO_CLASS} ${className ?? ""}`}
          />
        ))}
      </motion.div>
    </section>
  );
}
