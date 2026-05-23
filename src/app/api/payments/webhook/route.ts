import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { applyWalletCredit } from "@/lib/wallet/repository";

const PaymentEventSchema = z.object({
  eventId: z.string().min(2),
  topUpOrderId: z.string().min(2),
  creditsPurchased: z.number().int().positive(),
  status: z.literal("confirmed"),
});

export async function POST(request: Request) {
  const payload = PaymentEventSchema.parse(await request.json());
  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("payment_events")
    .select("id")
    .eq("provider_name", "manual")
    .eq("provider_event_id", payload.eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ processed: true, duplicate: true }, { status: 200 });
  }

  const { data: order, error: orderError } = await supabase
    .from("payment_events")
    .select("id, workspace_id, payment_reference, metadata")
    .eq("id", payload.topUpOrderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Top-up order not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("payment_events")
    .update({
      provider_name: "manual",
      provider_event_id: payload.eventId,
      status: "confirmed",
      processed_at: new Date().toISOString(),
      metadata: {
        ...(typeof order.metadata === "object" && order.metadata ? order.metadata : {}),
        creditsPurchased: payload.creditsPurchased,
      },
    })
    .eq("id", payload.topUpOrderId);

  if (updateError) {
    return NextResponse.json({ error: "Unable to confirm top-up order" }, { status: 500 });
  }

  await applyWalletCredit(order.workspace_id as string, {
    units: payload.creditsPurchased,
    reason: "Confirmed top-up",
    meta: `Order ${order.payment_reference}`,
    paymentEventId: order.id as string,
  });

  return NextResponse.json({ processed: true }, { status: 200 });
}
