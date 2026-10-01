import type { ProductType } from "./products";

export type ProjectStatus = "in_progress" | "in_review" | "delivered";

export type Project = {
  id: string;
  clientName: string;
  clientEmail: string;
  company: string | null;
  product: ProductType;
  price: number;
  stripePaymentIntentId: string;
  status: ProjectStatus;
  projectLink: string | null;
  brandFileName: string | null;
  brandFileUrl: string | null;
  currentProductLink: string | null;
  currentProductFileName: string | null;
  currentProductFileUrl: string | null;
  inspirationLinks: string[];
  notes: string | null;
  siteType: string | null;
  platform: string | null;
  skuCount: number | null;
  revisionsUsed: number;
  createdAt: string;
};

export type Revision = {
  id: string;
  projectId: string;
  author: "client" | "studio";
  message: string;
  videoUrl: string | null;
  createdAt: string;
};

type ProjectRow = {
  id: string;
  client_name: string;
  client_email: string;
  company: string | null;
  product: string;
  price: number;
  stripe_payment_intent_id: string;
  status: string;
  project_link: string | null;
  brand_file_name: string | null;
  brand_file_url: string | null;
  current_product_link: string | null;
  current_product_file_name: string | null;
  current_product_file_url: string | null;
  inspiration_links: string[];
  notes: string | null;
  site_type: string | null;
  platform: string | null;
  sku_count: number | null;
  revisions_used: number;
  created_at: string;
};

type RevisionRow = {
  id: string;
  project_id: string;
  author: string;
  message: string;
  video_url: string | null;
  created_at: string;
};

export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    company: row.company,
    product: row.product as ProductType,
    price: row.price,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    status: row.status as ProjectStatus,
    projectLink: row.project_link,
    brandFileName: row.brand_file_name,
    brandFileUrl: row.brand_file_url,
    currentProductLink: row.current_product_link,
    currentProductFileName: row.current_product_file_name,
    currentProductFileUrl: row.current_product_file_url,
    inspirationLinks: row.inspiration_links,
    notes: row.notes,
    siteType: row.site_type,
    platform: row.platform,
    skuCount: row.sku_count,
    revisionsUsed: row.revisions_used,
    createdAt: row.created_at,
  };
}

export function rowToRevision(row: RevisionRow): Revision {
  return {
    id: row.id,
    projectId: row.project_id,
    author: row.author as "client" | "studio",
    message: row.message,
    videoUrl: row.video_url,
    createdAt: row.created_at,
  };
}
