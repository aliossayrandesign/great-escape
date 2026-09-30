"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCT_LABEL, type ProductType } from "@/lib/products";
import { PillButton } from "@/components/ui/PillButton";
import { CALENDLY_URL } from "@/lib/site-config";

type Revision = {
  id: string;
  author: "client" | "studio";
  message: string;
  videoUrl: string | null;
  createdAt: string;
};

type Project = {
  id: string;
  clientName: string;
  product: ProductType;
  status: "in_progress" | "in_review" | "delivered";
  projectLink: string | null;
  revisionsUsed: number;
};

const STEPS: { key: Project["status"]; label: string }[] = [
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "delivered", label: "Delivered" },
];

export default function ClientProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProject(data.project);
    setRevisions(data.revisions);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, no data-fetching library in this project
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    await fetch(`/api/projects/${id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, videoUrl: videoUrl || null }),
    });
    setMessage("");
    setVideoUrl("");
    setSending(false);
    setSent(true);
    load();
  };

  const Nav = () => (
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-950">
        <Nav />
        <p className="text-paper/40">Loading…</p>
      </main>
    );
  }

  if (notFound || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-950 px-6 text-center">
        <Nav />
        <p className="text-paper/60">
          We couldn&apos;t find that project. Double check the link, or reach
          out and we&apos;ll help.
        </p>
      </main>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === project.status);

  return (
    <main className="relative min-h-screen overflow-hidden bg-dark-950 pt-[81px] sm:pt-[105px]">
      <Nav />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(255,138,138,0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <p className="font-mono text-xs tracking-[0.15em] text-coral uppercase">
          + Project Status +
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {PRODUCT_LABEL[project.product]} for {project.clientName}
        </h1>

        <div className="mt-10 rounded-[24px] border border-panel-stroke bg-dark-900/40 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i <= currentStepIndex ? "bg-coral" : "bg-dark-700"
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] tracking-[0.1em] uppercase ${
                      i <= currentStepIndex ? "text-paper" : "text-paper/30"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 transition-colors ${
                      i < currentStepIndex ? "bg-coral" : "bg-dark-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {project.projectLink && (
            <div className="mt-8 rounded-[20px] border border-coral/30 bg-coral/5 p-6 text-center">
              <p className="text-pretty text-sm text-paper/70">
                Your {PRODUCT_LABEL[project.product].toLowerCase()} is ready to view.
              </p>
              <a
                href={project.projectLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block"
              >
                <PillButton size="lg" variant="paper">
                  View your {PRODUCT_LABEL[project.product].toLowerCase()} →
                </PillButton>
              </a>
            </div>
          )}
        </div>

        <div className="mt-16 sm:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Updates &amp; feedback · {project.revisionsUsed} of 3 revisions used
            </h2>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs tracking-[0.1em] text-coral uppercase hover:underline"
            >
              Book a call →
            </a>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {revisions.length === 0 && (
              <div className="rounded-[16px] border border-panel-stroke bg-dark-900/40 p-5 text-sm text-paper/40">
                Nothing yet — we&apos;ll post updates here as we go.
              </div>
            )}
            {revisions.map((r) => (
              <div
                key={r.id}
                className={`rounded-[16px] border p-4 text-sm ${
                  r.author === "studio"
                    ? "border-panel-stroke bg-dark-900/40"
                    : "border-coral/30 bg-coral/5"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase">
                  {r.author === "studio" ? "Great Escape" : "You"} ·{" "}
                  {new Date(r.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-pretty text-paper/90">{r.message}</p>
                {r.videoUrl && (
                  <a
                    href={r.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-coral hover:underline"
                  >
                    ▶ Watch video
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] border border-panel-stroke bg-dark-900/40 backdrop-blur-sm">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think, or what you'd like changed…"
              className="h-28 w-full resize-none rounded-t-[20px] bg-transparent p-5 text-sm outline-none placeholder:text-paper/40"
            />
            <div className="border-t border-panel-stroke p-3">
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Or paste a Loom (or any video) link — great for explaining something visual"
                className="w-full rounded-xl bg-transparent px-2 py-2 text-sm outline-none placeholder:text-paper/40"
              />
            </div>
          </div>
          {sent && (
            <p className="mt-2 text-sm text-paper/60">
              Sent — we&apos;ll get back to you soon.
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <PillButton
              size="md"
              variant="paper"
              onClick={handleSubmit}
              disabled={sending || !message.trim()}
            >
              {sending ? "Sending…" : "Send feedback →"}
            </PillButton>
          </div>
        </div>
      </div>
    </main>
  );
}
