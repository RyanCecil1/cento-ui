import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { setCampaignState } from "@/lib/campaigns/repository";

type Params = Promise<{ campaignId: string }>;

export async function POST(_: Request, context: { params: Params }) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { campaignId } = await context.params;
  return NextResponse.json(await setCampaignState(viewer.workspace.id, campaignId, "canceled"), { status: 200 });
}

