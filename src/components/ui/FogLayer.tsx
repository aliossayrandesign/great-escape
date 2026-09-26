import type { CSSProperties } from "react";

type Wisp = {
  left: string;
  bottom: string;
  size: string;
  duration: string;
  delay: string;
  peak: number;
  drift: string;
  tint?: string;
};

// Colors sampled directly from the hero photo's glow: a warm orange-peach
// near the base of the portal, a pinker magenta higher up the arch.
const ORANGE = "250,195,162";
const PINK = "230,140,160";

// Staggered negative delays mean several wisps are always mid-rise at once,
// so it reads as continuous steam rather than one pulse repeating.
const WISPS: Wisp[] = [
  { left: "5%", bottom: "0%", size: "55%", duration: "9s", delay: "-1s", peak: 0.32, drift: "6%", tint: ORANGE },
  { left: "30%", bottom: "-10%", size: "60%", duration: "11s", delay: "-5s", peak: 0.28, drift: "-8%", tint: PINK },
  { left: "55%", bottom: "5%", size: "50%", duration: "8s", delay: "-3s", peak: 0.3, drift: "5%", tint: ORANGE },
  { left: "15%", bottom: "10%", size: "45%", duration: "10s", delay: "-7s", peak: 0.24, drift: "-6%", tint: ORANGE },
  { left: "45%", bottom: "-5%", size: "58%", duration: "12s", delay: "-2s", peak: 0.26, drift: "9%", tint: PINK },
  { left: "0%", bottom: "20%", size: "40%", duration: "7.5s", delay: "-4.5s", peak: 0.22, drift: "-4%", tint: ORANGE },
];

/**
 * Rising steam wisps confined to the doorway region of the hero photo —
 * where fog is already baked into the image — so the whole thing reads as
 * that existing haze coming alive, not a separate effect layered on top.
 */
export function FogLayer() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-[42%] w-[48%] overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
      }}
    >
      {WISPS.map((w, i) => (
        <div
          key={i}
          className="animate-steam absolute rounded-full"
          style={
            {
              left: w.left,
              bottom: w.bottom,
              width: w.size,
              height: w.size,
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${w.tint ?? "255,255,255"},0.95), rgba(255,255,255,0) 70%)`,
              filter: "blur(35px)",
              mixBlendMode: "screen",
              animationDuration: w.duration,
              animationDelay: w.delay,
              "--peak": w.peak,
              "--drift": w.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
