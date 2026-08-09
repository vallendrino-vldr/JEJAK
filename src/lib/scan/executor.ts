import { createSupabaseServerClient } from "../supabase/server";
import { RDAPAdapter } from "./adapters/rdap";

export async function executeScan(scanId: string) {
  const supabase = await createSupabaseServerClient();

  // 1. Dapatkan info scan
  const { data: scan, error: errScan } = await supabase
    .from("scans")
    .select("*, scan_quotes(final_credit_cost)")
    .eq("id", scanId)
    .single();

  if (errScan || !scan) throw new Error("Scan tidak ditemukan");

  // 2. Dapatkan targets
  const { data: targets } = await supabase.from("scan_targets").eq("scan_id", scanId);
  if (!targets || targets.length === 0) throw new Error("Target kosong");

  // 3. Dapatkan queued runs
  const { data: runs } = await supabase
    .from("scan_source_runs")
    .select("*, source_registry(id, name, code)")
    .eq("scan_id", scanId)
    .eq("status", "queued");

  if (!runs || runs.length === 0) return; // Tidak ada yang perlu dijalankan

  let anySuccess = false;
  let anyError = false;

  // 4. Eksekusi per source
  for (const run of runs) {
    await supabase
      .from("scan_source_runs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", run.id);

    try {
      if (run.source_registry.code === "rdap_domain") {
        const adapter = new RDAPAdapter();
        // Hanya target domain
        const domainTargets = targets.filter((t) => adapter.supports(t.target_type));

        let adapterStatus = "success";
        for (const target of domainTargets) {
          const resStatus = await adapter.execute(
            run.id,
            scan.id,
            target.target_type,
            target.display_value_masked,
            scan.user_id,
            scan.case_id,
          );
          if (resStatus !== "success" && resStatus !== "no_result") {
            adapterStatus = "failed";
          }
        }

        if (adapterStatus === "success" && domainTargets.length > 0) {
          anySuccess = true;
        } else if (adapterStatus === "failed") {
          anyError = true;
        }
      } else {
        // Source lain belum diimplementasi, mock fail
        await supabase
          .from("scan_source_runs")
          .update({
            status: "failed",
            error_details: { code: "not_implemented" },
            completed_at: new Date().toISOString(),
          })
          .eq("id", run.id);
        anyError = true;
      }
    } catch (e: unknown) {
      await supabase
        .from("scan_source_runs")
        .update({
          status: "failed",
          error_details: {
            code: "unexpected",
            msg: e instanceof Error ? e.message : "unknown error",
          },
          completed_at: new Date().toISOString(),
        })
        .eq("id", run.id);
      anyError = true;
    }
  }

  // Use anyError if needed later, e.g. for partial success logic
  if (anyError && !anySuccess) {
    // All failed
  }

  // 5. Settlement / Release
  const idempotencyKey = scan.idempotency_key + "_settle";

  if (anySuccess) {
    // Settle credits
    const finalCost = scan.scan_quotes?.final_credit_cost || 0;
    if (finalCost > 0) {
      await supabase.rpc("settle_scan_credits", {
        p_scan_id: scan.id,
        p_final_cost: finalCost,
        p_idempotency_key: idempotencyKey,
      });
    }

    await supabase
      .from("scans")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", scan.id);
  } else {
    // Release credits if all failed/no_result and we want to refund
    await supabase.rpc("release_scan_credits", {
      p_scan_id: scan.id,
      p_idempotency_key: idempotencyKey,
    });

    await supabase
      .from("scans")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", scan.id);
  }
}
