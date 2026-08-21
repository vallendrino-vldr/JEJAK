import { describe, expect, it } from "vitest";
import { assertPublicHttpsUrl, isPublicIpAddress } from "./public-network";

describe("public network guard", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "::1",
    "fc00::1",
    "fe80::1",
    "2001:db8::1",
    "0:0:0:0:0:0:0:0",
    "0:0:0:0:0:0:0:1",
    "0:0:0:0:0:ffff:7f00:1",
    "::ffff:127.0.0.1",
    "64:ff9b::7f00:1",
    "2002:7f00:1::",
  ])("menolak alamat non-publik %s", (address) => {
    expect(isPublicIpAddress(address)).toBe(false);
  });

  it.each(["1.1.1.1", "8.8.8.8", "2606:4700:4700::1111"])(
    "menerima alamat publik %s",
    (address) => {
      expect(isPublicIpAddress(address)).toBe(true);
    },
  );

  it("menolak HTTP, credential, port custom, localhost, dan hasil DNS privat", async () => {
    const publicResolver = async () => [{ address: "1.1.1.1", family: 4 }];
    const privateResolver = async () => [{ address: "10.0.0.4", family: 4 }];

    await expect(assertPublicHttpsUrl("http://example.com", publicResolver)).rejects.toThrow();
    await expect(
      assertPublicHttpsUrl("https://user@example.com", publicResolver),
    ).rejects.toThrow();
    await expect(
      assertPublicHttpsUrl("https://example.com:8443", publicResolver),
    ).rejects.toThrow();
    await expect(assertPublicHttpsUrl("https://localhost", publicResolver)).rejects.toThrow();
    await expect(assertPublicHttpsUrl("https://example.com", privateResolver)).rejects.toThrow();
  });

  it("menolak host bila satu saja hasil DNS mengarah ke jaringan privat", async () => {
    const mixedResolver = async () => [
      { address: "1.1.1.1", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ];

    await expect(assertPublicHttpsUrl("https://example.com", mixedResolver)).rejects.toThrow(
      "blocked_url_address",
    );
  });

  it.each([
    "https://localhost",
    "https://api.localhost",
    "https://metadata.internal/path",
    "https://printer.local/path",
    "https://127.0.0.1/admin",
    "https://[::1]/admin",
  ])("menolak tujuan SSRF langsung %s tanpa melakukan DNS", async (value) => {
    const resolver = async () => {
      throw new Error("resolver_tidak_boleh_dipanggil");
    };

    await expect(assertPublicHttpsUrl(value, resolver)).rejects.not.toThrow(
      "resolver_tidak_boleh_dipanggil",
    );
  });

  it("menerima host HTTPS yang seluruh hasil DNS-nya publik", async () => {
    const resolver = async () => [
      { address: "1.1.1.1", family: 4 },
      { address: "2606:4700:4700::1111", family: 6 },
    ];

    await expect(
      assertPublicHttpsUrl("https://rdap.org/domain/example.com", resolver),
    ).resolves.toBeInstanceOf(URL);
  });
});
