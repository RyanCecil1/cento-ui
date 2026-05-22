import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { createContact, listWorkspaceContacts } from "@/lib/contacts/repository";

const ContactSchema = z.object({
  fullName: z.string().min(2),
  phoneE164: z.string().min(8),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
});

export async function GET() {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json(await listWorkspaceContacts(viewer.workspace.id));
}

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = ContactSchema.parse(await request.json());
  const contact = await createContact(viewer.workspace.id, payload);
  return NextResponse.json(contact, { status: 201 });
}

