import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listProjects } from "@/lib/projects";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projects = await listProjects();
  return NextResponse.json({ projects });
}
