import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SMS_PROVIDER_BASE_URL: z.string().url(),
  SMS_PROVIDER_API_KEY: z.string().min(1),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().min(1),
});

type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function parseEnv(input: Record<string, string | undefined>) {
  const result = EnvSchema.safeParse(input);

  if (!result.success) {
    const issue = result.error.issues[0];
    const variableName = String(issue.path[0] ?? "unknown");
    const variableValue = input[variableName];

    if (variableValue === undefined || variableValue === "") {
      throw new Error(`Missing required environment variable: ${variableName}`);
    }

    throw new Error(
      `Invalid environment variable: ${variableName}`,
    );
  }

  return result.data;
}

export function getEnv() {
  cachedEnv ??= parseEnv(process.env);
  return cachedEnv;
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return getEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return getEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return getEnv().SUPABASE_SERVICE_ROLE_KEY;
  },
  get SMS_PROVIDER_BASE_URL() {
    return getEnv().SMS_PROVIDER_BASE_URL;
  },
  get SMS_PROVIDER_API_KEY() {
    return getEnv().SMS_PROVIDER_API_KEY;
  },
  get PAYMENT_PROVIDER_WEBHOOK_SECRET() {
    return getEnv().PAYMENT_PROVIDER_WEBHOOK_SECRET;
  },
};
