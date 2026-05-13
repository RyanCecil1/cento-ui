"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "cento-theme";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`theme-toggle ${compact ? "h-10 w-10 justify-center px-0" : "h-11 px-3"}`}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">{isDark ? <Moon size={13} /> : <Sun size={13} />}</span>
      </span>
      {compact ? null : <span suppressHydrationWarning>{isDark ? "Dark" : "Light"}</span>}
    </button>
  );
}
