"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowFog } from "./ui/GlowFog";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 text-center sm:px-8 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,138,138,0.35), transparent 70%)",
        }}
      />
      <GlowFog />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + Ready When You Are +
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
          Your next project is one <span className="text-coral">brief</span> away.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-paper/60">
          Tell us your product. Get back a fully designed website, app, or
          pitch deck in a week — no meetings required.
        </p>
        <div className="mt-10 flex justify-center">
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
      </motion.div>
    </section>
  );
}
