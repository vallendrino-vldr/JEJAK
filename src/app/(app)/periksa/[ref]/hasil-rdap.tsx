import styles from "./page.module.css";

type JsonObject = Record<string, unknown>;

type RdapFacts = {
  handle?: string;
  statuses: string[];
  events: Array<{ action: string; date: string }>;
  nameservers: string[];
  registrar?: string;
  registrantName?: string;
  registrantOrganization?: string;
  delegationSigned?: boolean;
};

const LABEL_STATUS_RDAP: Record<string, string> = {
  active: "Aktif di registri",
  inactive: "Tidak aktif di registri",
  ok: "Normal menurut registri",
  clientDeleteProhibited: "Penghapusan dikunci registrar",
  clientRenewProhibited: "Perpanjangan dikunci registrar",
  clientTransferProhibited: "Transfer dikunci registrar",
  clientUpdateProhibited: "Perubahan dikunci registrar",
  serverDeleteProhibited: "Penghapusan dikunci registri",
  serverRenewProhibited: "Perpanjangan dikunci registri",
  serverTransferProhibited: "Transfer dikunci registri",
  serverUpdateProhibited: "Perubahan dikunci registri",
  pendingCreate: "Pendaftaran sedang diproses",
  pendingDelete: "Menunggu penghapusan",
  pendingRenew: "Menunggu perpanjangan",
  pendingRestore: "Menunggu pemulihan",
  pendingTransfer: "Menunggu transfer",
  redemptionPeriod: "Masuk masa pemulihan",
  autoRenewPeriod: "Masuk masa perpanjangan otomatis",
};

const LABEL_PERISTIWA_RDAP: Record<string, string> = {
  registration: "Tanggal pendaftaran tercatat",
  expiration: "Masa berlaku tercatat sampai",
  "last changed": "Catatan terakhir berubah",
  "last update of RDAP database": "Data RDAP terakhir diperbarui",
  deletion: "Tanggal penghapusan tercatat",
  reinstantiation: "Tanggal pemulihan tercatat",
  transfer: "Tanggal transfer tercatat",
};

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

function sebagaiObjek(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function teksAman(value: unknown, batas = 320): string | undefined {
  if (typeof value !== "string") return undefined;
  const hasil = value.trim();
  return hasil ? hasil.slice(0, batas) : undefined;
}

function daftarTeks(value: unknown, batasItem = 16): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .slice(0, batasItem)
        .map((item) => teksAman(item, 320))
        .filter((item): item is string => Boolean(item)),
    ),
  ];
}

function parseRdapFacts(metadata: unknown): RdapFacts | null {
  const metadataObject = sebagaiObjek(metadata);
  const result = sebagaiObjek(metadataObject?.result);
  if (!result) return null;

  const events = Array.isArray(result.events)
    ? result.events
        .slice(0, 20)
        .map(sebagaiObjek)
        .filter((item): item is JsonObject => item !== null)
        .map((item) => ({
          action: teksAman(item.action, 100),
          date: teksAman(item.date, 100),
        }))
        .filter((item): item is { action: string; date: string } =>
          Boolean(item.action && item.date),
        )
    : [];

  const delegationSigned =
    typeof result.delegationSigned === "boolean" ? result.delegationSigned : undefined;

  const facts: RdapFacts = {
    handle: teksAman(result.handle),
    statuses: daftarTeks(result.statuses),
    events,
    nameservers: daftarTeks(result.nameservers),
    registrar: teksAman(result.registrar),
    registrantName: teksAman(result.registrantName),
    registrantOrganization: teksAman(result.registrantOrganization),
    delegationSigned,
  };

  const adaIsi = Boolean(
    facts.handle ||
    facts.statuses.length ||
    facts.events.length ||
    facts.nameservers.length ||
    facts.registrar ||
    facts.registrantName ||
    facts.registrantOrganization ||
    facts.delegationSigned !== undefined,
  );

  return adaIsi ? facts : null;
}

function tanggalRdap(value: string): string | null {
  const tanggal = new Date(value);
  return Number.isNaN(tanggal.getTime()) ? null : formatTanggal.format(tanggal);
}

function labelStatusRdap(status: string) {
  return LABEL_STATUS_RDAP[status] ?? `Kode RDAP: ${status}`;
}

function labelPeristiwaRdap(action: string) {
  return LABEL_PERISTIWA_RDAP[action.toLowerCase()] ?? `Peristiwa RDAP: ${action}`;
}

export function HasilRdap({ metadata }: { metadata: unknown }) {
  const facts = parseRdapFacts(metadata);

  if (!facts) {
    return (
      <p className={styles.kosongDetail}>
        Pemeriksaannya selesai, tapi rincian catatan RDAP belum tersedia di tampilan ini. JEJAK
        nggak akan mengisi bagian kosong dengan tebakan.
      </p>
    );
  }

  const pihakTercatat = [facts.registrantName, facts.registrantOrganization]
    .filter((item): item is string => Boolean(item))
    .filter((item, index, semua) => semua.indexOf(item) === index);

  const events = facts.events
    .map((event) => ({ ...event, dateLabel: tanggalRdap(event.date) }))
    .filter((event): event is typeof event & { dateLabel: string } => Boolean(event.dateLabel));

  return (
    <div className={styles.rdap}>
      <dl className={styles.faktaGrid}>
        {facts.registrar ? (
          <div className={styles.fakta}>
            <dt>Registrar</dt>
            <dd>{facts.registrar}</dd>
          </div>
        ) : null}

        {facts.handle ? (
          <div className={styles.fakta}>
            <dt>ID catatan RDAP</dt>
            <dd>{facts.handle}</dd>
          </div>
        ) : null}

        {facts.delegationSigned !== undefined ? (
          <div className={styles.fakta}>
            <dt>DNSSEC menurut RDAP</dt>
            <dd>{facts.delegationSigned ? "Tercatat aktif" : "Nggak tercatat aktif"}</dd>
          </div>
        ) : null}

        {pihakTercatat.length ? (
          <div className={styles.fakta}>
            <dt>Nama publik di catatan</dt>
            <dd>{pihakTercatat.join(" · ")}</dd>
          </div>
        ) : null}
      </dl>

      {facts.statuses.length ? (
        <section className={styles.kelompokFakta} aria-labelledby="status-domain-judul">
          <h3 id="status-domain-judul">Status domain di registri</h3>
          <ul className={styles.tagList}>
            {facts.statuses.map((status) => (
              <li key={status}>{labelStatusRdap(status)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {events.length ? (
        <section className={styles.kelompokFakta} aria-labelledby="tanggal-domain-judul">
          <h3 id="tanggal-domain-judul">Tanggal yang dicatat registri</h3>
          <dl className={styles.tanggalList}>
            {events.map((event) => (
              <div key={`${event.action}-${event.date}`}>
                <dt>{labelPeristiwaRdap(event.action)}</dt>
                <dd>{event.dateLabel}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {facts.nameservers.length ? (
        <section className={styles.kelompokFakta} aria-labelledby="nameserver-domain-judul">
          <h3 id="nameserver-domain-judul">Nameserver yang tercatat</h3>
          <ul className={styles.nameserverList}>
            {facts.nameservers.map((nameserver) => (
              <li key={nameserver}>{nameserver}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <aside className={styles.batasMakna}>
        Catatan ini menjelaskan pendaftaran domain saat sumber diperiksa. Ini bukan bukti siapa
        pemilik sebenarnya, bukan umur sebuah bisnis, dan bukan jaminan bahwa domain aman.
      </aside>
    </div>
  );
}
