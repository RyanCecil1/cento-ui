import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { createSenderIdRequest, listSenderIds } from "@/lib/sender-ids/repository";

const SenderSchema = z.object({
  name: z.string().min(2),
  note: z.string().min(2),
});

export async function GET() {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json(await listSenderIds(viewer.workspace.id));
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const payload = SenderSchema.parse(await request.json());
  return NextResponse.json(await createSenderIdRequest(viewer.workspace.id, payload), { status: 201 });
}

