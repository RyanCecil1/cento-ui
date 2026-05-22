import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionToken } from "@/lib/auth/app-session";
import { createDemoId, getDemoStore } from "@/lib/demo/store";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = LoginSchema.parse(await request.json());
  const store = getDemoStore();
  const user = store.users.find(
    (item) => item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password,
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = createDemoId("session");
  store.sessions.unshift({
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
  });
  await setSessionToken(token);

  return NextResponse.json({ next: "/app" }, { status: 200 });
}

