import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { importContactsBatch } from "@/lib/contacts/repository";

const ContactImportSchema = z.object({
  contacts: z
    .array(
      z.object({
        fullName: z.string().trim().min(2),
        phoneE164: z.string().trim().min(8),
        source: z.string().trim().optional(),
        tags: z.array(z.string().trim()).optional(),
        groupNames: z.array(z.string().trim()).optional(),
      }),
    )
    .min(1),
  groupIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = ContactImportSchema.parse(await request.json());
  const result = await importContactsBatch(viewer.workspace.id, payload);

  return NextResponse.json(result, { status: 201 });
}
