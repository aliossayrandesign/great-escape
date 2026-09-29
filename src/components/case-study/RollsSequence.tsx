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

// Offsets are the exact card-center positions from the Figma reference
// ("Landing — Desktop", 1440px frame), each measured relative to the notes
// card's center — so `spread = 1` at a 1440px-wide stage reproduces the
// reference layout exactly. Scaled down on narrower windows so cards can
// never be pushed past the viewport edge and clipped.
const PHOTOS: Photo[] = [
  { src: "/images/case-studies/brand-guidelines/wordmark.webp", scatterX: -307, scatterY: -40, scatterRotate: -8, z: 10 },
  { src: "/images/case-studies/brand-guidelines/colors.webp", scatterX: 318, scatterY: -81, scatterRotate: 6, z: 20 },
  { src: "/images/case-studies/brand-guidelines/type.webp", scatterX: -267, scatterY: 134, scatterRotate: 7, z: 30 },
  { src: "/images/case-studies/brand-guidelines/photography.webp", scatterX: 310, scatterY: 149, scatterRotate: -5, z: 40 },
  { src: "/images/case-studies/brand-guidelines/brandmark.webp", scatterX: 30, scatterY: 208, scatterRotate: 3, z: 50 },
];

const LINKS = ["liquiddeath.com", "huel.com", "lastcrumb.com", "bloomnu.com"];
const NOTES =
  "We're a bold, loud brand — think streetwear meets bakery, not another soft-serve “artisanal” food site. Big wordmark, punchy copy, real product shots doing the talking. Needs to actually sell, not just look nice.";

// This whole section plays out ONCE as you scroll through it, then unpins
// and normal static content follows below — no pinned content is ever
// shared with what comes next, so there's nothing for it to ghost behind.
// Phases: 0-0.35 hold (fully visible, nothing hidden) → 0.35-0.6 consolidate
// (fly together into a stack) → 0.6-0.75 shrink → 0.75-1 the whole stack
// (cards + brief card) sinks down and fades together as ONE rigid unit, via
// a single wrapper-level transform — so nothing drifts apart, and that last
// quarter of the scroll range is wide enough that it tracks your scroll
// instead of snapping.
function PhotoLayer({
  photo,
  progress,
  spread,
}: {
  photo: Photo;
  progress: MotionValue<number>;
  spread: number;
}) {
  const x = useTransform(progress, [0.35, 0.6], [photo.scatterX * spread, 0]);
  const y = useTransform(progress, [0.35, 0.6], [photo.scatterY * spread, 0]);
  const rotate = useTransform(progress, [0.35, 0.6], [photo.scatterRotate, 0]);
  const scale = useTransform(progress, [0.35, 0.6, 0.75], [1, 0.9, 0.45]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, zIndex: photo.z }}
      className="absolute top-1/2 left-1/2 w-[150px] -translate-x-1/2 -translate-y-1/2 sm:w-[280px]"
    >
      <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-panel-stroke shadow-[0_20px_50px_-14px_rgba(0,0,0,0.75)]">
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

  // Offsets are exact at the Figma reference width (1440px desktop frame).
  // Scale down proportionally on narrower windows, floored at 0.65 so cards
  // on phones still spread apart noticeably instead of collapsing to a
  // near-unreadable pile at the true 1440-proportional scale — some of the
  // widest cards can bleed slightly past the screen edge at that floor,
  // which reads fine since the section is already overflow-hidden.
  const [spread, setSpread] = useState(1);
  useEffect(() => {
    const update = () => setSpread(Math.max(0.65, Math.min(1, window.innerWidth / 1440)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // The brief card holds steady through the hold + consolidate phases, then
  // shrinks into the stack in sync with the photos, nudging toward center so
  // it converges with them — ending up behind the brandmark card (z-45 vs
  // its z-50), which is the last thing left visible before the whole stack
  // sinks away (see stackY/stackScale/stackOpacity below).
  const notesY = useTransform(scrollYProgress, [0.6, 0.75], [0, -60]);
  const notesScale = useTransform(scrollYProgress, [0.6, 0.75], [1, 0.45]);
  const arrowOpacity = useTransform(scrollYProgress, [0.05, 0.2], [1, 0]);

  // Applied once, at the wrapper level, so every card and the brief card
  // move down and fade as a single rigid block — no per-element drift.
  const stackY = useTransform(scrollYProgress, [0.75, 1], [0, 260]);
  const stackScale = useTransform(scrollYProgress, [0.75, 1], [1, 0.7]);
  const stackOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <div ref={scrollRef} style={{ height: "260vh" }}>
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

        <motion.div
          style={{ y: stackY, scale: stackScale, opacity: stackOpacity }}
          className="relative z-10 h-[400px] w-full max-w-3xl sm:h-[340px]"
        >
          {PHOTOS.map((photo) => (
            <PhotoLayer key={photo.src} photo={photo} progress={scrollYProgress} spread={spread} />
          ))}

          <motion.div
            style={{ y: notesY, scale: notesScale, zIndex: 45 }}
            className="absolute top-[2%] left-1/2 w-[75%] max-w-xs -translate-x-1/2 rounded-[20px] border border-panel-stroke bg-dark-950/95 p-4 text-left shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:top-[4%] sm:max-w-sm sm:p-6"
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
        </motion.div>

        <motion.span
          style={{ opacity: arrowOpacity }}
          className="relative z-10 font-mono text-2xl text-dark-600"
        >
          ↓
        </motion.span>
      </div>
    </div>
  );
}
