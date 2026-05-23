import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { AppSection } from "@/components/ui";
import { WorkspaceProfileForm } from "@/components/settings/workspace-profile-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SettingsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  return (
    <AppSection
      title="Settings"
      description="Manage the account defaults that shape how the workspace behaves every day."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <WorkspaceProfileForm
          workspaceName={viewer.workspace.name}
          timezone={viewer.workspace.timezone}
          primaryAudience={viewer.workspace.primaryAudience || "General audience"}
          useCase={viewer.workspace.useCase || "Operational SMS"}
        />

        <section className="app-card-gradient rounded-[28px] p-6">
          <p className="mono-number text-xs uppercase app-label">Workspace appearance</p>
          <h2 className="mt-4 text-xl font-semibold text-[var(--app-text)]">Theme mode</h2>
          <p className="mt-2 text-sm leading-6 app-muted">
            Theme selection lives inside the authenticated workspace so public pages stay clean and consistent.
          </p>
          <div className="mt-6 flex items-center justify-between rounded-[22px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">Current display mode</p>
              <p className="mt-1 text-sm app-muted">Switch any time without affecting campaign data.</p>
            </div>
            <ThemeToggle />
          </div>
        </section>
      </div>
    </AppSection>
  );
}
