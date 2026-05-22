import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { upsertSuppression } from "@/lib/contacts/repository";

const SuppressionSchema = z.object({
  contactId: z.string().optional(),
  phoneE164: z.string().min(8),
  reason: z.string().min(2),
});

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = SuppressionSchema.parse(await request.json());
  const suppression = await upsertSuppression(viewer.workspace.id, payload);
  return NextResponse.json(suppression, { status: 201 });
}

