import Link from "next/link";
import { Bell, Command, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { appNavGroups } from "@/data/site";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({
  title,
  subtitle,
  workspaceName,
  walletBalance,
  children,
}: {
  title: string;
  subtitle: string;
  workspaceName: string;
  walletBalance: number;
  children: React.ReactNode;
}) {
  return (
    <div className="app-root min-h-[100dvh]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[248px_1fr]">
        <aside className="hidden border-r border-[var(--app-border)] bg-[var(--app-sidebar)] p-5 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
              C
            </div>
            <div>
              <div className="display-title text-lg font-medium text-[var(--app-text)]">{workspaceName}</div>
              <div className="mono-number mt-1 text-[10px] uppercase text-[var(--app-muted-2)]">
                Workspace
              </div>
            </div>
          </Link>

          <div className="mt-8 space-y-7">
            {appNavGroups.map((group) => (
              <div key={group.title}>
                <p className="mono-number text-[11px] uppercase text-[var(--app-muted-2)]">
                  {group.title}
                </p>
                <div className="mt-3 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[var(--app-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
                    >
                      <item.icon size={17} weight="bold" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4">
            <p className="mono-number text-[11px] uppercase text-[var(--app-muted-2)]">Wallet</p>
            <p className="mono-number mt-3 text-2xl text-[var(--app-text)]">{walletBalance.toLocaleString()}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--app-muted)]">Credits ready for queued campaigns.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[var(--app-border)] bg-[var(--app-header)] px-4 py-4 lg:px-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mono-number text-xs uppercase text-primary">Cento command</p>
                <h1 className="display-title mt-2 text-3xl font-medium text-[var(--app-text)]">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">{subtitle}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-10 items-center gap-3 rounded-md border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-3 text-sm text-[var(--app-muted-2)]">
                  <MagnifyingGlass size={17} />
                  Search campaigns, contacts, reports
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle compact />
                  <button className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-panel-soft)] text-[var(--app-muted)]">
                    <Bell size={17} />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-panel-soft)] text-[var(--app-muted)]">
                    <Command size={17} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
