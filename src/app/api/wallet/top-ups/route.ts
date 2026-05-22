import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { createTopUpOrder } from "@/lib/wallet/repository";

const TopUpSchema = z.object({
  creditsPurchased: z.number().int().positive(),
  amountGhs: z.number().positive(),
});

export async function POST(request: Request) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const payload = TopUpSchema.parse(await request.json());
  const order = await createTopUpOrder(viewer.workspace.id, payload);
  return NextResponse.json({
    status: "pending",
    checkoutReference: order.id,
    topUpOrderId: order.id,
  });
}

