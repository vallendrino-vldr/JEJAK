import { describe, expect, it } from "vitest";
import { isWorkflowInternalRoute } from "./internal-route";

describe("isWorkflowInternalRoute", () => {
  it.each([
    "/.well-known/workflow/v1",
    "/.well-known/workflow/v1/flow",
    "/.well-known/workflow/v1/step",
    "/.well-known/workflow/v1/webhook/token",
  ])("menerima namespace internal Workflow SDK: %s", (pathname) => {
    expect(isWorkflowInternalRoute(pathname)).toBe(true);
  });

  it.each([
    "/.well-known/workflow/v10/flow",
    "/.well-known/workflow/v1evil",
    "/.well-known/workflow/v1-evil",
    "/.well-known/workflow/v1%2Fflow",
    "/.well-known/workflow/v1\\flow",
    "/.well-known//workflow/v1/flow",
    "/api/workflow/v1/flow",
  ])("menolak path yang cuma menyerupai namespace internal: %s", (pathname) => {
    expect(isWorkflowInternalRoute(pathname)).toBe(false);
  });
});
