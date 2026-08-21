import "server-only";

import { randomUUID } from "node:crypto";
import { start } from "workflow/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { jalankanScanWorkflow } from "@/workflows/scan";

export type DispatchResult = "started" | "existing" | "busy" | "terminal" | "unavailable";

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/**
 * Mengklaim outbox secara atomik lalu memulai Workflow. Aman dipanggil ulang:
 * DB hanya memberi satu lease aktif dan workflow kedua ditolak lewat run id.
 */
export async function dispatchScan(scanId: string): Promise<DispatchResult> {
  const supabase = createSupabaseAdminClient();
  const claimToken = randomUUID();
  const { data: claimData, error: claimError } = await supabase.rpc("klaim_scan_dispatch", {
    p_scan_id: scanId,
    p_claim_token: claimToken,
  });

  if (claimError) return "unavailable";

  const state = objectValue(claimData)?.state;
  if (state === "dispatched") return "existing";
  if (state === "busy" || state === "waiting") return "busy";
  if (state === "terminal") return "terminal";
  if (state !== "ready") return "unavailable";

  let workflowRunId: string;
  try {
    const run = await start(jalankanScanWorkflow, [scanId]);
    workflowRunId = run.runId;
  } catch {
    await supabase.rpc("gagalkan_scan_dispatch", {
      p_scan_id: scanId,
      p_claim_token: claimToken,
      p_error_code: "workflow_start_failed",
    });
    return "unavailable";
  }

  const { error: ackError } = await supabase.rpc("selesaikan_scan_dispatch", {
    p_scan_id: scanId,
    p_claim_token: claimToken,
    p_workflow_run_id: workflowRunId,
  });

  // Workflow juga meng-ack outbox saat step prepare. Kalau respons ack ini
  // putus setelah start berhasil, run durable tetap jadi sumber pemulihan.
  return ackError ? "existing" : "started";
}
