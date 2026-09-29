import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowFog } from "../ui/GlowFog";
import { PillButton } from "../ui/PillButton";

export function ConfirmationStep() {
  return (
    <div
      className="relative flex flex-col justify-end overflow-hidden text-center"
      style={{ height: "min(calc(100dvh - 88px), 60vw)", minHeight: "560px" }}
    >
      <Image
        src="/images/confirmation-mason-v2.png"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 from-5% via-dark-950/60 via-28% to-transparent to-55%" />
      <GlowFog />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex max-w-2xl flex-col items-center px-6 pt-24 pb-16 sm:pb-24"
      >
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          You&apos;re in.
        </h1>
        <p className="mt-4 max-w-md text-pretty text-paper/60">
          We&apos;re already looking at your inspo. Your first look lands in
          your inbox within 1 week — no meetings, no back-and-forth.
        </p>
        <Link href="/" className="mt-10">
          <PillButton size="lg" variant="paper">
            Back to home
          </PillButton>
        </Link>
      </motion.div>
    </div>
  );
}
