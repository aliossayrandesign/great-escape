"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const SCREENSHOTS = [
  { src: "/images/case-studies/rolls-hero-desktop.jpg", alt: "The homepage hero" },
  { src: "/images/case-studies/rolls-flavors-desktop.png", alt: "The flavors lineup section" },
];

export function ScreenshotReveal() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-16 sm:gap-8 sm:px-8">
      {SCREENSHOTS.map((shot) => (
        <motion.div
          key={shot.src}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[8/5] w-full overflow-hidden rounded-[28px] border border-panel-stroke"
        >
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            className="object-cover object-top"
            sizes="(min-width: 640px) 896px, 100vw"
          />
        </motion.div>
      ))}
    </div>
  );
}
