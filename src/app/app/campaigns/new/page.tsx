import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { listSenderIds } from "@/lib/sender-ids/repository";
import { listTemplates } from "@/lib/templates/repository";
import { getWorkspaceBalance } from "@/lib/wallet/repository";
import {
  listContactGroupsWithCounts,
  listWorkspaceContactsWithGroups,
} from "@/lib/contacts/repository";
import { CampaignBuilder } from "@/components/campaign-builder";
import { AppSection } from "@/components/ui";

export default async function NewCampaignPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const [senders, templates, walletBalance, groups, contacts] = await Promise.all([
    listSenderIds(viewer.workspace.id),
    listTemplates(viewer.workspace.id),
    getWorkspaceBalance(viewer.workspace.id),
    listContactGroupsWithCounts(viewer.workspace.id),
    listWorkspaceContactsWithGroups(viewer.workspace.id),
  ]);

  return (
    <AppSection
      title="Create campaign"
      description="Build a real campaign draft, validate each step, and queue it for immediate or scheduled execution."
    >
      <CampaignBuilder
        contacts={contacts}
        groups={groups}
        senders={senders}
        templates={templates}
        walletBalance={walletBalance}
        timezone={viewer.workspace.timezone}
      />
    </AppSection>
  );
}
