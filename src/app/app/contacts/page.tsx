import { ContactWorkspace } from "@/components/contacts/contact-workspace";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import {
  getContactQualitySummary,
  listContactGroupsWithCounts,
  listWorkspaceContactsWithGroups,
} from "@/lib/contacts/repository";
import { AppSection, Button } from "@/components/ui";

export default async function ContactsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const [contacts, groups, summary] = await Promise.all([
    listWorkspaceContactsWithGroups(viewer.workspace.id),
    listContactGroupsWithCounts(viewer.workspace.id),
    getContactQualitySummary(viewer.workspace.id),
  ]);

  return (
    <AppSection
      title="Contacts"
      description="Create, upload, group, and maintain the contact records that power campaign delivery."
      action={
        <div className="flex flex-wrap gap-2">
          <Button href="/contact-upload-template.csv" variant="outlineDark">
            Download template
          </Button>
          <Button href="/app/contacts" variant="dark">
            Upload contacts
          </Button>
        </div>
      }
    >
      <ContactWorkspace contacts={contacts} groups={groups} summary={summary} />
    </AppSection>
  );
}
