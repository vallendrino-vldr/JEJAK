import { describe, expect, it } from "vitest";
import { publicBuildInfo } from "./version";

describe("public build info", () => {
  it("selalu punya versi dan build id yang bisa dibaca", () => {
    expect(publicBuildInfo.version.length).toBeGreaterThan(0);
    expect(publicBuildInfo.buildId.length).toBeGreaterThan(0);
  });
});
