import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "/#process", label: "Process" },
  { href: "/#work", label: "Work" },
  { href: "/#pricing", label: "Pricing" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-panel-stroke px-4 py-12 sm:px-8">
      <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="great escape"
              width={204}
              height={39}
              className="h-[26px] w-auto"
            />
          </Link>
          <p className="max-w-xs text-pretty text-sm text-paper/50">
            An automated creative studio — one brief, one week, one fully
            designed escape.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs tracking-[0.15em] text-paper/60 uppercase hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:hello@greatescape.studio"
            className="font-mono text-xs tracking-[0.15em] text-paper/60 uppercase hover:text-paper"
          >
            hello@greatescape.studio
          </a>
        </div>
      </div>

      <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-paper/10 pt-6 sm:flex-row sm:items-center">
        <p className="font-mono text-xs text-paper/30">
          © {year} Great Escape. All rights reserved.
        </p>
        <p className="font-mono text-xs text-paper/30">
          + Escape the ordinary +
        </p>
      </div>
    </footer>
  );
}
