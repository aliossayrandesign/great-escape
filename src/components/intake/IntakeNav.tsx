"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PillButton } from "../ui/PillButton";

export function IntakeNav({
  dirty,
  showCancel = true,
}: {
  dirty: boolean;
  showCancel?: boolean;
}) {
  const router = useRouter();

  const leave = () => {
    if (
      dirty &&
      !window.confirm("Leave and lose your progress? Nothing you've entered has been saved yet.")
    ) {
      return;
    }
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between border-b border-panel-stroke/40 bg-dark-950/70 px-4 py-5 backdrop-blur-md sm:px-8 sm:py-6">
      <button onClick={leave} className="flex items-center" aria-label="Go home">
        <Image
          src="/images/logo.svg"
          alt="great escape"
          width={204}
          height={39}
          className="h-[26px] w-auto sm:h-[30px]"
          priority
        />
      </button>

      {showCancel && (
        <PillButton
          type="button"
          variant="paper"
          onClick={leave}
          className="h-10 whitespace-nowrap px-7 text-xs sm:h-12"
        >
          Cancel
        </PillButton>
      )}
    </nav>
  );
}
