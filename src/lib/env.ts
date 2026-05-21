import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SMS_PROVIDER_BASE_URL: z.string().url(),
  SMS_PROVIDER_API_KEY: z.string().min(1),
});

export function parseEnv(input: Record<string, string | undefined>) {
  const result = EnvSchema.safeParse(input);

  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `Missing required environment variable: ${issue.path.join(".")}`,
    );
  }

  return result.data;
}

export const env = parseEnv(process.env);
