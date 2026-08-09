import type { Metadata } from "next";
import { FormBuatKasus } from "@/components/kasus/form-kasus";

export const metadata: Metadata = { title: "Buat Kasus" };

export default function BuatKasusPage() {
  return (
    <div className="ruang ruang-sempit">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Kasus baru</p>
        <h1 className="hero-judul">Apa yang mau lo telusuri?</h1>
      </section>

      <FormBuatKasus />
    </div>
  );
}
