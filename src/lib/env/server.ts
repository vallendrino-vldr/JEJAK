import "server-only";
import { parseServerEnv } from "./schema";

export function getServerEnv() {
  return parseServerEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_JWKS_URL: process.env.SUPABASE_JWKS_URL,
    GEMINI_API_KEY_1: process.env.GEMINI_API_KEY_1,
    GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2,
    GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3,
    GEMINI_API_KEY_4: process.env.GEMINI_API_KEY_4,
    GROQ_API_KEY_1: process.env.GROQ_API_KEY_1,
    GROQ_API_KEY_2: process.env.GROQ_API_KEY_2,
    GROQ_API_KEY_3: process.env.GROQ_API_KEY_3,
    GROQ_API_KEY_4: process.env.GROQ_API_KEY_4,
  });
}
