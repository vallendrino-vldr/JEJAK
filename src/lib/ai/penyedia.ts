import "server-only";
import { getServerEnv } from "@/lib/env/server";

/**
 * Layer penyedia AI (Gemini + Groq) lewat REST langsung, tanpa SDK.
 *
 * - Slot ditemukan dari env (GEMINI_API_KEY_1..4, GROQ_API_KEY_1..4); slot
 *   kosong dilewati. Jumlah key bukan arsitektur (ENV_CONTRACT §14).
 * - Multi-key HANYA untuk ketersediaan/failover, BUKAN evasi kuota (DEC-0043).
 *   Urutan coba: semua Gemini lalu semua Groq — failover karena satu jalur
 *   tidak tersedia, bukan untuk menembus limit.
 * - Kunci tidak pernah masuk log/URL. Yang dicatat cuma alias + status.
 */

// ponytail: model di-hardcode. Pindah ke config DB kalau Owner perlu ganti
// model tanpa deploy (ENV_CONTRACT §18/§205). Keduanya diverifikasi via smoke
// ke provider nyata (2026-08-21); model lama sudah pensiun.
const MODEL_GEMINI = "gemini-3.6-flash";
const MODEL_GROQ = "openai/gpt-oss-20b";

const PER_SLOT_MS = 9_000;
const DEADLINE_MS = 16_000;

type Slot = { alias: string; provider: "gemini" | "groq"; key: string };

export type PermintaanAI = {
  system: string;
  user: string;
  temperature?: number;
  maxOutputTokens?: number;
};

function daftarSlot(): Slot[] {
  let env: ReturnType<typeof getServerEnv>;
  try {
    env = getServerEnv();
  } catch {
    return [];
  }

  const slot: Slot[] = [];
  for (const [alias, provider] of [
    ["GEMINI_API_KEY_1", "gemini"],
    ["GEMINI_API_KEY_2", "gemini"],
    ["GEMINI_API_KEY_3", "gemini"],
    ["GEMINI_API_KEY_4", "gemini"],
    ["GROQ_API_KEY_1", "groq"],
    ["GROQ_API_KEY_2", "groq"],
    ["GROQ_API_KEY_3", "groq"],
    ["GROQ_API_KEY_4", "groq"],
  ] as const) {
    const key = (env as Record<string, string | undefined>)[alias];
    if (key) slot.push({ alias, provider, key });
  }
  return slot;
}

export function adaPenyediaAI(): boolean {
  return daftarSlot().length > 0;
}

async function panggilGemini(slot: Slot, req: PermintaanAI, signal: AbortSignal): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent`,
    {
      method: "POST",
      signal,
      headers: { "content-type": "application/json", "x-goog-api-key": slot.key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: "user", parts: [{ text: req.user }] }],
        generationConfig: {
          temperature: req.temperature ?? 0.2,
          maxOutputTokens: req.maxOutputTokens ?? 700,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`gemini_http_${res.status}`);
  const data: unknown = await res.json();
  const teks = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> })
    .candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof teks !== "string" || !teks.trim()) throw new Error("gemini_empty");
  return teks;
}

async function panggilGroq(slot: Slot, req: PermintaanAI, signal: AbortSignal): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", authorization: `Bearer ${slot.key}` },
    body: JSON.stringify({
      model: MODEL_GROQ,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxOutputTokens ?? 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
    }),
  });

  if (!res.ok) throw new Error(`groq_http_${res.status}`);
  const data: unknown = await res.json();
  const teks = (data as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]
    ?.message?.content;
  if (typeof teks !== "string" || !teks.trim()) throw new Error("groq_empty");
  return teks;
}

/**
 * Panggil AI dengan failover antar-slot. Return teks mentah (JSON string sesuai
 * kontrak prompt) dari slot pertama yang berhasil, atau null kalau semua gagal /
 * tidak ada slot. Caller wajib punya jalur non-AI kalau ini null (DEC-0034).
 */
export async function panggilAI(req: PermintaanAI): Promise<string | null> {
  const slots = daftarSlot();
  const deadline = Date.now() + DEADLINE_MS;

  for (const slot of slots) {
    if (Date.now() >= deadline) break;

    const controller = new AbortController();
    const batas = setTimeout(() => controller.abort(), PER_SLOT_MS);
    try {
      const teks =
        slot.provider === "gemini"
          ? await panggilGemini(slot, req, controller.signal)
          : await panggilGroq(slot, req, controller.signal);
      return teks;
    } catch (error) {
      // Alias + status saja, tidak pernah kunci. Lanjut ke slot berikutnya.
      console.warn(
        `[ai] slot ${slot.alias} gagal: ${error instanceof Error ? error.message : "?"}`,
      );
    } finally {
      clearTimeout(batas);
    }
  }

  return null;
}
