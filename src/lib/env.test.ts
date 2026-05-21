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
        SMS_PROVIDER_BASE_URL: "",
        SMS_PROVIDER_API_KEY: "",
        PAYMENT_PROVIDER_WEBHOOK_SECRET: "",
      }),
    ).toThrow("Missing required environment variable");
  });

  it("rejects malformed integration URLs distinctly from missing values", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        SMS_PROVIDER_BASE_URL: "https://sms.example.com",
        SMS_PROVIDER_API_KEY: "sms-api-key",
        PAYMENT_PROVIDER_WEBHOOK_SECRET: "webhook-secret",
      }),
    ).toThrow("Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});

describe("lazy env loading", () => {
  it("does not validate process.env until runtime access", async () => {
    const originalEnv = { ...process.env };
    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SMS_PROVIDER_BASE_URL;
      delete process.env.SMS_PROVIDER_API_KEY;
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
      process.env.SMS_PROVIDER_BASE_URL = "https://sms.example.com";
      process.env.SMS_PROVIDER_API_KEY = "sms-api-key";
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
      expect(envModule.env.PAYMENT_PROVIDER_WEBHOOK_SECRET).toBe(
        "webhook-secret",
      );
    } finally {
      process.env = originalEnv;
      vi.resetModules();
    }
  });
});
