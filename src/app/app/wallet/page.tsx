import { AppSection, Button } from "@/components/ui";
import { pricingTiers, walletTransactions } from "@/data/site";

export default function WalletPage() {
  return (
    <AppSection
      title="Wallet"
      description="Wallet screens need to feel exact and calm because credit trust is one of the product’s highest-risk UX areas."
      action={<Button>Buy Credits</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="keep-white rounded-lg border border-primary/40 bg-[linear-gradient(180deg,#3d2170_0%,#17101f_100%)] p-6 text-white">
          <p className="mono-number text-xs uppercase text-white/52">Current balance</p>
          <p className="mono-number mt-5 text-5xl text-white">12,420</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/62">
            Credits available for immediate campaigns, scheduled sends, and review-ready drafts.
          </p>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#121018] p-5">
          <p className="mono-number text-xs uppercase text-white/36">Recommended bundles</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="rounded-md border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">{tier.name}</p>
                <p className="mono-number mt-3 text-2xl text-white">{tier.price}</p>
                <p className="mt-2 text-xs text-white/48">{tier.credits}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="border-b border-white/10 p-5">
          <p className="mono-number text-xs uppercase text-white/36">Transaction history</p>
        </div>
        <div className="divide-y divide-white/10">
          {walletTransactions.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="mt-1 text-xs text-white/42">{item.meta}</p>
              </div>
              <p className="mono-number text-sm text-white">{item.amount}</p>
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}
