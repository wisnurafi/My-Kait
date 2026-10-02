import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <div className="label mb-2">Legal</div>
        <h2 className="uppercase">Kebijakan Privasi</h2>
      </div>
      <div className="panel p-6 md:p-8 space-y-6 text-[15px] text-fg-secondary leading-relaxed">
        <section>
          <h3 className="text-fg mb-1.5">Data yang Dikumpulkan</h3>
          <p>Kami menyimpan: ID Discord, username, avatar, URL webhook (terenkripsi), template pesan, dan log pengiriman.</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Keamanan Webhook</h3>
          <p>URL webhook dienkripsi dengan AES-256-GCM di level aplikasi. Plaintext tidak pernah dikirim ke browser, di-log, atau masuk error tracker.</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Retensi Data</h3>
          <p>Log pengiriman otomatis dihapus setelah 30 hari. Anda dapat menghapus semua data kapan saja melalui Settings → Hapus Akun.</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Konten Pesan</h3>
          <p>Kami tidak membaca atau memoderasi isi pesan Anda. Konten hanya disimpan di log jika Anda mengaktifkan opsi "Simpan payload pesan".</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Cookies</h3>
          <p>Kami menggunakan cookie sesi (HttpOnly, Secure) untuk autentikasi. Tidak ada tracking third-party.</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Hak Anda</h3>
          <p>Anda dapat mengekspor dan menghapus semua data Anda. Hubungi kami jika ada pertanyaan.</p>
        </section>
      </div>
    </div>
  );
}
