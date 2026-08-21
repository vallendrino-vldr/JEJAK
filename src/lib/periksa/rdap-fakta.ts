/**
 * Fakta RDAP terstruktur dari `safe_metadata` sebuah scan domain.
 *
 * Satu-satunya pembaca `safe_metadata` → fakta, dipakai bareng oleh tampilan
 * hasil (HasilRdap) dan layer analisa AI. Tujuannya grounding: AI HARUS
 * menganalisis fakta yang sama persis dengan yang dilihat user, bukan versi lain.
 * Pure, tanpa dependency server-only, aman diimpor di mana pun.
 */

export type FaktaRdap = {
  handle?: string;
  statuses: string[];
  events: Array<{ action: string; date: string }>;
  nameservers: string[];
  registrar?: string;
  registrantName?: string;
  registrantOrganization?: string;
  delegationSigned?: boolean;
};

type JsonObject = Record<string, unknown>;

function sebagaiObjek(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function teksAman(value: unknown, batas = 320): string | undefined {
  if (typeof value !== "string") return undefined;
  const hasil = value.trim();
  return hasil ? hasil.slice(0, batas) : undefined;
}

function daftarTeks(value: unknown, batasItem = 16): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .slice(0, batasItem)
        .map((item) => teksAman(item, 320))
        .filter((item): item is string => Boolean(item)),
    ),
  ];
}

/**
 * Baca `safe_metadata` (bentuk `{ result: FaktaRdap, meaning }`) jadi fakta
 * tervalidasi. Return null kalau tidak ada isi bermakna — JEJAK tidak mengisi
 * bagian kosong dengan tebakan.
 */
export function bacaFaktaRdap(metadata: unknown): FaktaRdap | null {
  const metadataObject = sebagaiObjek(metadata);
  const result = sebagaiObjek(metadataObject?.result);
  if (!result) return null;

  const events = Array.isArray(result.events)
    ? result.events
        .slice(0, 20)
        .map(sebagaiObjek)
        .filter((item): item is JsonObject => item !== null)
        .map((item) => ({
          action: teksAman(item.action, 100),
          date: teksAman(item.date, 100),
        }))
        .filter((item): item is { action: string; date: string } =>
          Boolean(item.action && item.date),
        )
    : [];

  const delegationSigned =
    typeof result.delegationSigned === "boolean" ? result.delegationSigned : undefined;

  const facts: FaktaRdap = {
    handle: teksAman(result.handle),
    statuses: daftarTeks(result.statuses),
    events,
    nameservers: daftarTeks(result.nameservers),
    registrar: teksAman(result.registrar),
    registrantName: teksAman(result.registrantName),
    registrantOrganization: teksAman(result.registrantOrganization),
    delegationSigned,
  };

  const adaIsi = Boolean(
    facts.handle ||
    facts.statuses.length ||
    facts.events.length ||
    facts.nameservers.length ||
    facts.registrar ||
    facts.registrantName ||
    facts.registrantOrganization ||
    facts.delegationSigned !== undefined,
  );

  return adaIsi ? facts : null;
}
