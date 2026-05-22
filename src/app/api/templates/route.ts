import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { createTemplate, listTemplates } from "@/lib/templates/repository";

const TemplateSchema = z.object({
  name: z.string().min(2),
  body: z.string().min(2),
  variables: z.array(z.string()).optional(),
  fallbackFirstName: z.string().optional(),
  fallbackLastName: z.string().optional(),
});

export async function GET() {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json(await listTemplates(viewer.workspace.id));
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const payload = TemplateSchema.parse(await request.json());
  return NextResponse.json(await createTemplate(viewer.workspace.id, payload), { status: 201 });
}

