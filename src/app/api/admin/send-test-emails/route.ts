import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  sendClientConfirmationEmail,
  sendInternalNotificationEmail,
  sendReviewReadyEmail,
  sendDeliveryEmail,
  sendRevisionToStudioEmail,
  sendStudioUpdateToClientEmail,
} from "@/lib/emails";
import type { Project } from "@/lib/types";

// Temporary, admin-gated route used once to verify all six email templates
// actually send. Not linked from any UI. Remove after use.
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { project?: Project } | null;
  const project = body?.project;
  if (!project) {
    return NextResponse.json({ error: "project required" }, { status: 400 });
  }

  const attempts: [string, () => Promise<unknown>][] = [
    ["clientConfirmation", () => sendClientConfirmationEmail(project)],
    ["internalNotification", () => sendInternalNotificationEmail(project)],
    ["reviewReady", () => sendReviewReadyEmail(project)],
    ["delivery", () => sendDeliveryEmail(project)],
    ["revisionToStudio", () => sendRevisionToStudioEmail(project, "This is a test revision message.", null)],
    ["studioUpdateToClient", () => sendStudioUpdateToClientEmail(project, "This is a test studio reply.")],
  ];

  const results: Record<string, string> = {};
  for (const [name, fn] of attempts) {
    try {
      await fn();
      results[name] = "sent";
    } catch (err) {
      results[name] = `error: ${(err as Error).message}`;
    }
  }

  return NextResponse.json({ results });
}
