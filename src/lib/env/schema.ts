import { z } from "zod";

const safeServiceUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    const url = new URL(value);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "https:" || (isLocal && url.protocol === "http:");
  }, "URL wajib HTTPS, kecuali service lokal.");

const requiredKey = z.string().trim().min(20);
const optionalProviderKey = z.string().trim().min(10).optional();

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: safeServiceUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: requiredKey,
});

export const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SECRET_KEY: requiredKey,
  SUPABASE_JWKS_URL: safeServiceUrl.optional(),
  GEMINI_API_KEY_1: optionalProviderKey,
  GEMINI_API_KEY_2: optionalProviderKey,
  GEMINI_API_KEY_3: optionalProviderKey,
  GEMINI_API_KEY_4: optionalProviderKey,
  GROQ_API_KEY_1: optionalProviderKey,
  GROQ_API_KEY_2: optionalProviderKey,
  GROQ_API_KEY_3: optionalProviderKey,
  GROQ_API_KEY_4: optionalProviderKey,
});

export class EnvironmentValidationError extends Error {
  readonly missingOrInvalidKeys: string[];

  constructor(keys: string[]) {
    super(`Konfigurasi environment belum lengkap: ${keys.join(", ")}`);
    this.name = "EnvironmentValidationError";
    this.missingOrInvalidKeys = keys;
  }
}

function parseEnvironment<TSchema extends z.ZodType>(
  schema: TSchema,
  input: Record<string, string | undefined>,
): z.output<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const keys = [
      ...new Set(result.error.issues.map((issue) => String(issue.path[0] ?? "UNKNOWN_ENV"))),
    ].sort();
    throw new EnvironmentValidationError(keys);
  }

  return result.data;
}

export function parseClientEnv(input: Record<string, string | undefined>) {
  return parseEnvironment(clientEnvSchema, input);
}

export function parseServerEnv(input: Record<string, string | undefined>) {
  return parseEnvironment(serverEnvSchema, input);
}
