import { NextResponse } from "next/server";
import { z } from "zod";

import { getDemoStore } from "@/lib/demo/store";
import { applyWalletCredit } from "@/lib/wallet/repository";

const PaymentEventSchema = z.object({
  eventId: z.string().min(2),
  topUpOrderId: z.string().min(2),
  creditsPurchased: z.number().int().positive(),
  status: z.literal("confirmed"),
});

export async function POST(request: Request) {
  const payload = PaymentEventSchema.parse(await request.json());
  const store = getDemoStore();

  const existing = store.paymentEvents.find((event) => event.eventId === payload.eventId);
  if (existing) {
    return NextResponse.json({ processed: true, duplicate: true }, { status: 200 });
  }

  const order = store.topUpOrders.find((item) => item.id === payload.topUpOrderId);
  if (!order) {
    return NextResponse.json({ error: "Top-up order not found" }, { status: 404 });
  }

  order.status = "confirmed";
  store.paymentEvents.unshift({
    eventId: payload.eventId,
    topUpOrderId: payload.topUpOrderId,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  await applyWalletCredit(order.workspaceId, {
    units: payload.creditsPurchased,
    reason: "Confirmed top-up",
    meta: `Order ${order.id}`,
  });

  return NextResponse.json({ processed: true }, { status: 200 });
}

