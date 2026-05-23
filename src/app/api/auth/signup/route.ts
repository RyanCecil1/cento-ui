import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionToken } from "@/lib/auth/app-session";
import {
  createServerSupabaseClient,
  createRequestSupabaseAuthClient,
} from "@/lib/supabase/server";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  workspaceName: z.string().min(2),
  fullName: z.string().min(2).default("Workspace Owner"),
  phoneNumber: z.string().min(7).default("+233000000000"),
  primaryAudience: z.string().min(2).default("General audience"),
  useCase: z.string().min(2).default("Announcements"),
});

export async function POST(request: Request) {
  const payload = SignupSchema.parse(await request.json());
  const email = payload.email.toLowerCase();
  const supabase = createServerSupabaseClient();
  const authClient = createRequestSupabaseAuthClient("");
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers.users.find((user) => user.email?.toLowerCase() === email);

  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
    email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.fullName,
      phone_number: payload.phoneNumber,
    },
  });

  if (createUserError || !createdUser.user) {
    return NextResponse.json(
      { error: createUserError?.message || "Unable to create account" },
      { status: 500 },
    );
  }

  const { error: workspaceError } = await supabase.from("workspaces").insert({
    owner_user_id: createdUser.user.id,
    name: payload.workspaceName,
    timezone: "Africa/Accra",
    verification_status: "pending",
    primary_audience: payload.primaryAudience,
    use_case: payload.useCase,
    sender_mode: "shared",
  });

  if (workspaceError) {
    const fallbackInsert = await supabase.from("workspaces").insert({
      owner_user_id: createdUser.user.id,
      name: payload.workspaceName,
      timezone: "Africa/Accra",
      verification_status: "pending",
    });

    if (fallbackInsert.error) {
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      return NextResponse.json({ error: "Unable to create workspace" }, { status: 500 });
    }

    await supabase.auth.admin.updateUserById(createdUser.user.id, {
      user_metadata: {
        full_name: payload.fullName,
        phone_number: payload.phoneNumber,
        workspace_profile: {
          primaryAudience: payload.primaryAudience,
          useCase: payload.useCase,
          senderMode: "shared",
        },
      },
    });
  }

  const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
    email,
    password: payload.password,
  });

  if (signInError || !signInData.session?.access_token) {
    return NextResponse.json({ error: "Account created but sign-in failed" }, { status: 500 });
  }

  await setSessionToken(signInData.session.access_token);

  return NextResponse.json({ next: "/app" }, { status: 201 });
}
