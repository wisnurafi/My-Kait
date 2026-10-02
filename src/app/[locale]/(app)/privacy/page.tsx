import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl uppercase">Kebijakan Privasi</h1>
      <Card>
        <CardBody className="space-y-4 text-sm text-fg-secondary">
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Data yang Dikumpulkan</h2>
            <p>Kami menyimpan: ID Discord, username, avatar, URL webhook (terenkripsi), template pesan, dan log pengiriman.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Keamanan Webhook</h2>
            <p>URL webhook dienkripsi dengan AES-256-GCM di level aplikasi. Plaintext tidak pernah dikirim ke browser, di-log, atau masuk error tracker.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Retensi Data</h2>
            <p>Log pengiriman otomatis dihapus setelah 30 hari. Anda dapat menghapus semua data kapan saja melalui Settings → Hapus Akun.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Konten Pesan</h2>
            <p>Kami tidak membaca atau memoderasi isi pesan Anda. Konten hanya disimpan di log jika Anda mengaktifkan opsi "Simpan payload pesan".</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Cookies</h2>
            <p>Kami menggunakan cookie sesi (HttpOnly, Secure) untuk autentikasi. Tidak ada tracking third-party.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Hak Anda</h2>
            <p>Anda dapat mengekspor dan menghapus semua data Anda. Hubungi kami jika ada pertanyaan.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
