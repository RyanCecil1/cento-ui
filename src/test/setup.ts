import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_SUPABASE_URL ??= "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key";
process.env.SMS_PROVIDER_BASE_URL ??= "https://sms.example.com";
process.env.SMS_PROVIDER_API_KEY ??= "test-sms-api-key";
