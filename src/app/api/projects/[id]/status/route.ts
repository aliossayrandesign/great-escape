import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { updateProjectStatus } from "@/lib/projects";
import type { ProjectStatus } from "@/lib/types";

const VALID_STATUSES: ProjectStatus[] = ["in_progress", "in_review", "delivered"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  if (!body?.status || !VALID_STATUSES.includes(body.status as ProjectStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateProjectStatus(id, body.status as ProjectStatus);
  return NextResponse.json({ ok: true });
}
