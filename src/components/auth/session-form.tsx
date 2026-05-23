"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type SessionFormProps =
  | {
      mode: "signup";
      initialValues?: Partial<SignupPayload>;
    }
  | {
      mode: "login";
      initialValues?: Partial<LoginPayload>;
    };

type SignupPayload = {
  workspaceName: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  primaryAudience: string;
  useCase: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const signupDefaults: SignupPayload = {
  workspaceName: "",
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  primaryAudience: "",
  useCase: "",
};

const loginDefaults: LoginPayload = {
  email: "",
  password: "",
};

export function SessionForm(props: SessionFormProps) {
  const router = useRouter();
  const [signupValues, setSignupValues] = useState<SignupPayload>({
    ...signupDefaults,
    ...(props.mode === "signup" ? props.initialValues : {}),
  });
  const [loginValues, setLoginValues] = useState<LoginPayload>({
    ...loginDefaults,
    ...(props.mode === "login" ? props.initialValues : {}),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = props.mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const payload = props.mode === "signup" ? signupValues : loginValues;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to continue.");
        return;
      }

      router.push(typeof data.next === "string" ? data.next : "/app");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {props.mode === "signup" ? (
        <>
          <Field label="Organization name">
            <input
              value={signupValues.workspaceName}
              onChange={(event) =>
                setSignupValues((current) => ({ ...current, workspaceName: event.target.value }))
              }
              placeholder="North Ridge School"
              required
            />
          </Field>
          <Field label="Work email">
            <input
              type="email"
              value={signupValues.email}
              onChange={(event) =>
                setSignupValues((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="ops@yourorg.com"
              required
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Owner name">
              <input
                value={signupValues.fullName}
                onChange={(event) =>
                  setSignupValues((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Ama Ofori"
                required
              />
            </Field>
            <Field label="Phone number">
              <input
                value={signupValues.phoneNumber}
                onChange={(event) =>
                  setSignupValues((current) => ({ ...current, phoneNumber: event.target.value }))
                }
                placeholder="+233241234567"
                required
              />
            </Field>
          </div>
          <Field label="Password">
            <input
              type="password"
              value={signupValues.password}
              onChange={(event) =>
                setSignupValues((current) => ({ ...current, password: event.target.value }))
              }
              minLength={12}
              required
            />
          </Field>
          <Field label="Primary audience">
            <input
              value={signupValues.primaryAudience}
              onChange={(event) =>
                setSignupValues((current) => ({ ...current, primaryAudience: event.target.value }))
              }
              placeholder="Parents and guardians"
              required
            />
          </Field>
          <Field label="Primary use case">
            <textarea
              value={signupValues.useCase}
              onChange={(event) =>
                setSignupValues((current) => ({ ...current, useCase: event.target.value }))
              }
              rows={3}
              placeholder="Weekly notices, fee reminders, and urgent schedule updates"
              required
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Email address">
            <input
              type="email"
              value={loginValues.email}
              onChange={(event) =>
                setLoginValues((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={loginValues.password}
              onChange={(event) =>
                setLoginValues((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </Field>
        </>
      )}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button className="mt-2 w-full" type="submit" disabled={submitting}>
        {submitting
          ? "Working..."
          : props.mode === "signup"
            ? "Create Workspace Account"
            : "Enter Workspace"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-foreground">
      <span className="marketing-field-label text-muted">{label}</span>
      {children}
    </label>
  );
}
