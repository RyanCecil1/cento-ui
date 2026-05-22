import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { getCampaign, setCampaignState } from "@/lib/campaigns/repository";
import { queueCampaign } from "@/lib/jobs/runner";

type Params = Promise<{ campaignId: string }>;

export async function POST(_: Request, context: { params: Params }) {
  const viewer = await getCurrentViewer();
  if (!viewer) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { campaignId } = await context.params;
  const campaign = await getCampaign(viewer.workspace.id, campaignId);
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  await setCampaignState(viewer.workspace.id, campaignId, "queued");
  return NextResponse.json(await queueCampaign(viewer.workspace.id, campaignId, campaign.scheduleAt), { status: 200 });
}

