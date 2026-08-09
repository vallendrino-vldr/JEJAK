/**
 * Lapisan latar ambient.
 *
 * Dua pita cahaya yang hanyut sangat lambat plus butiran halus, seluruhnya CSS.
 * Tidak ada canvas maupun WebGL, jadi tidak ada perangkat yang ditinggalkan dan
 * tidak ada beban saat halaman diam. Reduced motion mematikan pergerakannya;
 * kedalaman dan butirannya tetap ada, sehingga halaman tidak berubah jadi datar.
 */
export function Aurora() {
  return (
    <>
      <div className="aurora" aria-hidden="true" />
      <div className="aurora-butir" aria-hidden="true" />
    </>
  );
}
