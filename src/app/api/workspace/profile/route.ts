import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionToken } from "@/lib/auth/app-session";
import { requireOwnerWorkspaceContext } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const WorkspaceProfileSchema = z.object({
  workspaceName: z.string().trim().min(2),
  timezone: z.string().trim().min(2),
  primaryAudience: z.string().trim().min(2),
  useCase: z.string().trim().min(2),
});

export async function PATCH(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const context = await requireOwnerWorkspaceContext(token);
  const payload = WorkspaceProfileSchema.parse(await request.json());
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: payload.workspaceName,
      timezone: payload.timezone,
      primary_audience: payload.primaryAudience,
      use_case: payload.useCase,
    })
    .eq("id", context.workspaceId)
    .eq("owner_user_id", context.userId);

  if (error) {
    return NextResponse.json(
      { error: "Unable to update workspace profile." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(context.userId);

  await supabase.auth.admin.updateUserById(context.userId, {
    user_metadata: {
      ...(user?.user_metadata ?? {}),
      workspace_profile: {
        ...(user?.user_metadata?.workspace_profile ?? {}),
        primaryAudience: payload.primaryAudience,
        useCase: payload.useCase,
      },
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
