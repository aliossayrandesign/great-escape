"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCT_LABEL, type ProductType } from "@/lib/products";
import { PillButton } from "@/components/ui/PillButton";
import { SimpleNav } from "@/components/SimpleNav";
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
  clientEmail: string;
  company: string | null;
  product: ProductType;
  price: number;
  depositAmount: number;
  balanceAmount: number;
  balancePaidAt: string | null;
  status: "in_progress" | "in_review" | "delivered";
  projectLink: string | null;
  brandFileName: string | null;
  brandFileUrl: string | null;
  currentProductLink: string | null;
  currentProductFileName: string | null;
  currentProductFileUrl: string | null;
  dielineFileName: string | null;
  dielineFileUrl: string | null;
  inspirationLinks: string[];
  notes: string | null;
  siteType: string | null;
  platform: string | null;
  skuCount: number | null;
  revisionsUsed: number;
  promoCode: string | null;
  discountAmount: number;
  createdAt: string;
};

const STATUS_LABEL: Record<Project["status"], string> = {
  in_progress: "In Progress",
  in_review: "In Review",
  delivered: "Delivered",
};

export default function AdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [projectLink, setProjectLink] = useState("");
  const [delivering, setDelivering] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.project);
      setRevisions(data.revisions);
      setProjectLink(data.project.projectLink ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, no data-fetching library in this project
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status: Project["status"]) => {
    await fetch(`/api/projects/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const handlePostUpdate = async () => {
    if (!updateMessage.trim()) return;
    setPosting(true);
    await fetch(`/api/projects/${id}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: updateMessage }),
    });
    setUpdateMessage("");
    setPosting(false);
    load();
  };

  const handleDeliver = async () => {
    if (!projectLink.trim()) return;
    setDelivering(true);
    await fetch(`/api/projects/${id}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectLink }),
    });
    setDelivering(false);
    load();
  };

  const handleDelete = async () => {
    if (!project) return;
    const confirmed = window.confirm(
      `Permanently delete ${project.clientName}'s project? This can't be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/pathway");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-950">
        <SimpleNav />
        <p className="text-paper/40">Loading…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark-950">
        <SimpleNav />
        <p className="text-paper/40">Project not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-950 px-6 pt-[81px] pb-16 sm:px-10 sm:pt-[105px]">
      <SimpleNav />
      <div className="mx-auto max-w-3xl py-10">
        <div className="flex items-center justify-between">
          <Link href="/pathway" className="font-mono text-xs tracking-[0.1em] text-paper/40 uppercase hover:text-paper">
            ‹ All projects
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="font-mono text-xs tracking-[0.1em] text-paper/30 uppercase hover:text-coral"
          >
            {deleting ? "Deleting…" : "Delete project"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{project.clientName}</h1>
            <p className="mt-1 text-sm text-paper/60">
              {project.clientEmail}
              {project.company ? ` · ${project.company}` : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">
              {PRODUCT_LABEL[project.product]}
              {project.product === "package" && project.skuCount
                ? ` · ${project.skuCount} SKU${project.skuCount === 1 ? "" : "s"}`
                : ""}{" "}
              · ${project.price.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-paper/50">
              ${project.depositAmount.toLocaleString()} deposit paid
              {project.balanceAmount > 0 && (
                <>
                  {" · "}
                  {project.balancePaidAt ? (
                    <span className="text-[#7ac47a]">
                      ${project.balanceAmount.toLocaleString()} balance paid
                    </span>
                  ) : (
                    <span className="text-coral">
                      ${project.balanceAmount.toLocaleString()} balance due
                    </span>
                  )}
                </>
              )}
            </div>
            {project.promoCode && (
              <div className="mt-1 text-xs text-paper/40">
                Promo <span className="font-mono">{project.promoCode}</span> — −$
                {project.discountAmount.toLocaleString()}
              </div>
            )}
            <div className="mt-2 flex gap-2">
              {(["in_progress", "in_review", "delivered"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors ${
                    project.status === s
                      ? "border-coral text-coral"
                      : "border-dark-600 text-paper/40 hover:border-paper"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              Brand file
            </p>
            <p className="mt-2 text-sm">
              {project.brandFileUrl ? (
                <a href={project.brandFileUrl} className="text-coral hover:underline">
                  {project.brandFileName} →
                </a>
              ) : (
                <span className="text-paper/40">None provided</span>
              )}
            </p>
          </div>
          <div className="rounded-[20px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              Current product
            </p>
            <p className="mt-2 text-sm">
              {project.currentProductLink ? (
                <a href={project.currentProductLink} className="text-coral hover:underline">
                  {project.currentProductLink}
                </a>
              ) : project.currentProductFileUrl ? (
                <a href={project.currentProductFileUrl} className="text-coral hover:underline">
                  {project.currentProductFileName} →
                </a>
              ) : (
                <span className="text-paper/40">None provided</span>
              )}
            </p>
          </div>
          {project.dielineFileUrl && (
            <div className="rounded-[20px] border border-panel-stroke bg-dark-900/40 p-5">
              <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
                Dieline
              </p>
              <p className="mt-2 text-sm">
                <a href={project.dielineFileUrl} className="text-coral hover:underline">
                  {project.dielineFileName} →
                </a>
              </p>
            </div>
          )}
          {project.inspirationLinks.length > 0 && (
            <div className="rounded-[20px] border border-panel-stroke bg-dark-900/40 p-5">
              <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
                Inspiration links
              </p>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                {project.inspirationLinks.map((l) => (
                  <a key={l} href={l} className="text-coral hover:underline">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          )}
          {project.notes && (
            <div className="rounded-[20px] border border-panel-stroke bg-dark-900/40 p-5">
              <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
                Notes
              </p>
              <p className="mt-2 text-pretty text-sm text-paper/80">{project.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[20px] border border-panel-stroke bg-dark-900/40 p-5">
          <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
            Delivery link {project.status === "delivered" && "(delivered)"}
          </p>
          <div className="mt-3 flex gap-3">
            <input
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              placeholder="Link to the finished work"
              className="flex-1 rounded-xl border border-panel-stroke bg-dark-950 px-4 py-3 text-sm outline-none focus:border-coral"
            />
            <PillButton
              size="md"
              variant="paper"
              onClick={handleDeliver}
              disabled={delivering || !projectLink.trim()}
            >
              {delivering ? "Sending…" : "Deliver →"}
            </PillButton>
          </div>
          <p className="mt-2 text-xs text-paper/40">
            Sends the client the &quot;your project is ready&quot; email with this link.
          </p>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs tracking-[0.15em] text-dark-400 uppercase">
              Feedback thread · {project.revisionsUsed} of 3 revisions used
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

          <div className="mt-4 flex flex-col gap-3">
            {revisions.length === 0 && (
              <p className="text-sm text-paper/40">No messages yet.</p>
            )}
            {revisions.map((r) => (
              <div
                key={r.id}
                className={`rounded-[16px] border p-4 text-sm ${
                  r.author === "studio"
                    ? "border-coral/30 bg-coral/5"
                    : "border-panel-stroke bg-dark-900/40"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase">
                  {r.author === "studio" ? "You" : project.clientName} ·{" "}
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

          <div className="mt-4 rounded-[20px] border border-panel-stroke bg-dark-950">
            <textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="Post an update to the client…"
              className="h-24 w-full resize-none rounded-[20px] bg-transparent p-5 text-sm outline-none placeholder:text-paper/40"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <PillButton
              size="md"
              variant="paper"
              onClick={handlePostUpdate}
              disabled={posting || !updateMessage.trim()}
            >
              {posting ? "Sending…" : "Send update →"}
            </PillButton>
          </div>
        </div>
      </div>
    </main>
  );
}
