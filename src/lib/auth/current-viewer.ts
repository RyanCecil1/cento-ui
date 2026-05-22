import "server-only";

import { getSessionToken } from "@/lib/auth/app-session";
import { getDemoStore } from "@/lib/demo/store";

export async function getCurrentViewer() {
  const token = await getSessionToken();
  const store = getDemoStore();
  const session = token ? store.sessions.find((item) => item.token === token) : null;
  const user = session ? store.users.find((item) => item.id === session.userId) : store.users[0] ?? null;

  if (!user) {
    return null;
  }

  const workspace = store.workspaces.find((item) => item.ownerUserId === user.id) ?? null;
  if (!workspace) {
    return null;
  }

  return { user, workspace, token };
}

