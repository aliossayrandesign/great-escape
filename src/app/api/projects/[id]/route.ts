import { NextResponse } from "next/server";
import { getProject, listRevisions } from "@/lib/projects";

// Intentionally not admin-gated — the project id itself is the magic-link
// credential the client was emailed. Anyone with the (unguessable) id can
// view it, same as an e-commerce order-tracking link.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const revisions = await listRevisions(id);
  return NextResponse.json({ project, revisions });
}
