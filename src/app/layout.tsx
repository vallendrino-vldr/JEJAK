import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jejak — Periksa sebelum percaya",
    template: "%s — Jejak",
  },
  description: "Pemeriksaan jejak digital dan workspace investigasi berbasis bukti.",
  applicationName: "Jejak",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
