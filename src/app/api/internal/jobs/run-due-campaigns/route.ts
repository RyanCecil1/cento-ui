import { NextResponse } from "next/server";

import { runDueCampaignJobs } from "@/lib/jobs/runner";

export async function POST() {
  const summary = await runDueCampaignJobs();
  return NextResponse.json(summary);
}

