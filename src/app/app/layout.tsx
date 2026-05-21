"use client";

import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const TEMP_AUTH_KEY = "cento-temp-auth";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authMarker =
    typeof window === "undefined" ? null : window.localStorage.getItem(TEMP_AUTH_KEY);

  if (authMarker === null) {
    return (
      <div className="app-root min-h-[100dvh] bg-[var(--app-sidebar)] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-[var(--app-hover)]" />
          <div className="h-10 w-full rounded bg-[var(--app-hover)]" />
          <div className="h-36 w-full rounded bg-[var(--app-hover)]" />
        </div>
      </div>
    );
  }

  if (authMarker !== "true") {
    redirect("/login");
  }

  return (
    <AppShell
      title="Workspace preview"
      subtitle="A UI-first command surface for campaigns, contacts, wallet balance, reporting, and message drafting."
    >
      {children}
    </AppShell>
  );
}
