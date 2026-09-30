import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deliverProject, getProject } from "@/lib/projects";
import { sendDeliveryEmail } from "@/lib/emails";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { projectLink?: string } | null;
  if (!body?.projectLink?.trim()) {
    return NextResponse.json({ error: "projectLink is required" }, { status: 400 });
  }

  await deliverProject(id, body.projectLink.trim());
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await sendDeliveryEmail(project).catch(() =>
    console.error("Failed to send delivery email")
  );

  return NextResponse.json({ ok: true });
}
