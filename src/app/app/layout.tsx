import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { getWorkspaceBalance } from "@/lib/wallet/repository";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getCurrentViewer();
  const walletBalance = viewer ? await getWorkspaceBalance(viewer.workspace.id) : 0;

  return (
    <AppShell
      title={viewer?.workspace.name ?? "Workspace"}
      subtitle={viewer ? `${viewer.workspace.primaryAudience} • ${viewer.workspace.useCase}` : "SMS workspace"}
      workspaceName={viewer?.workspace.name ?? "Cento"}
      walletBalance={walletBalance}
    >
      {children}
    </AppShell>
  );
}
