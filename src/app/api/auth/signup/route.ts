import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionToken } from "@/lib/auth/app-session";
import { createDemoId, getDemoStore } from "@/lib/demo/store";

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
  const store = getDemoStore();
  const existing = store.users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());

  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const userId = createDemoId("user");
  const workspaceId = createDemoId("workspace");
  const token = createDemoId("session");

  store.users.unshift({
    id: userId,
    email: payload.email.toLowerCase(),
    password: payload.password,
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
  });
  store.workspaces.unshift({
    id: workspaceId,
    ownerUserId: userId,
    name: payload.workspaceName,
    timezone: "Africa/Accra",
    verificationStatus: "pending",
    primaryAudience: payload.primaryAudience,
    useCase: payload.useCase,
    senderMode: "shared",
  });
  store.sessions.unshift({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });

  await setSessionToken(token);

  return NextResponse.json({ next: "/onboarding" }, { status: 201 });
}

