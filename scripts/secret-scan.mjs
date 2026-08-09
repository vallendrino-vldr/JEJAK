import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const forbiddenNames = [
  /^JEJAK\.md$/i,
  /(^|\/)\.env($|\.)/i,
  /(^|\/)(credentials?|secrets?)[^/]*\.json$/i,
  /\.(pem|p12|pfx)$/i,
];

const allowedSensitiveNames = new Set([".env.example"]);

const secretRules = [
  ["google-api-key", /AIza[0-9A-Za-z_-]{30,}/g],
  ["groq-api-key", /gsk_[0-9A-Za-z_-]{20,}/g],
  ["github-token", /gh[opsu]_[0-9A-Za-z]{20,}/g],
  ["supabase-secret", /sb_secret_[0-9A-Za-z_-]{20,}/g],
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  // JWT bertanda tangan: legacy service role / access token Supabase berbentuk ini.
  ["jwt-token", /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  [
    "db-connection-string",
    /\bpostgres(?:ql)?:\/\/[^\s:@/]+:(?!<|\[|\$|your-|change-me|password@)[^\s:@/]{6,}@/gi,
  ],
  [
    "filled-sensitive-env",
    /^(?:[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|PRIVATE_KEY|API_KEY|SERVICE_ROLE|CREDENTIAL)[A-Z0-9_]*)[ \t]*=[ \t]*(?!$|<|your-|change-me)([^\s#]{8,})/gm,
  ],
];

// Tanpa argumen: pindai seluruh file yang dilihat Git. Dengan argumen: pindai path tersebut saja,
// supaya test bisa memakai fixture di luar repo tanpa memicu scanner-nya sendiri.
const explicitPaths = process.argv.slice(2);

const candidates = (
  explicitPaths.length > 0
    ? explicitPaths
    : execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
        encoding: "utf8",
      })
        .split("\0")
        .filter(Boolean)
).map((path) => path.replaceAll("\\", "/"));

const findings = [];

for (const path of candidates) {
  if (!allowedSensitiveNames.has(path) && forbiddenNames.some((pattern) => pattern.test(path))) {
    findings.push({ path, rule: "forbidden-filename" });
    continue;
  }

  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    continue;
  }

  if (content.includes("\0")) {
    continue;
  }

  for (const [rule, pattern] of secretRules) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      findings.push({ path, rule });
    }
  }
}

if (findings.length > 0) {
  console.error("Secret scan gagal. Isi sensitif tidak ditampilkan:");
  for (const finding of findings) {
    console.error(`- ${finding.path} [${finding.rule}]`);
  }
  process.exit(1);
}

console.log(`Secret scan bersih untuk ${candidates.length} file kandidat.`);
