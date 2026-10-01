import Link from "next/link";
import { listProjects, getLatestRevisionAuthors } from "@/lib/projects";
import { SimpleNav } from "@/components/SimpleNav";
import { DashboardClient } from "@/components/pathway/DashboardClient";

// Must reflect live database state on every visit — without this, Next
// would statically generate this page once at build time and bake in
// whatever projects existed then.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [projects, latestAuthors] = await Promise.all([
    listProjects(),
    getLatestRevisionAuthors(),
  ]);

  const enriched = projects.map((project) => ({
    ...project,
    // A project needs attention when the client spoke last and the studio
    // hasn't replied — not just "has feedback," which would stay flagged
    // forever even after a reply.
    needsAttention: latestAuthors.get(project.id) === "client",
  }));

  const now = new Date();
  const thisMonthTotal = projects
    .filter((p) => {
      const d = new Date(p.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, p) => sum + p.price, 0);
  const allTimeTotal = projects.reduce((sum, p) => sum + p.price, 0);
  const outstandingBalance = projects
    .filter((p) => !p.balancePaidAt)
    .reduce((sum, p) => sum + p.balanceAmount, 0);

  return (
    <main className="min-h-screen bg-dark-950 px-6 pt-[81px] pb-16 sm:px-10 sm:pt-[105px]">
      <SimpleNav />
      <div className="mx-auto max-w-5xl py-10">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-[0.15em] text-coral uppercase">
            + Internal +
          </p>
          <Link
            href="/pathway/promo-codes"
            className="font-mono text-xs tracking-[0.1em] text-paper/40 uppercase hover:text-paper"
          >
            Promo codes →
          </Link>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Projects
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-[16px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              This month
            </p>
            <p className="mt-2 text-2xl font-semibold">
              ${thisMonthTotal.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[16px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              All time
            </p>
            <p className="mt-2 text-2xl font-semibold">
              ${allTimeTotal.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[16px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              Outstanding
            </p>
            <p className="mt-2 text-2xl font-semibold">
              ${outstandingBalance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[16px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              Projects
            </p>
            <p className="mt-2 text-2xl font-semibold">{projects.length}</p>
          </div>
          <div className="rounded-[16px] border border-panel-stroke bg-dark-900/40 p-5">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dark-400 uppercase">
              Needs reply
            </p>
            <p className="mt-2 text-2xl font-semibold text-coral">
              {enriched.filter((p) => p.needsAttention).length}
            </p>
          </div>
        </div>

        <DashboardClient projects={enriched} />
      </div>
    </main>
  );
}
