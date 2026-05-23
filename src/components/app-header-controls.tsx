"use client";

import { useMemo, useState } from "react";
import { Bell, MagnifyingGlass, UploadSimple, X } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { appNavGroups } from "@/data/site";
import { ThemeToggle } from "./theme-toggle";

type HeaderNotification = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

type AppHeaderControlsProps = {
  workspaceName: string;
  notifications: HeaderNotification[];
};

const searchableDestinations = [
  ...appNavGroups.flatMap((group) =>
    group.items.map((item) => ({ label: item.label, href: item.href })),
  ),
  { label: "Upload contacts", href: "/app/contacts#upload" },
  { label: "Create group", href: "/app/contacts#groups" },
];

export function AppHeaderControls({
  workspaceName,
  notifications,
}: AppHeaderControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const matchingDestinations = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return searchableDestinations.slice(0, 6);
    }

    return searchableDestinations.filter((item) =>
      item.label.toLowerCase().includes(trimmed),
    );
  }, [query]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = matchingDestinations[0];
    if (!target) {
      return;
    }

    setQuery("");
    router.push(target.href);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form className="relative min-w-0 sm:w-[320px]" onSubmit={handleSearchSubmit}>
        <div className="app-shell-chip flex h-11 items-center gap-3 rounded-full px-4 text-sm text-[var(--app-muted-2)]">
          <MagnifyingGlass size={17} />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
            list="app-shell-search-options"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${workspaceName}`}
            aria-label="Search dashboard pages"
          />
          {query ? (
            <button
              type="button"
              className="text-[var(--app-muted)]"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
        <datalist id="app-shell-search-options">
          {searchableDestinations.map((item) => (
            <option key={item.href} value={item.label} />
          ))}
        </datalist>
      </form>

      <div className="flex items-center gap-2">
        <a
          href="/app/contacts#upload"
          className="app-shell-chip inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--app-text)]"
        >
          <UploadSimple size={17} weight="bold" />
          Upload contacts
        </a>
        <ThemeToggle compact />
        <div className="relative">
          <button
            type="button"
            className="app-shell-chip relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--app-muted)]"
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((current) => !current)}
          >
            <Bell size={17} />
            {notifications.length > 0 ? (
              <span className="keep-white absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                {notifications.length}
              </span>
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <div className="app-card absolute right-0 top-14 z-30 w-[320px] rounded-[24px] p-4 shadow-[0_28px_60px_-36px_rgba(51,22,84,0.45)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="mono-number text-[11px] uppercase app-label">Notifications</p>
                  <p className="mt-1 text-sm app-muted">
                    {notifications.length > 0
                      ? "Active items that need a look."
                      : "No active alerts right now."}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[var(--app-muted)]"
                  onClick={() => setIsNotificationsOpen(false)}
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((item) => {
                    const content = (
                      <>
                        <p className="text-sm font-medium text-[var(--app-text)]">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 app-muted">{item.detail}</p>
                      </>
                    );

                    return item.href ? (
                      <a
                        key={item.id}
                        href={item.href}
                        className="block rounded-[20px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-3 hover:border-primary/40 hover:bg-[var(--app-hover)]"
                      >
                        {content}
                      </a>
                    ) : (
                      <div
                        key={item.id}
                        className="rounded-[20px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-3"
                      >
                        {content}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[20px] border border-dashed border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-4">
                    <p className="text-sm font-medium text-[var(--app-text)]">All clear</p>
                    <p className="mt-1 text-sm leading-6 app-muted">
                      Credits, contacts, sender IDs, and campaigns look stable.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {pathname === "/app" && notifications.length > 0 ? (
        <p className="sr-only">{notifications.length} active notifications.</p>
      ) : null}
    </div>
  );
}
