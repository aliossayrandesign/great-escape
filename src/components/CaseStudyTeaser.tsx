"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function CaseStudyTeaser() {
  return (
    <section className="px-4 py-20 sm:px-8 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/work/rolls"
          className="group mx-auto flex max-w-5xl flex-col items-center gap-10 sm:flex-row sm:gap-16"
        >
          <div className="flex-1 text-center sm:text-left">
            <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
              + How It Works +
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              See a real brief become a finished site.
            </h2>
            <p className="mt-3 max-w-md text-pretty text-paper/60 sm:text-lg">
              The exact intake we received, and exactly what shipped from it
              — watch it happen.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] text-paper/80 uppercase">
              Watch it ship
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>

          <div className="relative aspect-[8/5] w-full shrink-0 overflow-hidden rounded-[28px] border border-panel-stroke transition-colors duration-300 group-hover:border-dark-600 sm:w-[420px]">
            <Image
              src="/images/case-studies/rolls-hero-desktop.png"
              alt="A finished website homepage"
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 640px) 420px, 100vw"
            />
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
