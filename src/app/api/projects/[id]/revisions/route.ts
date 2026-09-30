import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { addRevision, getProject } from "@/lib/projects";
import { sendRevisionToStudioEmail, sendStudioUpdateToClientEmail } from "@/lib/emails";

type RevisionPayload = {
  message: string;
  videoUrl?: string | null;
};

// Same endpoint for both sides — which "author" gets recorded (and who
// gets emailed) is decided by whether the request carries a valid admin
// session, not by anything the client sends. A studio update notifies the
// client by email; client feedback notifies the studio.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as RevisionPayload | null;
  if (!body?.message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const isStudio = await isAdminRequest();
  const revision = await addRevision({
    projectId: id,
    author: isStudio ? "studio" : "client",
    message: body.message.trim(),
    videoUrl: body.videoUrl?.trim() || null,
  });

  if (isStudio) {
    await sendStudioUpdateToClientEmail(project, revision.message).catch(() =>
      console.error("Failed to notify client of studio update")
    );
  } else {
    await sendRevisionToStudioEmail(project, revision.message, revision.videoUrl).catch(() =>
      console.error("Failed to notify studio of client feedback")
    );
  }

  return NextResponse.json({ ok: true, revision });
}
