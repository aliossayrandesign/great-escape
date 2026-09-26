import type { CSSProperties } from "react";

type Wisp = {
  left: string;
  bottom: string;
  size: string;
  duration: string;
  delay: string;
  peak: number;
  drift: string;
};

const CORAL = "255,138,138";

const WISPS: Wisp[] = [
  { left: "10%", bottom: "-10%", size: "50%", duration: "10s", delay: "-2s", peak: 0.3, drift: "6%" },
  { left: "35%", bottom: "-15%", size: "60%", duration: "13s", delay: "-6s", peak: 0.26, drift: "-7%" },
  { left: "60%", bottom: "-5%", size: "48%", duration: "9s", delay: "-4s", peak: 0.3, drift: "5%" },
  { left: "78%", bottom: "-12%", size: "55%", duration: "12s", delay: "-8s", peak: 0.24, drift: "-6%" },
  { left: "22%", bottom: "0%", size: "40%", duration: "8s", delay: "-1s", peak: 0.22, drift: "4%" },
];

/**
 * Full-width rising glow wisps for sections without a photo to anchor to —
 * same steam-rise animation as the hero's FogLayer, tinted coral to match
 * the section's own radial glow instead of the hero's sampled photo tones.
 */
export function GlowFog() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to top, black 0%, black 55%, transparent 85%)",
        maskImage:
          "linear-gradient(to top, black 0%, black 55%, transparent 85%)",
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
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${CORAL},0.9), rgba(255,255,255,0) 70%)`,
              filter: "blur(40px)",
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
