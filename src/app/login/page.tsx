import Link from "next/link";
import { MarketingHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";

export default function LoginPage() {
  return (
    <>
      <MarketingHeader />
      <main className="page-shell flex min-h-[calc(100dvh-64px)] flex-1 items-center py-10">
        <div className="mx-auto grid w-full max-w-[1080px] gap-6 rounded-lg border border-line bg-white p-6 shadow-[var(--shadow-quiet)] lg:grid-cols-[1fr_0.9fr] lg:p-8">
          <div className="rounded-lg bg-foreground p-8 text-white">
            <p className="mono-number text-xs uppercase text-white/50">
              Cento access
            </p>
            <h1 className="display-title mt-4 text-4xl font-medium leading-[1.08]">
              Return to your command surface.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/62">
              Monitor active campaigns, review wallet activity, and launch new sends from
              a single workspace once the live product layer is introduced.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-[var(--cream-50)] p-6">
            <div className="space-y-4">
              <MockInput label="Email address" value="operator@cento.local" />
              <MockInput label="Password" value="••••••••••••" />
              <Button href="/app" className="w-full">
                Enter Workspace
              </Button>
              <p className="text-sm text-muted">
                New here?{" "}
                <Link href="/signup" className="font-medium text-primary">
                  Start a free trial
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function MockInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <p className="mono-number text-xs uppercase text-muted">{label}</p>
      <p className="mt-3 text-sm text-foreground">{value}</p>
    </div>
  );
}
