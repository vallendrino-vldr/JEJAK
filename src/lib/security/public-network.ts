import { BlockList, isIP } from "node:net";
import { lookup } from "node:dns/promises";

type ResolvedAddress = { address: string; family: number };
export type HostResolver = (hostname: string) => Promise<ResolvedAddress[]>;

function ipv4ToInt(address: string): number | null {
  const parts = address.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
}

function inIpv4Cidr(address: number, base: string, prefix: number): boolean {
  const baseValue = ipv4ToInt(base);
  if (baseValue === null) return false;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (address & mask) === (baseValue & mask);
}

const BLOCKED_IPV4: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const GLOBAL_IPV6 = new BlockList();
GLOBAL_IPV6.addSubnet("2000::", 3, "ipv6");

const BLOCKED_IPV6 = new BlockList();
BLOCKED_IPV6.addSubnet("2001::", 32, "ipv6");
BLOCKED_IPV6.addSubnet("2001:2::", 48, "ipv6");
BLOCKED_IPV6.addSubnet("2001:10::", 28, "ipv6");
BLOCKED_IPV6.addSubnet("2001:20::", 28, "ipv6");
BLOCKED_IPV6.addSubnet("2001:db8::", 32, "ipv6");
BLOCKED_IPV6.addSubnet("2002::", 16, "ipv6");
BLOCKED_IPV6.addSubnet("3fff::", 20, "ipv6");

export function isPublicIpAddress(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  const family = isIP(normalized);

  if (family === 4) {
    const value = ipv4ToInt(normalized);
    return (
      value !== null && !BLOCKED_IPV4.some(([base, prefix]) => inIpv4Cidr(value, base, prefix))
    );
  }

  if (family === 6) {
    // Hanya global-unicast langsung. Ini otomatis menolak loopback, private,
    // link-local, multicast, IPv4-mapped, dan alamat translasi yang bisa
    // menyamarkan tujuan internal dalam bentuk IPv6 panjang.
    return GLOBAL_IPV6.check(normalized, "ipv6") && !BLOCKED_IPV6.check(normalized, "ipv6");
  }

  return false;
}

async function resolveHost(hostname: string): Promise<ResolvedAddress[]> {
  return lookup(hostname, { all: true, verbatim: true });
}

/** Menolak URL non-HTTPS, credential/port aneh, dan tujuan jaringan non-publik. */
export async function assertPublicHttpsUrl(
  value: string | URL,
  resolver: HostResolver = resolveHost,
): Promise<URL> {
  const url = value instanceof URL ? value : new URL(value);

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new Error("blocked_url_scheme");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("blocked_url_host");
  }

  if (isIP(hostname)) {
    if (!isPublicIpAddress(hostname)) throw new Error("blocked_url_address");
    return url;
  }

  const addresses = await resolver(hostname);
  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIpAddress(address))) {
    throw new Error("blocked_url_address");
  }

  return url;
}
