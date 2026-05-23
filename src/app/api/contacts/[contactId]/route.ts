import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { deleteContact, updateContact } from "@/lib/contacts/repository";

const ContactUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneE164: z.string().min(8).optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
});

type Params = Promise<{ contactId: string }>;

export async function PATCH(request: Request, context: { params: Params }) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { contactId } = await context.params;
  const payload = ContactUpdateSchema.parse(await request.json());
  await updateContact(viewer.workspace.id, contactId, payload);

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(_: Request, context: { params: Params }) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { contactId } = await context.params;
  await deleteContact(viewer.workspace.id, contactId);

  return NextResponse.json({ success: true }, { status: 200 });
}
