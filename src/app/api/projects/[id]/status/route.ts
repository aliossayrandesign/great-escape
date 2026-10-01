import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getProject, updateProjectStatus } from "@/lib/projects";
import { sendReviewReadyEmail } from "@/lib/emails";
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

  const status = body.status as ProjectStatus;
  await updateProjectStatus(id, status);

  if (status === "in_review") {
    const project = await getProject(id);
    if (project) {
      sendReviewReadyEmail(project).catch((error) =>
        console.error("Failed to send review-ready email", error)
      );
    }
  }

  return NextResponse.json({ ok: true });
}
