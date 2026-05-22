import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { createManualAdjustment } from "@/lib/wallet/repository";

const AdjustmentSchema = z.object({
  direction: z.enum(["credit", "debit"]),
  units: z.number().int().positive(),
  reason: z.string().min(2),
});

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const payload = AdjustmentSchema.parse(await request.json());
  return NextResponse.json(await createManualAdjustment(viewer.workspace.id, payload), { status: 201 });
}

