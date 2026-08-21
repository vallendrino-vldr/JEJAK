import { getWorkflowMetadata } from "workflow";

type PreparedRun = { runId: string; sourceCode: string };
type ClaimedRun = PreparedRun & { claimToken: string };
type PrepareResult = {
  state: "ready" | "terminal" | "rejected" | "duplicate";
  status?: string;
  reason?: string;
  runs: PreparedRun[];
};

type SourceResult = { status: "success" | "no_result" | "failed" | "terminal" };
type WorkflowResult = { scanId: string; status: string };

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function safeString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parsePrepareResult(value: unknown): PrepareResult {
  const data = asObject(value);
  const state = safeString(data?.state);

  if (state === "terminal" || state === "rejected" || state === "duplicate") {
    return {
      state,
      status: safeString(data?.status),
      reason: safeString(data?.reason),
      runs: [],
    };
  }

  if (state !== "ready" || !Array.isArray(data?.runs)) {
    throw new Error("invalid_prepare_contract");
  }

  const runs = data.runs.map((item) => {
    const run = asObject(item);
    const runId = safeString(run?.runId);
    const sourceCode = safeString(run?.sourceCode);
    if (!runId || !sourceCode) throw new Error("invalid_run_contract");
    return { runId, sourceCode };
  });

  return { state: "ready", runs };
}

export async function prepareScanStep(
  scanId: string,
  workflowRunId: string,
): Promise<PrepareResult> {
  "use step";

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("siapkan_scan_worker", {
    p_scan_id: scanId,
    p_workflow_run_id: workflowRunId,
  });

  if (error) throw new Error("prepare_scan_failed");
  return parsePrepareResult(data);
}

export async function runSourceStep(run: ClaimedRun): Promise<SourceResult> {
  "use step";

  const [{ createSupabaseAdminClient }, { RDAPAdapter, RdapAdapterError }, workflow] =
    await Promise.all([
      import("@/lib/supabase/admin"),
      import("@/lib/scan/adapters/rdap"),
      import("workflow"),
    ]);
  const supabase = createSupabaseAdminClient();
  const { data: claimData, error: claimError } = await supabase.rpc("klaim_source_run", {
    p_run_id: run.runId,
    p_claim_token: run.claimToken,
  });

  if (claimError) throw new Error("claim_source_failed");

  const claim = asObject(claimData);
  if (claim?.state === "terminal") return { status: "terminal" };
  if (claim?.state === "busy") {
    throw new workflow.RetryableError("source_claim_busy", {
      retryAfter: Number(claim.retryAfterMs) || 2000,
    });
  }

  const sourceCode = safeString(claim?.sourceCode);
  const targetType = safeString(claim?.targetType);
  const targetValue = safeString(claim?.targetValue);
  const timeoutMs = Number(claim?.timeoutMs);

  if (
    claim?.state !== "claimed" ||
    sourceCode !== run.sourceCode ||
    sourceCode !== "core_rdap" ||
    targetType !== "domain" ||
    !targetValue ||
    !Number.isFinite(timeoutMs)
  ) {
    throw new workflow.FatalError("invalid_source_contract");
  }

  const startedAt = Date.now();
  const adapter = new RDAPAdapter();

  try {
    const result = await adapter.fetch(targetValue, timeoutMs);
    const latency = Math.max(0, Date.now() - startedAt);

    if (result.status === "no_result") {
      const { error } = await supabase.rpc("catat_hasil_source", {
        p_run_id: run.runId,
        p_claim_token: run.claimToken,
        p_status: "no_result",
        p_latency_ms: latency,
        p_coverage: 0,
        p_error_code: null,
        p_safe_metadata: {
          result: null,
          meaning: "not_found_is_not_safe",
          reverifiable: true,
        },
      });
      if (error) throw new Error("persist_source_result_failed");
      return { status: "no_result" };
    }

    const { error } = await supabase.rpc("catat_hasil_source", {
      p_run_id: run.runId,
      p_claim_token: run.claimToken,
      p_status: "success",
      p_latency_ms: latency,
      p_coverage: 100,
      p_error_code: null,
      p_safe_metadata: {
        result: result.facts,
        meaning: "public_registration_record",
        reverifiable: true,
      },
    });
    if (error) throw new Error("persist_source_result_failed");
    return { status: "success" };
  } catch (error) {
    if (error instanceof RdapAdapterError && !error.retryable) {
      const { error: persistError } = await supabase.rpc("catat_hasil_source", {
        p_run_id: run.runId,
        p_claim_token: run.claimToken,
        p_status: "failed",
        p_latency_ms: Math.max(0, Date.now() - startedAt),
        p_coverage: 0,
        p_error_code: error.code,
        p_safe_metadata: { result: null, meaning: "source_failed", reverifiable: false },
      });
      if (persistError) {
        await supabase.rpc("lepas_klaim_source", {
          p_run_id: run.runId,
          p_claim_token: run.claimToken,
          p_error_code: "persist_source_failure_failed",
        });
        throw new Error("persist_source_failure_failed");
      }
      return { status: "failed" };
    }

    if (error instanceof RdapAdapterError && error.retryable) {
      const { error: releaseError } = await supabase.rpc("lepas_klaim_source", {
        p_run_id: run.runId,
        p_claim_token: run.claimToken,
        p_error_code: error.code,
      });
      if (releaseError) throw new Error("release_source_claim_failed");

      throw new workflow.RetryableError(error.code, {
        retryAfter: error.retryAfterMs ?? 2000,
      });
    }

    await supabase.rpc("lepas_klaim_source", {
      p_run_id: run.runId,
      p_claim_token: run.claimToken,
      p_error_code: "step_failed",
    });

    throw error;
  }
}

