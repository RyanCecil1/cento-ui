import { TopUpActions } from "@/components/wallet/top-up-actions";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { formatCredits } from "@/lib/format";
import { getWorkspaceBalance, listWalletEntries } from "@/lib/wallet/repository";
import { AppSection } from "@/components/ui";

const topUpBundles = [
  { name: "Starter", amountGhs: 80, credits: 1500 },
  { name: "Growth", amountGhs: 210, credits: 4200 },
  { name: "Broadcast", amountGhs: 420, credits: 8000 },
];

export default async function WalletPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const [walletBalance, walletEntries] = await Promise.all([
    getWorkspaceBalance(viewer.workspace.id),
    listWalletEntries(viewer.workspace.id),
  ]);

  return (
    <AppSection
      title="Wallet"
      description="Track wallet balance, top-up options, and every credit movement in one place."
    >
      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="keep-white rounded-lg border border-primary/40 bg-[linear-gradient(180deg,#3d2170_0%,#17101f_100%)] p-6 text-white">
          <p className="mono-number text-xs uppercase text-white/52">Current balance</p>
          <p className="mono-number mt-5 text-5xl text-white">{walletBalance.toLocaleString()}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/62">
            Credits available for immediate campaigns, scheduled sends, and review-ready drafts.
          </p>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#121018] p-5">
          <p className="mono-number text-xs uppercase text-white/36">Recommended bundles</p>
          <div className="mt-5">
            <TopUpActions bundles={topUpBundles} />
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="border-b border-white/10 p-5">
          <p className="mono-number text-xs uppercase text-white/36">Transaction history</p>
        </div>
        <div className="divide-y divide-white/10">
          {walletEntries.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-white">{item.reason}</p>
                <p className="mt-1 text-xs text-white/42">{item.meta}</p>
              </div>
              <p className="mono-number text-sm text-white">
                {item.direction === "credit" ? "+" : "-"}
                {formatCredits(item.units)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}
