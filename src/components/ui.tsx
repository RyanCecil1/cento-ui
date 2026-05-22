import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "light" | "outlineDark";
  className?: string;
  onClick?: () => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const buttonStyles = {
  primary: "bg-primary text-white hover:bg-primary-deep",
  secondary:
    "bg-transparent text-foreground border border-line hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-foreground hover:bg-primary-soft",
  dark:
    "border border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-text)] hover:bg-[var(--app-panel-soft)]",
  light: "bg-white text-foreground hover:bg-primary-soft",
  outlineDark:
    "bg-transparent text-[var(--app-text)] border border-[var(--app-border)] hover:border-primary/60 hover:bg-[var(--app-hover)]",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium ${buttonStyles[variant]} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mono-number text-xs uppercase text-primary">
        {eyebrow}
      </p>
      <h2 className="display-title mt-4 text-3xl leading-[1.08] font-medium text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export function SurfaceCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`surface-panel rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function AppSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 text-[var(--app-text)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="display-title text-3xl font-medium text-[var(--app-text)]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
