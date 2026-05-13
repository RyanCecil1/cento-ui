import { CampaignBuilder } from "@/components/campaign-builder";
import { AppSection } from "@/components/ui";

export default function NewCampaignPage() {
  return (
    <AppSection
      title="Create campaign"
      description="This guided builder is mock-only in this phase, but the step order, supporting context, and AI assist patterns are all ready for future logic."
    >
      <CampaignBuilder />
    </AppSection>
  );
}
