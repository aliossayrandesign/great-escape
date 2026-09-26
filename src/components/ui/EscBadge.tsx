export function EscBadge({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[10px] bg-paper font-mono text-dark-900"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      esc
    </div>
  );
}
