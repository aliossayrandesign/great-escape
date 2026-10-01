"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NotchedPanel } from "./ui/NotchedPanel";
import { FogLayer } from "./ui/FogLayer";

export function Hero() {
  return (
    <div className="relative mx-4 sm:mx-8">
      <NotchedPanel radius={32} notchWidth={0} notchHeight={0}>
        <div className="absolute inset-0">
          <Image
            src="/images/hero-portal.webp"
            alt="A figure dissolving into light, walking toward a glowing portal"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <FogLayer />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-dark-900/25 to-transparent" />
        </div>

        <div className="relative flex min-h-[560px] flex-col justify-between px-6 py-10 sm:min-h-[689px] sm:px-16 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex w-fit items-center gap-2 font-mono text-xs tracking-[0.2em] text-coral"
          >
            <span>+</span>
            <span>CREATIVE STUDIO</span>
            <span>+</span>
          </motion.div>

          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-balance text-5xl leading-[0.92] font-semibold tracking-[-0.03em] sm:text-7xl"
            >
              Escape the <span className="text-coral">ordinary.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-md text-pretty text-base text-paper/70 sm:text-lg"
            >
              Tell us your product, drop your inspo links, and get back a
              fully designed website, app, or pitch deck. No meetings, no
              back-and-forth — just a polished product.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <Link
                href="/start"
                className="inline-block transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Image
                  src="/images/nav-cta.svg"
                  alt="Start your escape"
                  width={328}
                  height={70}
                  className="h-12 w-auto sm:h-14"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </NotchedPanel>
    </div>
  );
}
