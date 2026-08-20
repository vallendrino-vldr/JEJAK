const WORKFLOW_INTERNAL_PREFIX = "/.well-known/workflow/v1";

export function isWorkflowInternalRoute(pathname: string) {
  return (
    pathname === WORKFLOW_INTERNAL_PREFIX || pathname.startsWith(`${WORKFLOW_INTERNAL_PREFIX}/`)
  );
}
