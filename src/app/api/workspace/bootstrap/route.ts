import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";

const BootstrapSchema = z.object({
  workspaceName: z.string().min(2),
  timezone: z.string().min(2),
  senderMode: z.enum(["shared", "branded"]),
  primaryAudience: z.string().min(2),
  useCase: z.string().min(2),
});

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = BootstrapSchema.parse(await request.json());
  viewer.workspace.name = payload.workspaceName;
  viewer.workspace.timezone = payload.timezone;
  viewer.workspace.senderMode = payload.senderMode;
  viewer.workspace.primaryAudience = payload.primaryAudience;
  viewer.workspace.useCase = payload.useCase;
  viewer.workspace.verificationStatus = "verified";

  return NextResponse.json({ next: "/app" }, { status: 200 });
}

