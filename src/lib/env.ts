import "server-only";
import { z } from "zod";

const OptionalServerSecretSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim() === "" ? undefined : value;
}, z.string().min(1).optional());

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DEEPSEEK_API_KEY: OptionalServerSecretSchema,
  SMS_PROVIDER: z.enum(["demo", "hubtel"]).default("demo"),
  PAYMENT_PROVIDER_WEBHOOK_SECRET: z.string().min(1),
  HUBTEL_API_BASE_URL: z.string().url().optional(),
  HUBTEL_CLIENT_ID: z.string().min(1).optional(),
  HUBTEL_CLIENT_SECRET: z.string().min(1).optional(),
  HUBTEL_SENDER_ID: z.string().min(1).optional(),
}).superRefine((value, context) => {
  if (value.SMS_PROVIDER !== "hubtel") {
    return;
  }

  if (!value.HUBTEL_API_BASE_URL) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["HUBTEL_API_BASE_URL"],
      message: "Hubtel API base URL is required when SMS_PROVIDER=hubtel",
    });
  }

  if (!value.HUBTEL_CLIENT_ID) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["HUBTEL_CLIENT_ID"],
      message: "Hubtel client ID is required when SMS_PROVIDER=hubtel",
    });
  }

  if (!value.HUBTEL_CLIENT_SECRET) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["HUBTEL_CLIENT_SECRET"],
      message: "Hubtel client secret is required when SMS_PROVIDER=hubtel",
    });
  }
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
  get DEEPSEEK_API_KEY() {
    return getEnv().DEEPSEEK_API_KEY;
  },
  get SMS_PROVIDER() {
    return getEnv().SMS_PROVIDER;
  },
  get PAYMENT_PROVIDER_WEBHOOK_SECRET() {
    return getEnv().PAYMENT_PROVIDER_WEBHOOK_SECRET;
  },
  get HUBTEL_API_BASE_URL() {
    return getEnv().HUBTEL_API_BASE_URL;
  },
  get HUBTEL_CLIENT_ID() {
    return getEnv().HUBTEL_CLIENT_ID;
  },
  get HUBTEL_CLIENT_SECRET() {
    return getEnv().HUBTEL_CLIENT_SECRET;
  },
  get HUBTEL_SENDER_ID() {
    return getEnv().HUBTEL_SENDER_ID;
  },
};
