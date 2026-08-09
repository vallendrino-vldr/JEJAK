/**
 * Mata Jejak — penjaga, bukan ikon mata.
 *
 * Bentuknya terinspirasi pupil tarsius: iris besar yang mendominasi, cincin
 * konsentris, dan sedikit kilau dingin. Geometris dan abstrak, bukan kartun.
 * Idle response-nya hidup lewat CSS supaya bisa dimatikan reduced motion tanpa
 * mengubah komponennya.
 */
export function MataJejak({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`mata-glif${className ? ` ${className}` : ""}`}
    >
      <defs>
        <radialGradient id="mata-iris" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="var(--ice-highlight)" />
          <stop offset="45%" stopColor="var(--brand-cyan)" />
          <stop offset="100%" stopColor="#0A3D52" />
        </radialGradient>
        <radialGradient id="mata-halo" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="var(--brand-cyan)" stopOpacity="0.32" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="24" r="22" fill="url(#mata-halo)" className="mata-halo" />

      {/* Kelopak: dua busur bertemu, memberi bentuk mata tanpa menggambar wajah. */}
      <path
        d="M4.5 24C9.5 15.2 16.3 10.8 24 10.8S38.5 15.2 43.5 24C38.5 32.8 31.7 37.2 24 37.2S9.5 32.8 4.5 24Z"
        stroke="var(--brand-cyan)"
        strokeWidth="1.3"
        opacity="0.55"
      />

      <circle cx="24" cy="24" r="10.4" fill="url(#mata-iris)" className="mata-iris" />
      <circle
        cx="24"
        cy="24"
        r="10.4"
        stroke="var(--ice-highlight)"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Serat iris — geometris, bukan tekstur organik. */}
      <g stroke="var(--ice-highlight)" strokeWidth="0.6" opacity="0.35">
        <path d="M24 13.6v3.2M24 31.2v3.2M13.6 24h3.2M31.2 24h3.2" />
        <path d="m16.7 16.7 2.2 2.2M29.1 29.1l2.2 2.2M31.3 16.7l-2.2 2.2M18.9 29.1l-2.2 2.2" />
      </g>

      <circle cx="24" cy="24" r="4.3" fill="#03161D" />
      <circle cx="21.9" cy="21.6" r="1.5" fill="var(--ice-highlight)" opacity="0.9" />
    </svg>
  );
}
