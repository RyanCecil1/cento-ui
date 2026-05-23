"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { pricingTiers } from "@/data/site";
import { Button } from "./ui";

export function PricingCardsClient() {
  const initial = pricingTiers.find((tier) => tier.featured)?.name ?? pricingTiers[0]?.name;
  const [selected, setSelected] = useState(initial);
  const selectedTier = useMemo(
    () => pricingTiers.find((tier) => tier.name === selected) ?? pricingTiers[0],
    [selected],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4 lg:grid-cols-3">
        {pricingTiers.map((tier) => {
          const active = tier.name === selected;

          return (
            <button
              key={tier.name}
              type="button"
              onClick={() => setSelected(tier.name)}
              className={`ark-price-card ark-animate-card relative flex h-full flex-col overflow-hidden rounded-[28px] p-5 text-left ${
                active
                  ? "border-primary bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_100%)] shadow-[0_28px_62px_-38px_rgba(139,71,255,0.42)]"
                  : "bg-white hover:border-primary/30"
              }`}
              aria-pressed={active}
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${active ? "bg-[linear-gradient(90deg,#8b47ff_0%,#b77cff_100%)]" : "bg-[linear-gradient(90deg,#e9eef5_0%,#f4f7fb_100%)]"}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                  <p className="mono-number mt-4 text-[2rem] text-foreground">{tier.price}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    active
                      ? "bg-primary text-white"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {active ? "Selected" : tier.featured ? "Popular" : "Available"}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-primary">{tier.credits}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{tier.description}</p>
              <ul className="mt-5 space-y-3 border-t border-line pt-4">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex gap-3 text-sm text-foreground">
                    <CheckCircle size={17} weight="fill" className="mt-0.5 text-success" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-xs uppercase tracking-[0.18em] text-muted">
                {active ? "Ready to continue" : "Click to choose this bundle"}
              </div>
            </button>
          );
        })}
      </div>

      <aside className="ark-price-card ark-price-aside ark-animate-card rounded-[28px] p-6">
        <p className="mono-number text-xs uppercase text-primary">Selected plan</p>
        <h2 className="display-title mt-4 text-[2.4rem] font-semibold text-foreground">
          {selectedTier?.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          This selection becomes the next step. Starter and Growth continue directly into account creation. Scale routes into a guided sales path.
        </p>
        <div className="mt-6 rounded-[22px] bg-[linear-gradient(180deg,#f7f0ff_0%,#ffffff_100%)] p-5">
          <p className="mono-number text-[11px] uppercase text-primary">Bundle details</p>
          <p className="mono-number mt-3 text-3xl text-foreground">{selectedTier?.price}</p>
          <p className="mt-2 text-sm font-semibold text-primary">{selectedTier?.credits}</p>
        </div>
        <div className="mt-7 flex flex-col gap-3">
          <Button
            href={selectedTier?.name === "Scale" ? "/contact" : "/signup"}
            className="w-full"
          >
            {selectedTier?.name === "Scale" ? "Talk to sales" : "Continue with selected plan"}
          </Button>
          <Button href="/signup" variant="secondary" className="w-full">
            Start a free trial instead
          </Button>
        </div>
      </aside>
    </div>
  );
}
