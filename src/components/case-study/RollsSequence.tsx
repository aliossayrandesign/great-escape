"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { NotchedPanel } from "../ui/NotchedPanel";
import { GlowFog } from "../ui/GlowFog";

type Photo = {
  src: string;
  scatterX: number;
  scatterY: number;
  scatterRotate: number;
  stackX: number;
  stackY: number;
  stackRotate: number;
  z: number;
};

// X is horizontal-only — safe to spread generously (scaled by `spread` for
// narrow windows). Y is capped at ±90 on purpose: the stage sits right below
// the heading with a fixed flex gap, and this keeps every card's top edge
// (offset + half card height) inside that gap on any window height, so
// nothing can ever climb up into the heading text.
const PHOTOS: Photo[] = [
  { src: "/images/case-studies/brand-guidelines/wordmark.webp", scatterX: -300, scatterY: -55, scatterRotate: -8, stackX: -14, stackY: -10, stackRotate: -6, z: 10 },
  { src: "/images/case-studies/brand-guidelines/colors.webp", scatterX: 300, scatterY: -65, scatterRotate: 6, stackX: 10, stackY: -6, stackRotate: 4, z: 20 },
  { src: "/images/case-studies/brand-guidelines/type.webp", scatterX: -330, scatterY: 65, scatterRotate: 7, stackX: -8, stackY: 8, stackRotate: -3, z: 30 },
  { src: "/images/case-studies/brand-guidelines/photography.webp", scatterX: 330, scatterY: 55, scatterRotate: -5, stackX: 12, stackY: 10, stackRotate: 5, z: 40 },
  { src: "/images/case-studies/brand-guidelines/brandmark.webp", scatterX: 0, scatterY: 90, scatterRotate: 3, stackX: 0, stackY: 0, stackRotate: 0, z: 5 },
];

const LINKS = ["liquiddeath.com", "feastables.com", "instagram.com/[brand]"];
const NOTES =
  "We're a bold, loud brand — think streetwear meets bakery, not another soft-serve “artisanal” food site. Big wordmark, punchy copy, real product shots doing the talking. Needs to actually sell, not just look nice.";

const OUTPUT_SHOTS = [
  { src: "/images/case-studies/rolls-howitworks-desktop.png", alt: "The how-it-works section", rotate: -3, x: -18, y: 14, z: 10 },
  { src: "/images/case-studies/rolls-flavors-desktop.png", alt: "The flavors lineup section", rotate: 2, x: 14, y: -10, z: 20 },
  { src: "/images/case-studies/rolls-hero-desktop.jpg", alt: "The homepage hero", rotate: 0, x: 0, y: 0, z: 30 },
];

// The scroll range is split into two hard, mutually-exclusive phases.
// Nothing fades to "almost zero" — at the threshold the brief phase
// unmounts completely (AnimatePresence exit, then gone) and the reveal
// phase mounts. No continuous opacity math has to land exactly on 0.
const PHASE_SWITCH = 0.45;

function PhotoLayer({
  photo,
  progress,
  spread,
}: {
  photo: Photo;
  progress: MotionValue<number>;
  spread: number;
}) {
  const x = useTransform(progress, [0, 0.7], [photo.scatterX * spread, photo.stackX]);
  const y = useTransform(progress, [0, 0.7], [photo.scatterY * spread, photo.stackY]);
  const rotate = useTransform(progress, [0, 0.7], [photo.scatterRotate, photo.stackRotate]);
  const scale = useTransform(progress, [0, 0.7, 1], [1, 0.85, 0.42]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, zIndex: photo.z }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
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

  const [phase, setPhase] = useState<"brief" | "reveal">("brief");
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The scatter offsets below are tuned for a ~1100px-wide stage. On
  // narrower windows, scale them down proportionally so cards can never be
  // pushed past the viewport edge and clipped, regardless of window size.
  const [spread, setSpread] = useState(1);
  useEffect(() => {
    const update = () => setSpread(Math.min(1, window.innerWidth / 1100));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Sub-progress used only for the brief-phase consolidate/shrink motion,
  // rescaled so it completes exactly as the phase switch happens.
  const briefProgress = useTransform(scrollYProgress, [0, PHASE_SWITCH], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < PHASE_SWITCH ? "brief" : "reveal";
    setPhase((prev) => {
      if (prev === next) return prev;
      setFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(false), 500);
      return next;
    });
  });

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ height: "350vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(255,138,138,0.35), transparent 70%)",
          }}
        />
        <GlowFog />

        <AnimatePresence mode="wait">
          {phase === "brief" && (
            <motion.div
              key="brief"
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 sm:gap-8"
            >
              <div className="text-center">
                <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
                  + How It Works +
                </p>
                <h1 className="mt-3 text-balance text-3xl leading-[0.95] font-semibold tracking-tight sm:mt-4 sm:text-5xl">
                  One brief.
                  <br />
                  <span className="text-coral">Watch it ship.</span>
                </h1>
              </div>

              <div className="relative h-[280px] w-full max-w-3xl sm:h-[340px]">
                {PHOTOS.map((photo) => (
                  <PhotoLayer key={photo.src} photo={photo} progress={briefProgress} spread={spread} />
                ))}

                <motion.div
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-8"
            >
              <NotchedPanel radius={32} notchWidth={0} notchHeight={0}>
                <div className="relative aspect-[8/5]">
                  {OUTPUT_SHOTS.map((shot) => (
                    <div
                      key={shot.src}
                      style={{
                        transform: `rotate(${shot.rotate}deg) translate(${shot.x}px, ${shot.y}px)`,
                        zIndex: shot.z,
                      }}
                      className="absolute inset-[3%] overflow-hidden rounded-[24px] border border-panel-stroke shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] sm:inset-[4%]"
                    >
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        className="object-cover object-top"
                        sizes="90vw"
                      />
                    </div>
                  ))}
                </div>
              </NotchedPanel>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="mt-6 text-center text-pretty text-sm text-paper/60"
              >
                The homepage, the flavors, and the full ritual — all shipped
                in 6 days from the brief above.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute inset-0 z-[90]"
              aria-hidden
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,138,138,0.95), rgba(255,138,138,0.2) 55%, transparent 80%)",
                  mixBlendMode: "screen",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
