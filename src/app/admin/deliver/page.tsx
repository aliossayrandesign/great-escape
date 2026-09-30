"use client";

import { useState } from "react";
import { PRODUCT_LABEL, type ProductType } from "@/lib/products";
import { PillButton } from "@/components/ui/PillButton";

const PRODUCTS: ProductType[] = ["website", "app", "deck"];

const inputClass =
  "w-full bg-transparent text-base outline-none placeholder:text-paper/40";
const fieldClass =
  "flex items-center rounded-2xl border border-panel-stroke bg-dark-950 px-6 py-5 transition-colors focus-within:border-coral";

export default function DeliverPage() {
  const [password, setPassword] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [product, setProduct] = useState<ProductType>("website");
  const [projectLink, setProjectLink] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/send-delivery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          clientName,
          clientEmail,
          product,
          projectLink,
          note,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setClientName("");
      setClientEmail("");
      setProjectLink("");
      setNote("");
    } catch {
      setErrorMessage("Network error — please try again.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-dark-950 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-xs tracking-[0.15em] text-coral uppercase">
          + Internal +
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Send a delivery email
        </h1>
        <p className="mt-2 text-pretty text-sm text-paper/60">
          Sends the branded &quot;your project is ready&quot; email straight
          to the client.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
          <div className={fieldClass}>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <input
                required
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Client email"
                className={inputClass}
              />
            </div>
          </div>

          <div className={fieldClass}>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductType)}
              className={`${inputClass} cursor-pointer`}
            >
              {PRODUCTS.map((p) => (
                <option key={p} value={p} className="bg-dark-950">
                  {PRODUCT_LABEL[p]}
                </option>
              ))}
            </select>
          </div>

          <div className={fieldClass}>
            <input
              required
              type="url"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              placeholder="Link to the finished work"
              className={inputClass}
            />
          </div>

          <div className="rounded-[20px] border border-panel-stroke bg-dark-950">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note to include in the email"
              className="h-32 w-full resize-none rounded-[20px] bg-transparent p-6 text-base outline-none placeholder:text-paper/40"
            />
          </div>

          {status === "error" && (
            <p className="text-pretty text-sm text-coral">{errorMessage}</p>
          )}
          {status === "sent" && (
            <p className="text-pretty text-sm text-paper/70">
              Sent — the client should have it shortly.
            </p>
          )}

          <PillButton
            type="submit"
            size="xl"
            variant="paper"
            disabled={status === "sending"}
            className="h-14 whitespace-nowrap"
          >
            {status === "sending" ? "Sending…" : "Send delivery email →"}
          </PillButton>
        </form>
      </div>
    </main>
  );
}
