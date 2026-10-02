import { setRequestLocale } from "next-intl/server";

export default async function TermsPage({
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
        <h2 className="uppercase">Syarat &amp; Ketentuan</h2>
      </div>
      <div className="panel p-6 md:p-8 space-y-6 text-[15px] text-fg-secondary leading-relaxed">
        <section>
          <h3 className="text-fg mb-1.5">Penggunaan</h3>
          <p>My Kait adalah alat untuk mengirim pesan Discord lewat webhook. Anda bertanggung jawab atas konten yang dikirim.</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Larangan</h3>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Dilarang mengirim spam atau pesan massal yang tidak diinginkan</li>
            <li>Dilarang mengirim konten yang melanggar ToS Discord</li>
            <li>Dilarang menyalahgunakan untuk harassment atau penipuan</li>
            <li>Dilarang mencoba mengakses webhook orang lain</li>
          </ul>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Tanggung Jawab</h3>
          <p>My Kait disediakan "apa adanya" tanpa jaminan. Kami tidak bertanggung jawab atas penyalahgunaan atau kerugian yang timbul.</p>
        </section>
        <section>
          <h3 className="text-fg mb-1.5">Perubahan</h3>
          <p>Syarat ini dapat berubah sewaktu-waktu. Penggunaan berlanjut dianggap menyetujui perubahan.</p>
        </section>
      </div>
    </div>
  );
}
