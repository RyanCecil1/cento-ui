import Link from "next/link";
import { List, SignIn } from "@phosphor-icons/react/dist/ssr";
import { marketingNav } from "@/data/site";
import { Button } from "./ui";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/96 backdrop-blur-xl">
      <div className="page-shell flex h-22 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(18,26,43,0.4)]">
            C
          </div>
          <div>
            <p className="display-title text-[1.85rem] font-semibold leading-none text-[#203a59]">Cento</p>
            <p className="marketing-field-label mt-1 text-muted">SMS workspace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[1.02rem] font-medium text-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
    <footer className="border-t border-line bg-white">
      <div className="page-shell grid gap-8 py-16 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <div className="display-title text-[2rem] font-semibold text-[#203a59]">Cento</div>
          <p className="mt-4 max-w-sm text-base leading-8 text-muted">
            An SMS operations platform for teams that need sender approval, campaign execution,
            wallet control, and reporting without the usual telecom sprawl.
          </p>
        </div>

        <FooterColumn title="Product" items={["Features", "Pricing", "Industries", "FAQ"]} />
        <FooterColumn title="Workspace" items={["Campaigns", "Contacts", "Wallet", "Reports"]} />
        <FooterColumn title="Contact" items={["Book walkthrough", "support@cento.app", "Accra, Ghana", "Response within one business day"]} />
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[#203a59]">{title}</h3>
      <ul className="mt-5 space-y-4 text-base text-muted">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
