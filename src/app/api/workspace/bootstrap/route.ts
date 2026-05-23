import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionToken } from "@/lib/auth/app-session";
import { requireOwnerWorkspaceContext } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BootstrapSchema = z.object({
  workspaceName: z.string().min(2),
  timezone: z.string().min(2),
  senderMode: z.enum(["shared", "branded"]),
  primaryAudience: z.string().min(2),
  useCase: z.string().min(2),
});

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const context = await requireOwnerWorkspaceContext(token);
  const payload = BootstrapSchema.parse(await request.json());
  const supabase = createServerSupabaseClient();
  const baseUpdate = await supabase
    .from("workspaces")
    .update({
      name: payload.workspaceName,
      timezone: payload.timezone,
      verification_status: "verified",
    })
    .eq("id", context.workspaceId)
    .eq("owner_user_id", context.userId);

  if (baseUpdate.error) {
    return NextResponse.json({ error: "Unable to save workspace settings." }, { status: 500 });
  }

  const extendedUpdate = await supabase
    .from("workspaces")
    .update({
      sender_mode: payload.senderMode,
      primary_audience: payload.primaryAudience,
      use_case: payload.useCase,
    })
    .eq("id", context.workspaceId)
    .eq("owner_user_id", context.userId);

  if (extendedUpdate.error) {
    const {
      data: { user },
    } = await supabase.auth.admin.getUserById(context.userId);

    await supabase.auth.admin.updateUserById(context.userId, {
      user_metadata: {
        ...(user?.user_metadata ?? {}),
        workspace_profile: {
          primaryAudience: payload.primaryAudience,
          useCase: payload.useCase,
          senderMode: payload.senderMode,
        },
      },
    });
  }

  return NextResponse.json({ next: "/app" }, { status: 200 });
}
