import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JEJAK — Periksa sebelum percaya",
    short_name: "JEJAK",
    description: "Alat pemeriksaan jejak digital berbasis bukti.",
    start_url: "/beranda",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#061015",
    theme_color: "#061015",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
