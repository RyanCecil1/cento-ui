import { AppSection, Button } from "@/components/ui";
import { contactsPreview } from "@/data/site";

export default function ContactsPage() {
  return (
    <AppSection
      title="Contacts"
      description="The contact area is framed for imports, number cleaning, grouping, and list quality feedback before real parsing logic is introduced."
      action={<Button variant="outlineDark">Upload Contacts</Button>}
    >
      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
          {["All contacts", "Valid", "Needs format", "Duplicates"].map((filter) => (
            <button
              key={filter}
              className={`rounded-md px-3 py-2 text-sm ${
                filter === "All contacts"
                  ? "bg-primary text-white"
                  : "border border-white/10 text-white/58 hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="divide-y divide-white/10">
          {contactsPreview.map((contact) => (
            <div
              key={contact.name}
              className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_1fr_0.8fr_0.7fr]"
            >
              <p className="font-medium text-white">{contact.name}</p>
              <p className="text-white/50">{contact.phone}</p>
              <p className="text-white/50">{contact.group}</p>
              <p className="text-white/72">{contact.status}</p>
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}
