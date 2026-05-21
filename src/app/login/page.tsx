"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    localStorage.setItem(
      "cento.auth.session",
      JSON.stringify({
        email: email.trim(),
        createdAt: new Date().toISOString(),
      }),
    );

    router.push("/app");
  };

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
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <div className="rounded-lg border border-line bg-white p-4">
                  <label
                    htmlFor="email"
                    className="mono-number block text-xs uppercase text-muted"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (emailError) {
                        setEmailError(null);
                      }
                    }}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                    autoComplete="email"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                </div>
                {emailError ? (
                  <p id="email-error" className="mt-2 text-xs text-[var(--red-600)]">
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="rounded-lg border border-line bg-white p-4">
                  <label
                    htmlFor="password"
                    className="mono-number block text-xs uppercase text-muted"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) {
                        setPasswordError(null);
                      }
                    }}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                    autoComplete="current-password"
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                </div>
                {passwordError ? (
                  <p id="password-error" className="mt-2 text-xs text-[var(--red-600)]">
                    {passwordError}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Entering Workspace..." : "Enter Workspace"}
              </Button>

              <p className="text-sm text-muted">
                New here?{" "}
                <Link href="/signup" className="font-medium text-primary">
                  Start a free trial
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
