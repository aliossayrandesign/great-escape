"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate } from "framer-motion";

function notchedPanelPath(
  w: number,
  h: number,
  r: number,
  notchW: number,
  notchH: number,
  notchRadius: number,
  edgeRadius: number
) {
  const nw = Math.min(notchW, w - r);
  const nh = Math.min(notchH, h - r);
  const nr = Math.min(notchRadius, nw / 2, nh / 2);
  const er = Math.min(edgeRadius, nr, nh - nr, nw - nr);

  if (nw <= 0 || nh <= 0 || er <= 0) {
    return [
      `M ${r} 0`,
      `H ${w - r}`,
      `A ${r} ${r} 0 0 1 ${w} ${r}`,
      `V ${h - r}`,
      `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
      `H ${r}`,
      `A ${r} ${r} 0 0 1 0 ${h - r}`,
      `V ${r}`,
      `A ${r} ${r} 0 0 1 ${r} 0`,
      "Z",
    ].join(" ");
  }

  // Every corner of the notch is rounded, not just the inner elbow: the two
  // points where the cut meets the panel's straight edges get a small
  // convex radius (sweep 1, same sense as the panel's own corners), and the
  // inner elbow gets a larger concave fillet (sweep 0) so the whole cut
  // reads as one continuous curve wrapping the pill, not a rectangular bite.
  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${h - nh - er}`,
    `A ${er} ${er} 0 0 1 ${w - er} ${h - nh}`,
    `H ${w - nw + nr}`,
    `A ${nr} ${nr} 0 0 0 ${w - nw} ${h - nh + nr}`,
    `V ${h - er}`,
    `A ${er} ${er} 0 0 1 ${w - nw - er} ${h}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
}

/**
 * A rounded panel whose bottom-right corner is cut away into a sharp
 * rectangular notch — the same shape Figma produces with a boolean
 * subtract. Uses a measured SVG path (not CSS polygon()) so the three
 * un-notched corners keep their radius; polygon() can't express arcs.
 */
export function NotchedPanel({
  children,
  radius = 32,
  notchWidth = 356,
  notchHeight = 124,
  notchRadius = 32,
  edgeRadius = 16,
  notchBelowWidth = 640,
  animateReveal = false,
  revealDelay = 0.5,
  revealDuration = 0.75,
  className = "",
}: {
  children: ReactNode;
  radius?: number;
  notchWidth?: number;
  notchHeight?: number;
  /** Radius of the concave fillet where the notch meets the panel material. */
  notchRadius?: number;
  /** Radius of the two convex corners where the cut meets the panel edges. */
  edgeRadius?: number;
  /** Below this container width, the notch is skipped (plain rounded rect). */
  notchBelowWidth?: number;
  /** Starts as a full, uncut panel and opens the notch on mount — pair with
   *  the CTA's own entrance timing so the cut and the button grow in
   *  lockstep, like the material is being pushed open. */
  animateReveal?: boolean;
  revealDelay?: number;
  revealDuration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [reveal, setReveal] = useState(animateReveal ? 0 : 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animateReveal) return;
    const controls = animate(0, 1, {
      duration: revealDuration,
      delay: revealDelay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setReveal(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateReveal]);

  const useNotch = size ? size.w >= notchBelowWidth : false;
  const path = size
    ? notchedPanelPath(
        size.w,
        size.h,
        radius,
        useNotch ? notchWidth * reveal : 0,
        useNotch ? notchHeight * reveal : 0,
        notchRadius * reveal,
        edgeRadius * reveal
      )
    : null;

  return (
    <div
      ref={ref}
      className={`relative bg-dark-800 ${className}`}
      style={
        path
          ? {
              clipPath: `path('${path}')`,
              WebkitClipPath: `path('${path}')`,
            }
          : { borderRadius: radius }
      }
    >
      {children}
      {path && size && (
        <svg
          className="pointer-events-none absolute inset-0"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
        >
          <path
            d={path}
            fill="none"
            stroke="var(--color-panel-stroke)"
            strokeWidth={1}
          />
        </svg>
      )}
    </div>
  );
}
