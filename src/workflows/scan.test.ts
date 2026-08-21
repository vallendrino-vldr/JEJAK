import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RetryableError } from "workflow";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  adapterFetch: vi.fn(),
  getWorkflowMetadata: vi.fn(() => ({ workflowRunId: "workflow-run-1" })),
  RdapAdapterError: class RdapAdapterError extends Error {
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
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ rpc: mocks.rpc }),
}));

vi.mock("@/lib/scan/adapters/rdap", () => ({
  RDAPAdapter: class RDAPAdapter {
    fetch = mocks.adapterFetch;
  },
  RdapAdapterError: mocks.RdapAdapterError,
}));

vi.mock("workflow", async (importOriginal) => {
  const actual = await importOriginal<typeof import("workflow")>();
  return { ...actual, getWorkflowMetadata: mocks.getWorkflowMetadata };
});

import { jalankanScanWorkflow, markSourceFailedStep, runSourceStep } from "./scan";

const workflowRunId = "workflow-run-1";
const run = { runId: "run-rdap-1", sourceCode: "core_rdap" };
const claimedRun = {
  ...run,
  claimToken: `${workflowRunId}:${run.runId}`,
};

function claimedDomain() {
  return {
    data: {
      state: "claimed",
      sourceCode: "core_rdap",
      targetType: "domain",
      targetValue: "example.com",
      timeoutMs: 8000,
    },
    error: null,
  };
}

