import Link from "next/link";
import { appNavGroups } from "@/data/site";
import { AppHeaderControls } from "./app-header-controls";

const mobileNavItems = appNavGroups.flatMap((group) => group.items);

export function AppShell({
  title,
  subtitle,
  workspaceName,
  walletBalance,
  notifications,
  children,
}: {
  title: string;
  subtitle: string;
  workspaceName: string;
  walletBalance: number;
  notifications: Array<{
    id: string;
    title: string;
    detail: string;
    href?: string;
  }>;
  children: React.ReactNode;
}) {
  return (
    <div className="app-root min-h-[100dvh]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[248px_1fr]">
        <aside className="app-shell-pane hidden border-r border-[var(--app-border)] px-5 py-6 lg:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-primary text-sm font-semibold text-white shadow-[0_16px_26px_-18px_rgba(93,54,197,0.8)]">
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
                      className="flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-medium text-[var(--app-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
                    >
                      <item.icon size={17} weight="bold" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="app-shell-highlight mt-8 rounded-[24px] p-5">
            <p className="mono-number text-[11px] uppercase text-[var(--app-muted-2)]">Wallet</p>
            <p className="mono-number mt-4 text-[2rem] leading-none text-[var(--app-text)]">
              {walletBalance.toLocaleString()}
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--app-muted)]">Credits ready for queued campaigns.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="app-shell-glass border-b border-[var(--app-border)] px-4 py-4 backdrop-blur-xl lg:px-7">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mono-number text-xs uppercase text-primary">Cento command</p>
                <h1 className="display-title mt-2 text-3xl font-medium text-[var(--app-text)]">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">{subtitle}</p>
              </div>

              <AppHeaderControls
                workspaceName={workspaceName}
                notifications={notifications}
              />
            </div>

            <div className="mt-4 lg:hidden">
              <nav aria-label="Primary app navigation" className="flex gap-2 overflow-x-auto pb-1">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="app-shell-chip inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--app-text)]"
                  >
                    <item.icon size={16} weight="bold" />
                    {item.label}
                  </Link>
                ))}
                <div className="app-shell-highlight inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm text-[var(--app-muted)]">
                  {walletBalance.toLocaleString()} credits
                </div>
              </nav>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
