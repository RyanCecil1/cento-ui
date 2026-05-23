import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionToken } from "@/lib/auth/app-session";
import { createRequestSupabaseAuthClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = LoginSchema.parse(await request.json());
  const authClient = createRequestSupabaseAuthClient("");
  const { data, error } = await authClient.auth.signInWithPassword({
    email: payload.email.toLowerCase(),
    password: payload.password,
  });

  if (error || !data.session?.access_token) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await setSessionToken(data.session.access_token);

  return NextResponse.json({ next: "/app" }, { status: 200 });
}
