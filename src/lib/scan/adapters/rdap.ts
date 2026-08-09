import { createSupabaseServerClient } from "../../supabase/server";

export class RDAPAdapter {
  supports(targetType: string): boolean {
    return targetType === "domain";
  }

  validate(target: string): boolean {
    // Basic domain validation
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target);
  }

  async fetch(target: string): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s bounded timeout

    try {
      const response = await fetch(`https://rdap.org/domain/${target}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/rdap+json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null; // no_result
        if (response.status === 429) throw new Error("rate_limited");
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") {
        throw new Error("timeout");
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  normalize(rawResult: unknown): unknown {
    if (!rawResult || typeof rawResult !== "object") return null;
    const raw = rawResult as Record<string, unknown>;

    // Extract minimal facts as requested by Evidence Passport contract
    const facts: Record<string, unknown> = {
      handle: raw.handle,
      status: raw.status || [],
    };

    if (Array.isArray(raw.events)) {
      const registration = raw.events.find(
        (e: Record<string, unknown>) => e.eventAction === "registration",
      );
      if (registration) facts.registered_at = registration.eventDate;

      const expiration = raw.events.find(
        (e: Record<string, unknown>) => e.eventAction === "expiration",
      );
      if (expiration) facts.expires_at = expiration.eventDate;
    }

    if (Array.isArray(raw.entities)) {
      const registrant = raw.entities.find((e: Record<string, unknown>) => {
        const roles = e.roles;
        return Array.isArray(roles) && roles.includes("registrant");
      });

      if (registrant && Array.isArray(registrant.vcardArray) && registrant.vcardArray.length > 1) {
        const vcardProps = registrant.vcardArray[1];
        if (Array.isArray(vcardProps)) {
          const nameProp = vcardProps.find((p: unknown[]) => p[0] === "fn");
          const orgProp = vcardProps.find((p: unknown[]) => p[0] === "org");

          facts.registrant_name = nameProp ? nameProp[3] : undefined;
          facts.registrant_org = orgProp ? orgProp[3] : undefined;
        }
      }
    }

    return facts;
  }

  classifyResult(
    normalized: unknown,
  ): "success" | "no_result" | "timeout" | "malformed" | "rate_limited" | "blocked" {
    if (normalized === "timeout") return "timeout";
    if (normalized === "rate_limited") return "rate_limited";
    if (normalized === "malformed") return "malformed";
    if (!normalized) return "no_result";
    return "success";
  }

  async health(): Promise<boolean> {
    try {
      const res = await fetch("https://rdap.org/domain/example.com", {
        method: "HEAD",
        headers: { Accept: "application/rdap+json" },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Execute the adapter logic for a target and write to Evidence Passport.
   */
  async execute(
    runId: string,
    _scanId: string,
    _targetType: string,
    displayValue: string,
    userId: string,
    caseId?: string,
  ) {
    const supabase = await createSupabaseServerClient();

    let status = "success";
    let rawResult = null;
    let normalized: unknown = null;

    if (!this.validate(displayValue)) {
      status = "malformed";
    } else {
      try {
        rawResult = await this.fetch(displayValue);
        normalized = this.normalize(rawResult);
        status = this.classifyResult(normalized);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        if (msg === "timeout") status = "timeout";
        else if (msg === "rate_limited") status = "rate_limited";
        else status = "malformed"; // map unexpected to malformed for isolation
      }
    }

    // 1. Update source run record
    await supabase
      .from("scan_source_runs")
      .update({
        status: status === "success" || status === "no_result" ? "completed" : "failed",
        error_details: status !== "success" && status !== "no_result" ? { code: status } : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    // 2. Wire Result ke Evidence Passport (hanya jika ada hasil sukses dan caseId ada)
    if (status === "success" && normalized && caseId) {
      const evidencePayload = {
        case_id: caseId,
        evidence_class: "verified_fact",
        source_kind: "rdap",
        source_locator: `https://rdap.org/domain/${displayValue}`,
        reliability: "high",
        summary: `Catatan pendaftaran domain ${displayValue} ditemukan.`,
        detail: normalized,
        reverifiable: true,
        created_by_kind: "system", // Or omit if system is not in actor_kind, let's use 'user' and created_by user
        created_by: userId,
      };

      await supabase.from("case_evidence").insert(evidencePayload);
    }

    return status;
  }
}
