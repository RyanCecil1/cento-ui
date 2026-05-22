import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { createContactGroup, listContactGroups } from "@/lib/contacts/repository";

const GroupSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export async function GET() {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json(await listContactGroups(viewer.workspace.id));
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = GroupSchema.parse(await request.json());
  const group = await createContactGroup(viewer.workspace.id, payload);
  return NextResponse.json(group, { status: 201 });
}

