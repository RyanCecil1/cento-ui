"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type Bundle = {
  name: string;
  credits: number;
  amountGhs: number;
};

export function TopUpActions({ bundles }: { bundles: Bundle[] }) {
  const router = useRouter();
  const [loadingBundle, setLoadingBundle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTopUp(bundle: Bundle) {
    setLoadingBundle(bundle.name);
    setError(null);

    try {
      const topUpResponse = await fetch("/api/wallet/top-ups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          creditsPurchased: bundle.credits,
          amountGhs: bundle.amountGhs,
        }),
      });
      const topUpData = await topUpResponse.json().catch(() => ({}));

      if (!topUpResponse.ok) {
        setError(typeof topUpData.error === "string" ? topUpData.error : "Unable to create top-up order.");
        return;
      }

      await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: `${topUpData.topUpOrderId}-confirmed`,
          topUpOrderId: topUpData.topUpOrderId,
          creditsPurchased: bundle.credits,
          status: "confirmed",
        }),
      });

      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoadingBundle(null);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {bundles.map((bundle) => (
        <div key={bundle.name} className="rounded-md border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">{bundle.name}</p>
          <p className="mono-number mt-3 text-2xl text-white">GHS {bundle.amountGhs}</p>
          <p className="mt-2 text-xs text-white/48">{bundle.credits.toLocaleString()} credits</p>
          <Button
            className="mt-4 w-full"
            variant="dark"
            disabled={loadingBundle !== null}
            onClick={() => handleTopUp(bundle)}
          >
            {loadingBundle === bundle.name ? "Processing..." : "Top up now"}
          </Button>
        </div>
      ))}
      {error ? <p className="md:col-span-3 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
