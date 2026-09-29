"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function CaseStudyTeaser() {
  return (
    <section className="px-4 pb-20 sm:px-8 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl"
      >
        <Link
          href="/work/rolls"
          className="group flex flex-col items-center gap-6 overflow-hidden rounded-[28px] border border-panel-stroke bg-dark-950 p-6 transition-colors duration-300 hover:border-dark-600 sm:flex-row sm:gap-8 sm:p-8"
        >
          <div className="relative aspect-[8/5] w-full shrink-0 overflow-hidden rounded-[18px] sm:w-72">
            <Image
              src="/images/case-studies/rolls-hero-desktop.jpg"
              alt="A finished website homepage"
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 640px) 288px, 90vw"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
              + How It Works +
            </p>
            <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              See a real brief become a finished site.
            </h3>
            <p className="mt-2 text-pretty text-sm text-paper/60">
              The exact intake we received, and exactly what shipped from
              it — watch it happen.
            </p>
          </div>

          <span className="font-mono text-sm text-paper/70 transition-transform duration-300 group-hover:translate-x-1 sm:text-base">
            →
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
