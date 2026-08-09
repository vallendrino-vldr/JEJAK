import { expect, test, describe, vi } from "vitest";
import { RDAPAdapter } from "../../src/lib/scan/adapters/rdap";

vi.mock("../../src/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("RDAP Adapter", () => {
  test("supports domain", () => {
    const adapter = new RDAPAdapter();
    expect(adapter.supports("domain")).toBe(true);
    expect(adapter.supports("email")).toBe(false);
  });

  test("validate target", () => {
    const adapter = new RDAPAdapter();
    expect(adapter.validate("example.com")).toBe(true);
    expect(adapter.validate("invalid domain")).toBe(false);
  });

  test("normalize extracts minimal facts", () => {
    const adapter = new RDAPAdapter();
    const mockRaw = {
      handle: "12345-DOMAIN",
      status: ["active"],
      events: [
        { eventAction: "registration", eventDate: "2000-01-01T00:00:00Z" },
        { eventAction: "expiration", eventDate: "2030-01-01T00:00:00Z" },
      ],
      entities: [
        {
          roles: ["registrant"],
          vcardArray: [
            "vcard",
            [
              ["fn", {}, "text", "John Doe"],
              ["org", {}, "text", "Example Inc"],
            ],
          ],
        },
      ],
    };

    const normalized = adapter.normalize(mockRaw);
    expect(normalized).toEqual({
      handle: "12345-DOMAIN",
      status: ["active"],
      registered_at: "2000-01-01T00:00:00Z",
      expires_at: "2030-01-01T00:00:00Z",
      registrant_name: "John Doe",
      registrant_org: "Example Inc",
    });
  });

  test("classifyResult logic", () => {
    const adapter = new RDAPAdapter();
    expect(adapter.classifyResult(null)).toBe("no_result");
    expect(adapter.classifyResult("timeout")).toBe("timeout");
    expect(adapter.classifyResult({ handle: "123" })).toBe("success");
  });
});
