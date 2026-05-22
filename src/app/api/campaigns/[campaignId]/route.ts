import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { getCampaign } from "@/lib/campaigns/repository";

type Params = Promise<{ campaignId: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { campaignId } = await context.params;
  const campaign = await getCampaign(viewer.workspace.id, campaignId);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

