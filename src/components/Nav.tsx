"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedLogo } from "./ui/AnimatedLogo";

export function Nav() {
  const [closed, setClosed] = useState(false);
  const lastY = useRef(0);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current;
      lastY.current = y;

      if (stopTimer.current) clearTimeout(stopTimer.current);

      if (y < 8) {
        setClosed(false);
      } else if (goingDown) {
        setClosed(true);
        stopTimer.current = setTimeout(() => setClosed(false), 150);
      } else {
        setClosed(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-panel-stroke/40 bg-dark-950/70 px-4 py-5 backdrop-blur-md sm:px-8 sm:py-6">
      <Link href="/" className="flex items-center">
        <AnimatedLogo closed={closed} className="h-[26px] w-auto sm:h-[30px]" />
      </Link>

      <div className="hidden items-center gap-10 md:flex">
        <Link
          href="#process"
          className="font-mono text-xs tracking-[0.15em] uppercase text-paper/90 hover:text-paper"
        >
          Process
        </Link>
        <Link
          href="#work"
          className="font-mono text-xs tracking-[0.15em] uppercase text-paper/90 hover:text-paper"
        >
          Work
        </Link>
        <Link
          href="#pricing"
          className="font-mono text-xs tracking-[0.15em] uppercase text-paper/90 hover:text-paper"
        >
          Pricing
        </Link>
        <Link
          href="/start"
          className="inline-block transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          <Image
            src="/images/nav-cta.svg"
            alt="Start your escape"
            width={328}
            height={70}
            className="h-14 w-auto"
          />
        </Link>
      </div>

      <Link href="/start" className="md:hidden">
        <Image
          src="/images/nav-cta.svg"
          alt="Start your escape"
          width={328}
          height={70}
          className="h-10 w-auto"
        />
      </Link>
    </nav>
  );
}
