import { setRequestLocale } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl uppercase">Syarat & Ketentuan</h1>
      <Card>
        <CardBody className="space-y-4 text-sm text-fg-secondary">
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Penggunaan</h2>
            <p>My Kait adalah alat untuk mengirim pesan Discord lewat webhook. Anda bertanggung jawab atas konten yang dikirim.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Larangan</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Dilarang mengirim spam atau pesan massal yang tidak diinginkan</li>
              <li>Dilarang mengirim konten yang melanggar ToS Discord</li>
              <li>Dilarang menyalahgunakan untuk harassment atau penipuan</li>
              <li>Dilarang mencoba mengakses webhook orang lain</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Tanggung Jawab</h2>
            <p>My Kait disediakan "apa adanya" tanpa jaminan. Kami tidak bertanggung jawab atas penyalahgunaan atau kerugian yang timbul.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-fg mb-1">Perubahan</h2>
            <p>Syarat ini dapat berubah sewaktu-waktu. Penggunaan berlanjut dianggap menyetujui perubahan.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