runSourceStep.maxRetries = 4;

export async function markSourceFailedStep(run: ClaimedRun): Promise<void> {
  "use step";

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { data: claimData, error: claimError } = await supabase.rpc("klaim_source_run", {
    p_run_id: run.runId,
    p_claim_token: run.claimToken,
  });

  if (claimError) throw new Error("claim_source_for_failure_failed");
  const claim = asObject(claimData);
  if (claim?.state === "terminal") return;
  if (claim?.state !== "claimed") throw new Error("source_claim_busy_after_retries");

  const { error } = await supabase.rpc("catat_hasil_source", {
    p_run_id: run.runId,
    p_claim_token: run.claimToken,
    p_status: "failed",
    p_latency_ms: 0,
    p_coverage: 0,
    p_error_code: "retry_exhausted",
    p_safe_metadata: { result: null, meaning: "source_failed", reverifiable: false },
  });

  if (error) throw new Error("persist_source_failure_failed");
}

export async function finalizeScanStep(scanId: string): Promise<string> {
  "use step";

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("finalisasi_scan", { p_scan_id: scanId });

  if (error) throw new Error("finalize_scan_failed");
  const status = safeString(asObject(data)?.status);
  if (!status) throw new Error("invalid_finalize_contract");
  return status;
}

export async function compensateScanStep(scanId: string): Promise<string> {
  "use step";

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("gagalkan_scan_worker", {
    p_scan_id: scanId,
    p_reason: "workflow_failed",
  });

  if (error) throw new Error("compensate_scan_failed");
  return safeString(asObject(data)?.status) ?? "failed";
}

export async function jalankanScanWorkflow(scanId: string): Promise<WorkflowResult> {
  "use workflow";

  try {
    const { workflowRunId } = getWorkflowMetadata();
    const prepared = await prepareScanStep(scanId, workflowRunId);
    if (prepared.state !== "ready") {
      return { scanId, status: prepared.status ?? prepared.reason ?? prepared.state };
    }

    for (const run of prepared.runs) {
      const claimedRun: ClaimedRun = {
        ...run,
        claimToken: `${workflowRunId}:${run.runId}`,
      };

      try {
        await runSourceStep(claimedRun);
      } catch {
        await markSourceFailedStep(claimedRun);
      }
    }

    const status = await finalizeScanStep(scanId);
    return { scanId, status };
  } catch {
    const status = await compensateScanStep(scanId);
    return { scanId, status };
  }
}
