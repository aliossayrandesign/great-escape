"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PillButton } from "@/components/ui/PillButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Incorrect password");
      setSubmitting(false);
      return;
    }

    router.push(searchParams.get("from") || "/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark-950 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="font-mono text-xs tracking-[0.15em] text-coral uppercase">
          + Internal +
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Studio login</h1>

        <div className="mt-8 flex items-center rounded-2xl border border-panel-stroke bg-dark-950 px-6 py-5 transition-colors focus-within:border-coral">
          <input
            required
            autoFocus
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent text-base outline-none placeholder:text-paper/40"
          />
        </div>

        {error && <p className="mt-3 text-sm text-coral">{error}</p>}

        <PillButton
          type="submit"
          size="xl"
          variant="paper"
          disabled={submitting}
          className="mt-6 h-14 w-full whitespace-nowrap"
        >
          {submitting ? "Checking…" : "Log in →"}
        </PillButton>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
