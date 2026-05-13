import { AppShell } from "@/components/app-shell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell
      title="Workspace preview"
      subtitle="A UI-first command surface for campaigns, contacts, wallet balance, reporting, and message drafting."
    >
      {children}
    </AppShell>
  );
}
