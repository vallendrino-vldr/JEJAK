/**
 * Wordmark JEJAK.
 *
 * Merek selalu tampil sebagai `JEJAK` — huruf besar, jarak huruf terkendali,
 * dan huruf `J` diperlakukan sebagai tanda tersendiri. Dibangun dari teks dan
 * SVG, jadi tetap tajam di ukuran mana pun dan tetap terbaca pembaca layar.
 *
 * Kalau kata "jejak" muncul di dalam kalimat biasa, tulis apa adanya —
 * komponen ini hanya untuk merek.
 */
type UkuranMerek = "kecil" | "sedang" | "besar";

export function Wordmark({
  ukuran = "sedang",
  className,
}: {
  ukuran?: UkuranMerek;
  className?: string;
}) {
  return (
    <span className={`wordmark wordmark-${ukuran}${className ? ` ${className}` : ""}`}>
      <GlifJ className="wordmark-glif" />
      <span className="wordmark-teks" aria-hidden="true">
        <span className="wordmark-j">J</span>EJAK
      </span>
      <span className="hanya-pembaca-layar">JEJAK</span>
    </span>
  );
}

/** Glif `J` — pupil yang menekuk jadi kail huruf J. */
export function GlifJ({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="glif-j-tepi" x1="4" y1="2" x2="28" y2="30">
          <stop offset="0%" stopColor="var(--brand-cyan)" />
          <stop offset="100%" stopColor="var(--aurora-mint)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13.2" stroke="url(#glif-j-tepi)" strokeWidth="1.4" opacity="0.5" />
      <circle cx="16" cy="16" r="7.4" stroke="url(#glif-j-tepi)" strokeWidth="1.5" opacity="0.85" />
      <path
        d="M19.6 11.4v6.9a4.1 4.1 0 0 1-7 2.9"
        stroke="var(--ice-highlight)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="1.7" fill="var(--brand-cyan)" />
    </svg>
  );
}
