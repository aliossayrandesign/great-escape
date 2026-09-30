import Link from "next/link";
import { listProjects } from "@/lib/projects";
import { PRODUCT_LABEL } from "@/lib/products";

// Must reflect live database state on every visit — without this, Next
// would statically generate this page once at build time and bake in
// whatever projects existed then.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In Progress",
  in_review: "In Review",
  delivered: "Delivered",
};

const STATUS_COLOR: Record<string, string> = {
  in_progress: "#8a8a8a",
  in_review: "#ff8a8a",
  delivered: "#7ac47a",
};

export default async function AdminDashboardPage() {
  const projects = await listProjects();
  const total = projects.reduce((sum, p) => sum + p.price, 0);

  return (
    <main className="min-h-screen bg-dark-950 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs tracking-[0.15em] text-coral uppercase">
          + Internal +
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="mt-2 text-pretty text-sm text-paper/60">
          {projects.length} project{projects.length === 1 ? "" : "s"} ·{" "}
          <span className="text-paper">${total.toLocaleString()}</span> total
        </p>

        <div className="mt-10 overflow-hidden rounded-[20px] border border-panel-stroke">
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
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-paper/40">
                    No projects yet.
                  </td>
                </tr>
              )}
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-panel-stroke/60 last:border-0 hover:bg-dark-900/40"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-medium hover:text-coral"
                    >
                      {project.clientName}
                    </Link>
                    <div className="text-xs text-paper/40">{project.clientEmail}</div>
                  </td>
                  <td className="px-5 py-4">{PRODUCT_LABEL[project.product]}</td>
                  <td className="px-5 py-4 font-mono">
                    ${project.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="font-mono text-xs tracking-[0.1em] uppercase"
                      style={{ color: STATUS_COLOR[project.status] }}
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
    </main>
  );
}
