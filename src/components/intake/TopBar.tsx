"use client";

export function TopBar({
  step,
  totalSteps,
  stepLabel,
  onBack,
}: {
  step: number;
  totalSteps: number;
  stepLabel: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-panel-stroke/40 bg-dark-950/40 px-4 py-4 sm:px-8 sm:py-5">
      <div className="w-20">
        {onBack && (
          <button
            onClick={onBack}
            className="whitespace-nowrap font-mono text-xs tracking-[0.15em] text-dark-400 uppercase hover:text-paper"
          >
            ‹ Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-14 rounded-full transition-colors duration-300 ${
              i < step ? "bg-coral" : "bg-dark-700"
            }`}
          />
        ))}
        <span className="ml-2 font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
          Step {step} of {totalSteps} — {stepLabel}
        </span>
      </div>

      <div className="w-20" />
    </div>
  );
}
