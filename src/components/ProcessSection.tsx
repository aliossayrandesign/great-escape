"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Give us the brief",
    description:
      "Tell us what you're building, who it's for, and what it should feel like. We'll take it from there.",
    image: "/images/process-01-v4.png",
  },
  {
    number: "02",
    title: "We build it",
    description:
      "Built around your brand, not a template. Done right, not just done fast.",
    image: "/images/process-02-v5.png",
  },
  {
    number: "03",
    title: "Your first look",
    description:
      "Delivered within a week — then we refine it together until it's ready to launch.",
    image: "/images/process-03-v12.png",
    accent: true,
  },
];

export function ProcessSection() {
  return (
    <section
      id="process"
      className="overflow-hidden px-4 py-20 sm:px-8 sm:py-32"
    >
      <div className="text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
            + The Process +
          </p>
          <h2 className="mt-4 text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
            Three steps.
            <br />
            <span className="text-coral">One week.</span>
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[28px] border p-7 transition-transform duration-300 hover:-translate-y-1 ${
                step.accent ? "border-coral" : "border-panel-stroke"
              }`}
            >
              <Image
                src={step.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/95 from-10% via-dark-950/10 via-40% to-transparent" />
              <span
                className={`pointer-events-none absolute top-2 right-4 font-semibold tracking-tight select-none ${
                  step.accent ? "text-coral/50" : "text-paper/30"
                }`}
                style={{ fontSize: "5rem", lineHeight: 1 }}
              >
                {step.number}
              </span>
              <h3 className="relative text-balance text-2xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="relative mt-3 text-pretty font-mono text-sm leading-relaxed text-paper/80">
                + {step.description}
              </p>
            </motion.div>
          ))}
      </div>
    </section>
  );
}
