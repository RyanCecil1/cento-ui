import { describe, expect, it } from "vitest";
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
      }),
    ).toThrow("Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
