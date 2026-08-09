import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { bacaSesiPengguna } from "@/lib/auth/session";
import "./shell.css";

/**
 * Layout untuk seluruh area yang butuh login.
 *
 * Karena berada di layout, App Shell tidak dimuat ulang saat pengguna berpindah
 * antar bagian utama — hanya isi workspace yang berganti.
 */
export default async function LayoutAplikasi({ children }: { children: ReactNode }) {
  const sesi = await bacaSesiPengguna();

  if (!sesi) {
    redirect("/masuk");
  }

  const namaTampilan = sesi.displayName?.split(" ")[0] ?? sesi.email.split("@")[0];

  return <AppShell sesi={{ namaTampilan, peran: sesi.roleCodes }}>{children}</AppShell>;
}
