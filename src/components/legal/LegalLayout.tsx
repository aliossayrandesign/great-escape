import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export function LegalLayout({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="pt-28 sm:pt-36">
      <Nav />
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
        <p className="font-mono text-xs tracking-[0.2em] text-coral uppercase">
          + {eyebrow} +
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-paper/40">Last updated: {updated}</p>

        <div className="mt-12 flex flex-col gap-10 text-pretty text-[15px] leading-relaxed text-paper/70">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}
