import { SenderIdRequestForm } from "@/components/sender-id-request-form";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { listSenderIds } from "@/lib/sender-ids/repository";
import { AppSection, Button } from "@/components/ui";

export default async function SenderIdsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const senderIds = await listSenderIds(viewer.workspace.id);

  return (
    <AppSection
      title="Sender IDs"
      description="Approved and requested sender IDs live here, alongside their current eligibility state."
      action={<Button variant="outlineDark">Shared sender available</Button>}
    >
      <SenderIdRequestForm />
      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="divide-y divide-white/10">
          {senderIds.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="mt-1 text-sm text-white/42">{item.note || "No note provided."}</p>
              </div>
              <span
                className={`inline-flex w-fit rounded-md px-3 py-2 text-sm ${
                  item.status === "approved"
                    ? "bg-success/15 text-[#8ce8af]"
                    : item.status === "rejected"
                      ? "bg-danger/15 text-[#ff9da6]"
                      : "bg-warning/15 text-[#f3c66f]"
                }`}
              >
                {item.status.replaceAll("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}