describe("scan workflow", () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.adapterFetch.mockReset();
    mocks.getWorkflowMetadata.mockReset();
    mocks.getWorkflowMetadata.mockReturnValue({ workflowRunId });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("menyimpan 404 sebagai no_result dengan coverage nol", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "klaim_source_run") return claimedDomain();
      if (name === "catat_hasil_source") return { data: null, error: null };
      throw new Error(`RPC tak terduga: ${name}`);
    });
    mocks.adapterFetch.mockResolvedValueOnce({ status: "no_result" });

    await expect(runSourceStep(claimedRun)).resolves.toEqual({ status: "no_result" });

    expect(mocks.rpc).toHaveBeenNthCalledWith(1, "klaim_source_run", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
    });

    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "catat_hasil_source", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
      p_status: "no_result",
      p_latency_ms: expect.any(Number),
      p_coverage: 0,
      p_error_code: null,
      p_safe_metadata: {
        result: null,
        meaning: "not_found_is_not_safe",
        reverifiable: true,
      },
    });
  });

  it("menyimpan fakta valid sebagai success dengan coverage penuh", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "klaim_source_run") return claimedDomain();
      if (name === "catat_hasil_source") return { data: null, error: null };
      throw new Error(`RPC tak terduga: ${name}`);
    });
    mocks.adapterFetch.mockResolvedValueOnce({
      status: "success",
      facts: {
        handle: "EXAMPLE-1",
        statuses: ["active"],
        events: [],
        nameservers: [],
      },
    });

    await expect(runSourceStep(claimedRun)).resolves.toEqual({ status: "success" });

    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "catat_hasil_source", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
      p_status: "success",
      p_latency_ms: expect.any(Number),
      p_coverage: 100,
      p_error_code: null,
      p_safe_metadata: {
        result: expect.objectContaining({ handle: "EXAMPLE-1", statuses: ["active"] }),
        meaning: "public_registration_record",
        reverifiable: true,
      },
    });
  });

  it("error permanen dicatat gagal dan tidak dilempar untuk retry", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "klaim_source_run") return claimedDomain();
      if (name === "catat_hasil_source") return { data: null, error: null };
      throw new Error(`RPC tak terduga: ${name}`);
    });
    mocks.adapterFetch.mockRejectedValueOnce(
      new mocks.RdapAdapterError("upstream_rejected", false),
    );

    await expect(runSourceStep(claimedRun)).resolves.toEqual({ status: "failed" });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "catat_hasil_source", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
      p_status: "failed",
      p_latency_ms: expect.any(Number),
      p_coverage: 0,
      p_error_code: "upstream_rejected",
      p_safe_metadata: {
        result: null,
        meaning: "source_failed",
        reverifiable: false,
      },
    });
  });

  it("error transien meminta retry dan belum menulis hasil final", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "klaim_source_run") return claimedDomain();
      if (name === "lepas_klaim_source") return { data: true, error: null };
      throw new Error(`RPC tak terduga: ${name}`);
    });
    mocks.adapterFetch.mockRejectedValueOnce(
      new mocks.RdapAdapterError("rate_limited", true, 2000),
    );

    const error = await runSourceStep(claimedRun).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(RetryableError);
    expect(error).toMatchObject({ message: "rate_limited" });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "lepas_klaim_source", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
      p_error_code: "rate_limited",
    });
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
  });

  it("claim yang masih dipakai worker lain jadi retry tanpa memanggil adapter", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: { state: "busy", retryAfterMs: 3500 },
      error: null,
    });

    const error = await runSourceStep(claimedRun).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(RetryableError);
    expect(error).toMatchObject({ message: "source_claim_busy" });
    expect(mocks.adapterFetch).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("penanda retry habis memakai claim token dan metadata gagal non-reverifiable", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "klaim_source_run") return claimedDomain();
      if (name === "catat_hasil_source") return { data: null, error: null };
      throw new Error(`RPC tak terduga: ${name}`);
    });

    await expect(markSourceFailedStep(claimedRun)).resolves.toBeUndefined();

    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "catat_hasil_source", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
      p_status: "failed",
      p_latency_ms: 0,
      p_coverage: 0,
      p_error_code: "retry_exhausted",
      p_safe_metadata: {
        result: null,
        meaning: "source_failed",
        reverifiable: false,
      },
    });
  });

  it("workflow duplikat berhenti sebelum claim atau finalisasi", async () => {
    mocks.rpc.mockImplementation(async (name: string, args: unknown) => {
      if (name === "siapkan_scan_worker") {
        expect(args).toEqual({
          p_scan_id: "scan-duplicate",
          p_workflow_run_id: workflowRunId,
        });
        return { data: { state: "duplicate", status: "running" }, error: null };
      }
      throw new Error(`RPC tak terduga: ${name}`);
    });

    await expect(jalankanScanWorkflow("scan-duplicate")).resolves.toEqual({
      scanId: "scan-duplicate",
      status: "running",
    });

    expect(mocks.getWorkflowMetadata).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.adapterFetch).not.toHaveBeenCalled();
  });

  it("no_result diteruskan ke finalisasi dan status akhirnya refunded", async () => {
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "siapkan_scan_worker") {
        return { data: { state: "ready", runs: [run] }, error: null };
      }
      if (name === "klaim_source_run") return claimedDomain();
      if (name === "catat_hasil_source") return { data: null, error: null };
      if (name === "finalisasi_scan") return { data: { status: "refunded" }, error: null };
      throw new Error(`RPC tak terduga: ${name}`);
    });
    mocks.adapterFetch.mockResolvedValueOnce({ status: "no_result" });

    await expect(jalankanScanWorkflow("scan-1")).resolves.toEqual({
      scanId: "scan-1",
      status: "refunded",
    });

    expect(mocks.rpc.mock.calls.map(([name]) => name)).toEqual([
      "siapkan_scan_worker",
      "klaim_source_run",
      "catat_hasil_source",
      "finalisasi_scan",
    ]);
    expect(mocks.getWorkflowMetadata).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenNthCalledWith(1, "siapkan_scan_worker", {
      p_scan_id: "scan-1",
      p_workflow_run_id: workflowRunId,
    });
    expect(mocks.rpc).toHaveBeenNthCalledWith(2, "klaim_source_run", {
      p_run_id: run.runId,
      p_claim_token: claimedRun.claimToken,
    });
    expect(mocks.rpc).not.toHaveBeenCalledWith("gagalkan_scan_worker", expect.anything());
  });
});
