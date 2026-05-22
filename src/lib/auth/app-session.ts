import "server-only";

import { cookies } from "next/headers";

const SESSION_COOKIE = "cento_session";

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

