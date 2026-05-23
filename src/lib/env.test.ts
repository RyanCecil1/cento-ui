// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("requires the production integration keys the app cannot boot without", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        PAYMENT_PROVIDER_WEBHOOK_SECRET: "",
      }),
    ).toThrow("Missing required environment variable");
  });

  it("fails closed when the payment webhook secret is missing", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        SMS_PROVIDER: "demo",
      }),
    ).toThrow("Missing required environment variable: PAYMENT_PROVIDER_WEBHOOK_SECRET");
  });

  it("fails closed when the payment webhook secret is blank", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        SMS_PROVIDER: "demo",
        PAYMENT_PROVIDER_WEBHOOK_SECRET: "",
      }),
    ).toThrow("Missing required environment variable: PAYMENT_PROVIDER_WEBHOOK_SECRET");
  });

  it("rejects malformed integration URLs distinctly from missing values", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        PAYMENT_PROVIDER_WEBHOOK_SECRET: "webhook-secret",
      }),
    ).toThrow("Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });

  it("allows demo runtime without a DeepSeek key", () => {
    const parsed = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      SMS_PROVIDER: "demo",
      PAYMENT_PROVIDER_WEBHOOK_SECRET: "webhook-secret",
    });

    expect(parsed.SMS_PROVIDER).toBe("demo");
    expect("DEEPSEEK_API_KEY" in parsed).toBe(false);
  });

  it("treats a blank DeepSeek key from copied env example as not configured", () => {
    const parsed = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      DEEPSEEK_API_KEY: "",
      SMS_PROVIDER: "demo",
      PAYMENT_PROVIDER_WEBHOOK_SECRET: "webhook-secret",
    });

    expect(parsed.SMS_PROVIDER).toBe("demo");
    expect(parsed.DEEPSEEK_API_KEY).toBeUndefined();
  });
});

describe("lazy env loading", () => {
  it("does not validate process.env until runtime access", async () => {
    const originalEnv = { ...process.env };
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SMS_PROVIDER;
      delete process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET;

      vi.resetModules();

      const importModule = async () => import("./env");

      await expect(importModule()).resolves.toBeTypeOf("object");

      const envModule = await importModule();

      expect(() => envModule.getEnv()).toThrow(
        "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL",
      );
    } finally {
      process.env = originalEnv;
      vi.resetModules();
    }
  });

  it("caches validated runtime env access even if process.env changes later", async () => {
    const originalEnv = { ...process.env };

    try {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
      process.env.DEEPSEEK_API_KEY = "";
      process.env.SMS_PROVIDER = "demo";
      process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET = "webhook-secret";

      vi.resetModules();

      const envModule = await import("./env");
      const firstEnv = envModule.getEnv();

      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mutated.supabase.co";
      process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET = "mutated-webhook-secret";

      expect(envModule.getEnv()).toBe(firstEnv);
      expect(envModule.env.NEXT_PUBLIC_SUPABASE_URL).toBe(
        "https://example.supabase.co",
      );
      expect(envModule.env.DEEPSEEK_API_KEY).toBeUndefined();
      expect(envModule.env.PAYMENT_PROVIDER_WEBHOOK_SECRET).toBe(
        "webhook-secret",
      );
    } finally {
      process.env = originalEnv;
      vi.resetModules();
    }
  });

  it("fails runtime access when the payment webhook secret is blank in process.env", async () => {
    const originalEnv = { ...process.env };

    try {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
      process.env.DEEPSEEK_API_KEY = "";
      process.env.SMS_PROVIDER = "demo";
      process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET = "";

      vi.resetModules();

      const envModule = await import("./env");

      expect(() => envModule.getEnv()).toThrow(
        "Missing required environment variable: PAYMENT_PROVIDER_WEBHOOK_SECRET",
      );
    } finally {
      process.env = originalEnv;
      vi.resetModules();
    }
  });

  it("defers Hubtel credential validation until the provider is actually used", () => {
    const parsed = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      SMS_PROVIDER: "hubtel",
      PAYMENT_PROVIDER_WEBHOOK_SECRET: "webhook-secret",
    });

    expect(parsed.SMS_PROVIDER).toBe("hubtel");
  });
});
