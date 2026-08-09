/**
 * Ikon Jejak — geometris, satu bahasa garis, tanpa emoji.
 *
 * Semua memakai `currentColor` supaya warnanya ditentukan konteks, dan
 * `aria-hidden` karena label teks selalu mendampinginya.
 */
type PropsIkon = { className?: string };

const dasar = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function IkonBeranda({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M4 11.2 12 4.5l8 6.7" />
      <path d="M6.4 10v9h11.2v-9" />
      <path d="M10 19v-4.6h4V19" />
    </svg>
  );
}

export function IkonPeriksa({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <circle cx="11" cy="11" r="6.2" />
      <circle cx="11" cy="11" r="2.1" />
      <path d="m15.6 15.6 4 4" />
    </svg>
  );
}

export function IkonKasus({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M4.5 7.6h15v11.9h-15z" />
      <path d="M9.2 7.6V5.9a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4v1.7" />
      <path d="M4.5 12.4h15" />
    </svg>
  );
}

export function IkonJejakGue({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <circle cx="12" cy="8.4" r="3.5" />
      <path d="M5.4 19.4c.8-3.4 3.4-5.2 6.6-5.2s5.8 1.8 6.6 5.2" />
    </svg>
  );
}

export function IkonDompet({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M4.6 8.2h14.8v10.4H4.6z" />
      <path d="M4.6 8.2 15 5.4v2.8" />
      <circle cx="16.2" cy="13.4" r="1.15" />
    </svg>
  );
}

export function IkonKabar({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M6.6 10.6a5.4 5.4 0 0 1 10.8 0v4l1.5 2.6H5.1l1.5-2.6z" />
      <path d="M10.2 20.1a2 2 0 0 0 3.6 0" />
    </svg>
  );
}

/** Mata Jejak — pupil dan sidik jari, membentuk huruf J. */
export function IkonMataJejak({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M2.9 12S6.5 6.4 12 6.4 21.1 12 21.1 12 17.5 17.6 12 17.6 2.9 12 2.9 12Z" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M13.4 10.7v2.1a1.5 1.5 0 0 1-2.6 1" />
    </svg>
  );
}

export function IkonKembali({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M14.6 5.8 8.4 12l6.2 6.2" />
    </svg>
  );
}

export function IkonSegarkan({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M19 12a7 7 0 1 1-2.2-5.1" />
      <path d="M19.4 4.9v3.9h-3.9" />
    </svg>
  );
}

export function IkonTutup({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export function IkonRuangKendali({ className }: PropsIkon) {
  return (
    <svg {...dasar} className={className}>
      <path d="M5 7.4h14M5 12h14M5 16.6h14" />
      <circle cx="9.3" cy="7.4" r="1.6" />
      <circle cx="14.7" cy="16.6" r="1.6" />
    </svg>
  );
}

/** Tanda kata Jejak. Sedikit lebih berkarakter daripada ikon UI. */
export function TandaJejak({ className }: PropsIkon) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13.7 10.2v3.1a2.1 2.1 0 0 1-3.6 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
