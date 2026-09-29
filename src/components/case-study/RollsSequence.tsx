"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { GlowFog } from "../ui/GlowFog";

type Photo = {
  src: string;
  scatterX: number;
  scatterY: number;
  scatterRotate: number;
  z: number;
};

// X is horizontal-only — safe to spread generously (scaled by `spread` for
// narrow windows). Y is capped small on purpose: the stage sits right below
// the heading with a fixed flex gap, and this keeps every card's top edge
// (offset + half card height) inside that gap on any window height, so
// nothing can ever climb up into the heading text.
const PHOTOS: Photo[] = [
  { src: "/images/case-studies/brand-guidelines/wordmark.webp", scatterX: -300, scatterY: -55, scatterRotate: -8, z: 10 },
  { src: "/images/case-studies/brand-guidelines/colors.webp", scatterX: 300, scatterY: -65, scatterRotate: 6, z: 20 },
  { src: "/images/case-studies/brand-guidelines/type.webp", scatterX: -330, scatterY: 65, scatterRotate: 7, z: 30 },
  { src: "/images/case-studies/brand-guidelines/photography.webp", scatterX: 330, scatterY: 55, scatterRotate: -5, z: 40 },
  { src: "/images/case-studies/brand-guidelines/brandmark.webp", scatterX: 0, scatterY: 90, scatterRotate: 3, z: 50 },
];

const LINKS = ["liquiddeath.com", "feastables.com", "instagram.com/[brand]"];
const NOTES =
  "We're a bold, loud brand — think streetwear meets bakery, not another soft-serve “artisanal” food site. Big wordmark, punchy copy, real product shots doing the talking. Needs to actually sell, not just look nice.";

// This whole section plays out ONCE as you scroll through it, then unpins
// and normal static content follows below — no pinned content is ever
// shared with what comes next, so there's nothing for it to ghost behind.
// Phases: 0-0.4 hold (fully visible, nothing hidden) → 0.4-0.7 consolidate
// (fly together into a stack) → 0.7-0.85 shrink → 0.85-1 dissolve.
function PhotoLayer({
  photo,
  progress,
  spread,
}: {
  photo: Photo;
  progress: MotionValue<number>;
  spread: number;
}) {
  const x = useTransform(progress, [0.4, 0.7], [photo.scatterX * spread, 0]);
  const y = useTransform(progress, [0.4, 0.7], [photo.scatterY * spread, 0]);
  const rotate = useTransform(progress, [0.4, 0.7], [photo.scatterRotate, 0]);
  const scale = useTransform(progress, [0.4, 0.7, 0.85], [1, 0.9, 0.4]);
  const opacity = useTransform(progress, [0.85, 1], [1, 0]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, opacity, zIndex: photo.z }}
      className="absolute top-1/2 left-1/2 w-[220px] -translate-x-1/2 -translate-y-1/2 sm:w-[260px]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-panel-stroke shadow-[0_20px_50px_-14px_rgba(0,0,0,0.75)]">
        <Image src={photo.src} alt="" fill className="object-cover" sizes="300px" />
      </div>
    </motion.div>
  );
}

export function RollsSequence() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  // The scatter offsets are tuned for a ~1100px-wide stage. On narrower
  // windows, scale them down proportionally so cards can never be pushed
  // past the viewport edge and clipped, regardless of window size.
  const [spread, setSpread] = useState(1);
  useEffect(() => {
    const update = () => setSpread(Math.min(1, window.innerWidth / 1100));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const notesOpacity = useTransform(scrollYProgress, [0.4, 0.55], [1, 0]);
  const notesScale = useTransform(scrollYProgress, [0.4, 0.55], [1, 0.9]);

  return (
    <div ref={scrollRef} style={{ height: "220vh" }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 sm:gap-8">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(255,138,138,0.35), transparent 70%)",
          }}
        />
        <GlowFog />

        <div className="relative z-10 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
            + How It Works +
          </p>
          <h1 className="mt-3 text-balance text-3xl leading-[0.95] font-semibold tracking-tight sm:mt-4 sm:text-5xl">
            One brief.
            <br />
            <span className="text-coral">Watch it ship.</span>
          </h1>
        </div>

        <div className="relative z-10 h-[280px] w-full max-w-3xl sm:h-[340px]">
          {PHOTOS.map((photo) => (
            <PhotoLayer key={photo.src} photo={photo} progress={scrollYProgress} spread={spread} />
          ))}

          <motion.div
            style={{ opacity: notesOpacity, scale: notesScale }}
            className="absolute top-[8%] left-1/2 z-[60] w-[82%] max-w-xs -translate-x-1/2 rounded-[20px] border border-panel-stroke bg-dark-950/95 p-5 text-left shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:top-[4%] sm:max-w-sm sm:p-6"
          >
            <p className="font-mono text-[10px] tracking-[0.15em] text-coral uppercase">
              The notes
            </p>
            <p className="mt-2 text-pretty text-xs leading-relaxed text-paper/90 sm:text-sm">
              {NOTES}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-dark-800 pt-3">
              {LINKS.map((link) => (
                <span
                  key={link}
                  className="rounded-full border border-dark-700 px-2.5 py-1 font-mono text-[9px] text-paper/60"
                >
                  {link}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.span
          style={{ opacity: notesOpacity }}
          className="relative z-10 font-mono text-2xl text-dark-600"
        >
          ↓
        </motion.span>
      </div>
    </div>
  );
}
