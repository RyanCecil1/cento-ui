import Link from "next/link";
import { List, SignIn } from "@phosphor-icons/react/dist/ssr";
import { marketingNav } from "@/data/site";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-white">
            C
          </div>
          <div>
            <p className="display-title text-lg font-medium leading-none">Cento</p>
            <p className="mono-number mt-1 text-[10px] uppercase text-muted">SMS workspace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button href="/login" variant="ghost">
            <SignIn size={16} />
            Login
          </Button>
          <Button href="/signup">Start Free Trial</Button>
        </div>

        <button
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-alt text-foreground md:hidden"
        >
          <List size={20} weight="bold" />
        </button>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <div className="display-title text-2xl font-medium">Cento</div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            A frontend-ready SMS workspace for campaign creation, credit visibility,
            sender ID review, and operational reporting.
          </p>
        </div>

        <FooterColumn title="Product" items={["Features", "Pricing", "Industries", "FAQ"]} />
        <FooterColumn title="Workspace" items={["Campaigns", "Contacts", "Wallet", "Reports"]} />
        <FooterColumn title="Contact" items={["Book demo", "support@cento.local", "Accra, Ghana", "Status preview"]} />
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
