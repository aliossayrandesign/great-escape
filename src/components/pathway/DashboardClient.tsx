"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCT_LABEL } from "@/lib/products";
import type { Project, ProjectStatus } from "@/lib/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  in_progress: "In Progress",
  in_review: "In Review",
  delivered: "Delivered",
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  in_progress: "bg-dark-700/60 text-paper/70",
  in_review: "bg-coral/15 text-coral",
  delivered: "bg-[#7ac47a]/15 text-[#7ac47a]",
};

const STATUS_FILTERS: { key: ProjectStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "delivered", label: "Delivered" },
];

type EnrichedProject = Project & { needsAttention: boolean };

export function DashboardClient({ projects }: { projects: EnrichedProject[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.clientName.toLowerCase().includes(q) ||
        p.clientEmail.toLowerCase().includes(q) ||
        PRODUCT_LABEL[p.product].toLowerCase().includes(q)
      );
    });
  }, [projects, search, statusFilter]);

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-[0.1em] uppercase transition-colors ${
                statusFilter === f.key
                  ? "border-coral text-coral"
                  : "border-panel-stroke text-paper/50 hover:border-dark-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client, email, or product…"
          className="w-full rounded-full border border-panel-stroke bg-dark-900/40 px-4 py-2 text-sm outline-none placeholder:text-paper/30 focus:border-coral sm:w-72"
        />
      </div>

      <p className="mt-4 text-xs text-paper/40">
        {filtered.length} of {projects.length} project{projects.length === 1 ? "" : "s"}
      </p>

      <div className="mt-3 overflow-hidden rounded-[20px] border border-panel-stroke">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-panel-stroke bg-dark-900/50 font-mono text-[11px] tracking-[0.1em] text-dark-400 uppercase">
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Started</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-paper/40">
                  {projects.length === 0 ? "No projects yet." : "No matches."}
                </td>
              </tr>
            )}
            {filtered.map((project) => (
              <tr
                key={project.id}
                className="border-b border-panel-stroke/60 last:border-0 hover:bg-dark-900/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {project.needsAttention && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral"
                        title="Client replied — needs a response"
                      />
                    )}
                    <Link
                      href={`/pathway/projects/${project.id}`}
                      className="font-medium hover:text-coral"
                    >
                      {project.clientName}
                    </Link>
                  </div>
                  <div className="text-xs text-paper/40">{project.clientEmail}</div>
                </td>
                <td className="px-5 py-4">
                  {PRODUCT_LABEL[project.product]}
                  {project.product === "package" && project.skuCount
                    ? ` · ${project.skuCount} SKU${project.skuCount === 1 ? "" : "s"}`
                    : ""}
                </td>
                <td className="px-5 py-4 font-mono">
                  ${project.price.toLocaleString()}
                  <div className="font-sans text-[11px] text-paper/40">
                    {project.balancePaidAt
                      ? "Paid in full"
                      : `$${project.balanceAmount.toLocaleString()} due on delivery`}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] uppercase ${STATUS_STYLE[project.status]}`}
                  >
                    {STATUS_LABEL[project.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-paper/60">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
