"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type ParsedContact = {
  fullName: string;
  phoneE164: string;
  tags: string[];
  groupNames: string[];
};

type ContactUploadPanelProps = {
  groups: Array<{ id: string; name: string }>;
};

export function ContactUploadPanel({ groups }: ContactUploadPanelProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [source, setSource] = useState("upload");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const previewContacts = useMemo(() => contacts.slice(0, 5), [contacts]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setStatus(null);

    try {
      const content = await file.text();
      const parsed = parseContactTemplate(content);

      if (parsed.length === 0) {
        setError("The file did not contain any contacts.");
        return;
      }

      setContacts(parsed);
      setStatus(`${parsed.length} contact(s) ready to import.`);
    } catch (fileError) {
      setError(
        fileError instanceof Error ? fileError.message : "Unable to read that file.",
      );
    } finally {
      event.target.value = "";
    }
  }

  async function handleUpload() {
    if (contacts.length === 0) {
      setError("Choose a CSV file first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contacts: contacts.map((contact) => ({
            ...contact,
            source,
          })),
          groupIds: selectedGroupIds,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to import contacts.");
        return;
      }

      setStatus(
        `${data.importedCount ?? contacts.length} contact(s) imported.${data.groupsCreated ? ` ${data.groupsCreated} group(s) created from the file.` : ""}`,
      );
      setContacts([]);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((value) => value !== groupId)
        : [...current, groupId],
    );
  }

  return (
    <section id="upload" className="rounded-lg app-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-number text-xs uppercase app-label">Contact upload</p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--app-text)]">
            Import from a local file
          </h2>
          <p className="mt-2 text-sm leading-6 app-muted">
            Upload a CSV file, assign one or more groups, and bring the full list in at once.
          </p>
        </div>
        <a
          href="/contact-upload-template.csv"
          download
          className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 text-sm font-semibold text-[var(--app-text)]"
        >
          Download template
        </a>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">CSV file</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        </label>

        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Source label</span>
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="upload"
          />
        </label>

        <div>
          <p className="mono-number text-[10px] uppercase app-label">Assign all imported contacts to</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {groups.map((group) => {
              const selected = selectedGroupIds.includes(group.id);

              return (
                <button
                  key={group.id}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-sm ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-hover)]"
                  }`}
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-4">
          <p className="text-sm font-medium text-[var(--app-text)]">Template rules</p>
          <ul className="mt-2 space-y-1 text-sm leading-6 app-muted">
            <li>Use the headers from the template exactly as they appear.</li>
            <li>Keep phone numbers in international format, for example `+23324...`.</li>
            <li>Use `tags` and `group_name` only when you want to pre-organize contacts.</li>
            <li>Separate multiple tags or groups with `|`.</li>
          </ul>
        </div>

        {previewContacts.length > 0 ? (
          <div className="rounded-[20px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-4">
            <p className="text-sm font-medium text-[var(--app-text)]">Preview</p>
            <div className="mt-3 space-y-3">
              {previewContacts.map((contact) => (
                <div key={`${contact.phoneE164}-${contact.fullName}`} className="text-sm">
                  <p className="font-medium text-[var(--app-text)]">{contact.fullName}</p>
                  <p className="mt-1 app-muted">
                    {contact.phoneE164}
                    {contact.groupNames.length > 0 ? ` • ${contact.groupNames.join(", ")}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {status ? <p className="text-sm text-success">{status}</p> : null}

        <Button variant="dark" onClick={() => void handleUpload()} disabled={isUploading}>
          {isUploading ? "Importing..." : "Import contacts"}
        </Button>
      </div>
    </section>
  );
}

function parseContactTemplate(content: string) {
  const rows = splitCsvRows(content)
    .filter((row) => row.length > 0)
    .filter((row) => row[0]?.trim() && !row[0].trim().startsWith("#"));

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((value) => value.trim().toLowerCase());
  const fullNameIndex = headers.indexOf("full_name");
  const phoneIndex = headers.indexOf("phone_e164");
  const tagsIndex = headers.indexOf("tags");
  const groupIndex = headers.indexOf("group_name");

  if (fullNameIndex === -1 || phoneIndex === -1) {
    throw new Error("The file must include full_name and phone_e164 columns.");
  }

  return rows.slice(1).flatMap((row) => {
    const fullName = row[fullNameIndex]?.trim();
    const phoneE164 = row[phoneIndex]?.trim();

    if (!fullName || !phoneE164) {
      return [];
    }

    return [
      {
        fullName,
        phoneE164,
        tags: splitMultiValueCell(row[tagsIndex]),
        groupNames: splitMultiValueCell(row[groupIndex]),
      },
    ];
  });
}

function splitMultiValueCell(value: string | undefined) {
  return (value ?? "")
    .split("|")
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCsvRows(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  return lines.map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];

      if (character === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (character === "," && !inQuotes) {
        values.push(current);
        current = "";
        continue;
      }

      current += character;
    }

    values.push(current);
    return values;
  });
}
