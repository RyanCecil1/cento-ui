import { AppSection, Button } from "@/components/ui";
import { senderIdPreview } from "@/data/site";

export default function SenderIdsPage() {
  return (
    <AppSection
      title="Sender IDs"
      description="Sender IDs are modeled with simple approval states so the eventual admin workflow has a clear visual home."
      action={<Button variant="outlineDark">Request Sender ID</Button>}
    >
      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="divide-y divide-white/10">
          {senderIdPreview.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="mt-1 text-sm text-white/42">{item.note}</p>
              </div>
              <span
                className={`inline-flex w-fit rounded-md px-3 py-2 text-sm ${
                  item.status === "Approved"
                    ? "bg-success/15 text-[#8ce8af]"
                    : "bg-warning/15 text-[#f3c66f]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}
