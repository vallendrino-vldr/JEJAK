export const publicBuildInfo = Object.freeze({
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
  buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "development",
});
