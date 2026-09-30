import Image from "next/image";
import Link from "next/link";

// Logo-only nav for internal/utility pages (admin, client project tracking)
// that don't need the homepage's Process/Work/Pricing links or CTA.
export function SimpleNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center border-b border-panel-stroke/40 bg-dark-950/70 px-4 py-5 backdrop-blur-md sm:px-8 sm:py-6">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logo.svg"
          alt="great escape"
          width={204}
          height={39}
          className="h-[26px] w-auto sm:h-[30px]"
          priority
        />
      </Link>
    </nav>
  );
}
