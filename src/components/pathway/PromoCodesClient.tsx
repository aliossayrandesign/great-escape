"use client";

import { useState } from "react";
import type { PromoCode, DiscountType } from "@/lib/promo-codes";
import { PillButton } from "@/components/ui/PillButton";

export function PromoCodesClient({ initialCodes }: { initialCodes: PromoCode[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!code.trim() || !discountValue.trim()) return;
    setCreating(true);
    setError(null);
    const res = await fetch("/api/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discountType,
        discountValue: Number(discountValue),
        maxUses: maxUses.trim() ? Number(maxUses) : null,
        expiresAt: expiresAt || null,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create code");
      return;
    }
    setCodes((prev) => [data.promoCode, ...prev]);
    setCode("");
    setDiscountValue("");
    setMaxUses("1");
    setExpiresAt("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this promo code? This can't be undone.")) return;
    await fetch(`/api/promo-codes/${id}`, { method: "DELETE" });
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-10">
      <div className="rounded-[20px] border border-panel-stroke bg-dark-900/40 p-6">
        <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
          New code
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CODE"
            className="rounded-xl border border-panel-stroke bg-dark-950 px-3 py-2 text-sm uppercase outline-none focus:border-coral sm:col-span-2"
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="rounded-xl border border-panel-stroke bg-dark-950 px-3 py-2 text-sm outline-none focus:border-coral"
          >
            <option value="percent">% off</option>
            <option value="fixed">$ off</option>
          </select>
          <input
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            type="number"
            placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 250"}
            className="rounded-xl border border-panel-stroke bg-dark-950 px-3 py-2 text-sm outline-none focus:border-coral"
          />
          <input
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            type="number"
            placeholder="Max uses"
            className="rounded-xl border border-panel-stroke bg-dark-950 px-3 py-2 text-sm outline-none focus:border-coral"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="font-mono text-[10px] tracking-[0.1em] text-dark-400 uppercase">
            Expires (optional)
          </label>
          <input
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            type="date"
            className="rounded-xl border border-panel-stroke bg-dark-950 px-3 py-2 text-sm outline-none focus:border-coral"
          />
        </div>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <div className="mt-4 flex justify-end">
          <PillButton size="md" variant="paper" onClick={handleCreate} disabled={creating}>
            {creating ? "Creating…" : "Create code →"}
          </PillButton>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-panel-stroke">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-panel-stroke bg-dark-900/50 font-mono text-[11px] tracking-[0.1em] text-dark-400 uppercase">
              <th className="px-5 py-4">Code</th>
              <th className="px-5 py-4">Discount</th>
              <th className="px-5 py-4">Used</th>
              <th className="px-5 py-4">Expires</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-paper/40">
                  No promo codes yet.
                </td>
              </tr>
            )}
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-panel-stroke/60 last:border-0">
                <td className="px-5 py-4 font-mono">{c.code}</td>
                <td className="px-5 py-4">
                  {c.discountType === "percent"
                    ? `${c.discountValue}% off`
                    : `$${c.discountValue.toLocaleString()} off`}
                </td>
                <td className="px-5 py-4">
                  {c.usesCount}
                  {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="px-5 py-4 text-paper/60">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="font-mono text-[10px] tracking-[0.1em] text-paper/30 uppercase hover:text-coral"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
