"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const SCREENSHOTS = [
  {
    alt: "The homepage hero",
    desktop: { src: "/images/case-studies/rolls-hero-desktop.png", aspect: "aspect-[8/5]" },
    mobile: { src: "/images/case-studies/rolls-hero-mobile.png", aspect: "aspect-[390/620]" },
  },
  {
    alt: "The flavors lineup section",
    desktop: { src: "/images/case-studies/rolls-flavors-desktop.png", aspect: "aspect-[8/5]" },
    mobile: { src: "/images/case-studies/rolls-flavors-mobile.png", aspect: "aspect-[248/369]" },
  },
  {
    alt: "The product photography section",
    desktop: { src: "/images/case-studies/rolls-food-desktop.png", aspect: "aspect-[20/7]" },
    mobile: { src: "/images/case-studies/rolls-food-mobile-v2.png", aspect: "aspect-[390/420]" },
  },
];

export function ScreenshotReveal() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-16 sm:gap-8 sm:px-8">
      {SCREENSHOTS.map((shot) => (
        <motion.div
          key={shot.alt}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className={`relative ${shot.mobile.aspect} w-full overflow-hidden rounded-[28px] border border-panel-stroke sm:hidden`}
          >
            <Image
              src={shot.mobile.src}
              alt={shot.alt}
              fill
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>
          <div
            className={`relative ${shot.desktop.aspect} hidden w-full overflow-hidden rounded-[28px] border border-panel-stroke sm:block`}
          >
            <Image
              src={shot.desktop.src}
              alt={shot.alt}
              fill
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
