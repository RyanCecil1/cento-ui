import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { listCampaigns } from "@/lib/campaigns/repository";
import { getContactQualitySummary } from "@/lib/contacts/repository";
import { getWorkspaceBalance } from "@/lib/wallet/repository";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getCurrentViewer();
  const [walletBalance, campaigns, contactSummary] = viewer
    ? await Promise.all([
        getWorkspaceBalance(viewer.workspace.id),
        listCampaigns(viewer.workspace.id),
        getContactQualitySummary(viewer.workspace.id),
      ])
    : [0, [], { deliverable: 0, suppressed: 0, invalid: 0, duplicates: 0 }];

  const notifications = viewer
    ? [
        campaigns.filter((campaign) => campaign.state === "needs_attention").length > 0
          ? {
              id: "campaign-attention",
              title: "Campaigns need attention",
              detail: `${campaigns.filter((campaign) => campaign.state === "needs_attention").length} campaign(s) are blocked and need a fix before sending.`,
              href: "/app/campaigns",
            }
          : null,
        walletBalance < 500
          ? {
              id: "wallet-low",
              title: "Low credit balance",
              detail: "Top up the wallet before the next send window closes.",
              href: "/app/wallet",
            }
          : null,
        contactSummary.deliverable === 0
          ? {
              id: "contacts-missing",
              title: "No deliverable contacts yet",
              detail: "Upload or organize contacts before building the next campaign.",
              href: "/app/contacts#upload",
            }
          : null,
      ].filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];

  return (
    <AppShell
      title={viewer?.workspace.name ?? "Workspace"}
      subtitle={viewer ? `${viewer.workspace.primaryAudience} • ${viewer.workspace.useCase}` : "SMS workspace"}
      workspaceName={viewer?.workspace.name ?? "Cento"}
      walletBalance={walletBalance}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
