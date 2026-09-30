import { query } from "./db";
import { rowToProject, rowToRevision, type Project, type ProjectStatus, type Revision } from "./types";
import type { ProductType } from "./products";

type NewProjectInput = {
  clientName: string;
  clientEmail: string;
  company: string | null;
  product: ProductType;
  price: number;
  stripePaymentIntentId: string;
  brandFileName: string | null;
  brandFileUrl: string | null;
  currentProductLink: string | null;
  currentProductFileName: string | null;
  currentProductFileUrl: string | null;
  inspirationLinks: string[];
  notes: string | null;
  siteType: string | null;
  platform: string | null;
};

export async function createProject(input: NewProjectInput): Promise<Project> {
  const result = await query(
    `INSERT INTO projects (
      client_name, client_email, company, product, price,
      stripe_payment_intent_id, brand_file_name, brand_file_url,
      current_product_link, current_product_file_name, current_product_file_url,
      inspiration_links, notes, site_type, platform
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *`,
    [
      input.clientName,
      input.clientEmail,
      input.company,
      input.product,
      input.price,
      input.stripePaymentIntentId,
      input.brandFileName,
      input.brandFileUrl,
      input.currentProductLink,
      input.currentProductFileName,
      input.currentProductFileUrl,
      input.inspirationLinks,
      input.notes,
      input.siteType,
      input.platform,
    ]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToProject(result.rows[0] as any);
}

export async function getProject(id: string): Promise<Project | null> {
  const result = await query(`SELECT * FROM projects WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToProject(result.rows[0] as any);
}

export async function listProjects(): Promise<Project[]> {
  const result = await query(`SELECT * FROM projects ORDER BY created_at DESC`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.rows.map((row) => rowToProject(row as any));
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  await query(`UPDATE projects SET status = $2 WHERE id = $1`, [id, status]);
}

export async function deliverProject(id: string, projectLink: string) {
  await query(
    `UPDATE projects SET project_link = $2, status = 'delivered' WHERE id = $1`,
    [id, projectLink]
  );
}

export async function listRevisions(projectId: string): Promise<Revision[]> {
  const result = await query(
    `SELECT * FROM revisions WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.rows.map((row) => rowToRevision(row as any));
}

export async function addRevision({
  projectId,
  author,
  message,
  videoUrl,
}: {
  projectId: string;
  author: "client" | "studio";
  message: string;
  videoUrl: string | null;
}): Promise<Revision> {
  const result = await query(
    `INSERT INTO revisions (project_id, author, message, video_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [projectId, author, message, videoUrl]
  );
  if (author === "client") {
    await query(`UPDATE projects SET revisions_used = revisions_used + 1 WHERE id = $1`, [
      projectId,
    ]);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rowToRevision(result.rows[0] as any);
}
