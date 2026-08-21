import { assertPublicHttpsUrl } from "@/lib/security/public-network";

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;

export type RdapFacts = {
  handle?: string;
  statuses: string[];
  events: Array<{ action: string; date: string }>;
  nameservers: string[];
  registrar?: string;
  registrantName?: string;
  registrantOrganization?: string;
  delegationSigned?: boolean;
};

export type RdapFetchResult = { status: "success"; facts: RdapFacts } | { status: "no_result" };

export class RdapAdapterError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;

  constructor(code: string, retryable: boolean, retryAfterMs?: number) {
    super(code);
    this.name = "RdapAdapterError";
    this.code = code;
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(asString).filter((item): item is string => Boolean(item)))];
}

function vcardValue(entity: Record<string, unknown>, field: string): string | undefined {
  if (!Array.isArray(entity.vcardArray) || !Array.isArray(entity.vcardArray[1])) return undefined;

  for (const property of entity.vcardArray[1]) {
    if (!Array.isArray(property) || property[0] !== field) continue;
    return asString(property[3]);
  }

  return undefined;
}

function entityWithRole(raw: unknown, role: string): Record<string, unknown> | undefined {
  if (!Array.isArray(raw)) return undefined;

  return raw
    .map(asRecord)
    .filter((entity): entity is Record<string, unknown> => entity !== null)
    .find((entity) => stringArray(entity.roles).includes(role));
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 15 * 60_000);

  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, Math.min(date - Date.now(), 15 * 60_000));
  return undefined;
}

export class RDAPAdapter {
  supports(targetType: string): boolean {
    return targetType === "domain";
  }

  validate(target: string): boolean {
    return (
      target.length <= 253 &&
      /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(target)
    );
  }

  normalize(rawResult: unknown): RdapFacts | null {
    const raw = asRecord(rawResult);
    if (!raw) return null;

    const events = Array.isArray(raw.events)
      ? raw.events
          .map(asRecord)
          .filter((event): event is Record<string, unknown> => event !== null)
          .map((event) => ({
            action: asString(event.eventAction),
            date: asString(event.eventDate),
          }))
          .filter((event): event is { action: string; date: string } =>
            Boolean(event.action && event.date),
          )
      : [];

    const nameservers = Array.isArray(raw.nameservers)
      ? raw.nameservers
          .map(asRecord)
          .filter((item): item is Record<string, unknown> => item !== null)
          .map((item) => asString(item.ldhName)?.toLowerCase())
          .filter((item): item is string => Boolean(item))
      : [];

    const registrant = entityWithRole(raw.entities, "registrant");
    const registrar = entityWithRole(raw.entities, "registrar");
    const secureDns = asRecord(raw.secureDNS);

    const facts: RdapFacts = {
      handle: asString(raw.handle),
      statuses: stringArray(raw.status),
      events,
      nameservers: [...new Set(nameservers)],
      registrar: registrar
        ? (vcardValue(registrar, "org") ?? vcardValue(registrar, "fn"))
        : undefined,
      registrantName: registrant ? vcardValue(registrant, "fn") : undefined,
      registrantOrganization: registrant ? vcardValue(registrant, "org") : undefined,
      delegationSigned:
        typeof secureDns?.delegationSigned === "boolean" ? secureDns.delegationSigned : undefined,
    };

    const meaningful = Boolean(
      facts.handle ||
      facts.statuses.length ||
      facts.events.length ||
      facts.nameservers.length ||
      facts.registrar,
    );

    return meaningful ? facts : null;
  }

  async fetch(target: string, timeoutMs = 8000): Promise<RdapFetchResult> {
    const normalizedTarget = target.trim().toLowerCase();
    if (!this.validate(normalizedTarget)) {
      throw new RdapAdapterError("invalid_target", false);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let currentUrl = new URL(`https://rdap.org/domain/${encodeURIComponent(normalizedTarget)}`);

    try {
      for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
        try {
          await assertPublicHttpsUrl(currentUrl);
        } catch (error) {
          if (error instanceof Error && error.message.startsWith("blocked_url_")) {
            throw new RdapAdapterError("destination_rejected", false);
          }
          throw new RdapAdapterError("network_error", true, 2000);
        }

        let response: Response;
        try {
          response = await fetch(currentUrl, {
            signal: controller.signal,
            redirect: "manual",
            headers: {
              Accept: "application/rdap+json, application/json;q=0.9",
              "User-Agent": "JEJAK-RDAP/1.0",
            },
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            throw new RdapAdapterError("timeout", true, 2000);
          }
          if (error instanceof RdapAdapterError) throw error;
          throw new RdapAdapterError("network_error", true, 2000);
        }

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get("location");
          if (!location || redirectCount === MAX_REDIRECTS) {
            throw new RdapAdapterError("redirect_rejected", false);
          }
          currentUrl = new URL(location, currentUrl);
          continue;
        }

        if (response.status === 404) return { status: "no_result" };
        if (response.status === 429) {
          throw new RdapAdapterError(
            "rate_limited",
            true,
            parseRetryAfter(response.headers.get("retry-after")),
          );
        }
        if (response.status >= 500) {
          throw new RdapAdapterError("upstream_unavailable", true, 3000);
        }
        if (!response.ok) {
          throw new RdapAdapterError("upstream_rejected", false);
        }

        const announcedLength = Number(response.headers.get("content-length") ?? "0");
        if (announcedLength > MAX_RESPONSE_BYTES) {
          throw new RdapAdapterError("response_too_large", false);
        }

        const body = await response.text();
        if (new TextEncoder().encode(body).byteLength > MAX_RESPONSE_BYTES) {
          throw new RdapAdapterError("response_too_large", false);
        }

        let raw: unknown;
        try {
          raw = JSON.parse(body);
        } catch {
          throw new RdapAdapterError("malformed_response", false);
        }

        const facts = this.normalize(raw);
        if (!facts) throw new RdapAdapterError("empty_response", false);
        return { status: "success", facts };
      }

      throw new RdapAdapterError("redirect_rejected", false);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
