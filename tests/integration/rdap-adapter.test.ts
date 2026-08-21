import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { RDAPAdapter, RdapAdapterError } from "../../src/lib/scan/adapters/rdap";

const mocks = vi.hoisted(() => ({
  assertPublicHttpsUrl: vi.fn(async (value: string | URL) => new URL(value)),
}));

vi.mock("@/lib/security/public-network", () => ({
  assertPublicHttpsUrl: mocks.assertPublicHttpsUrl,
}));

describe("RDAP Adapter", () => {
  beforeEach(() => {
    mocks.assertPublicHttpsUrl.mockReset();
    mocks.assertPublicHttpsUrl.mockImplementation(async (value) => new URL(value));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      statuses: ["active"],
      events: [
        { action: "registration", date: "2000-01-01T00:00:00Z" },
        { action: "expiration", date: "2030-01-01T00:00:00Z" },
      ],
      nameservers: [],
      registrar: undefined,
      registrantName: "John Doe",
      registrantOrganization: "Example Inc",
      delegationSigned: undefined,
    });
  });

  test("response kosong bukan hasil sukses", () => {
    const adapter = new RDAPAdapter();
    expect(adapter.normalize(null)).toBeNull();
    expect(adapter.normalize({})).toBeNull();
  });

  test("404 menjadi no_result, bukan success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 404 }));

    const adapter = new RDAPAdapter();
    await expect(adapter.fetch("example.com")).resolves.toEqual({ status: "no_result" });
  });

  test("response valid menjadi success dengan fakta minimal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          handle: "EXAMPLE-1",
          status: ["active", "active"],
          nameservers: [{ ldhName: "NS1.EXAMPLE.COM" }],
          secureDNS: { delegationSigned: true },
        }),
        { status: 200, headers: { "content-type": "application/rdap+json" } },
      ),
    );

    const adapter = new RDAPAdapter();
    await expect(adapter.fetch("EXAMPLE.COM")).resolves.toMatchObject({
      status: "success",
      facts: {
        handle: "EXAMPLE-1",
        statuses: ["active"],
        nameservers: ["ns1.example.com"],
        delegationSigned: true,
      },
    });
  });

  test.each([
    { status: 429, code: "rate_limited", retryAfterMs: 2000 },
    { status: 503, code: "upstream_unavailable", retryAfterMs: 3000 },
  ])("HTTP $status jadi error transien $code", async ({ status, code, retryAfterMs }) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status,
        headers: status === 429 ? { "retry-after": "2" } : undefined,
      }),
    );

    const error = await new RDAPAdapter().fetch("example.com").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(RdapAdapterError);
    expect(error).toMatchObject({ code, retryable: true, retryAfterMs });
  });

  test.each([
    { response: new Response(null, { status: 400 }), code: "upstream_rejected" },
    { response: new Response("bukan-json", { status: 200 }), code: "malformed_response" },
    { response: new Response("{}", { status: 200 }), code: "empty_response" },
  ])("$code jadi error permanen", async ({ response, code }) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response);

    const error = await new RDAPAdapter().fetch("example.com").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(RdapAdapterError);
    expect(error).toMatchObject({ code, retryable: false });
  });

  test("timeout dan kegagalan jaringan bisa diulang", async () => {
    const timeoutFetch = vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const timeoutError = await new RDAPAdapter()
      .fetch("example.com", 1)
      .catch((reason: unknown) => reason);
    expect(timeoutError).toMatchObject({ code: "timeout", retryable: true });

    timeoutFetch.mockRejectedValueOnce(new TypeError("socket closed"));
    const networkError = await new RDAPAdapter()
      .fetch("example.com")
      .catch((reason: unknown) => reason);
    expect(networkError).toMatchObject({ code: "network_error", retryable: true });
  });

  test("redirect dibatasi dan URL tujuan selalu diperiksa lagi", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "https://registry.example/domain/x" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(new RDAPAdapter().fetch("example.com")).resolves.toEqual({ status: "no_result" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mocks.assertPublicHttpsUrl).toHaveBeenNthCalledWith(
      2,
      new URL("https://registry.example/domain/x"),
    );
  });

  test("redirect yang diblokir SSRF jadi kegagalan permanen", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: "https://127.0.0.1/admin" } }),
    );
    mocks.assertPublicHttpsUrl
      .mockResolvedValueOnce(new URL("https://rdap.org/domain/example.com"))
      .mockRejectedValueOnce(new Error("blocked_url_address"));

    const error = await new RDAPAdapter().fetch("example.com").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(RdapAdapterError);
    expect(error).toMatchObject({ code: "destination_rejected", retryable: false });
  });

  test("gangguan DNS saat guard berjalan jadi error jaringan transien", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    mocks.assertPublicHttpsUrl.mockRejectedValueOnce(new Error("getaddrinfo EAI_AGAIN"));

    const error = await new RDAPAdapter().fetch("example.com").catch((reason: unknown) => reason);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(RdapAdapterError);
    expect(error).toMatchObject({ code: "network_error", retryable: true, retryAfterMs: 2000 });
  });
});
