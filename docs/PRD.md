# PRD — Webhook Studio (working title)

**Versi:** 1.2 (draft) · **Tanggal:** 1 Oktober 2026 **Perubahan v1.1:** fitur penjadwalan pesan dibatalkan dan dihapus dari scope. **Perubahan v1.2:** tambah Uji Koneksi (Ping), perluasan Riwayat & Status Pengiriman, Filter & Pencarian, multi-bahasa ID/EN; tanpa kuota per user; keputusan open questions dimasukkan. **Stack:** Next.js (App Router) · Vercel · Postgres (Neon/Supabase) · Login Discord

---

## 1. Ringkasan

Webhook Studio adalah website untuk menyusun dan mengirim pesan Discord lewat **webhook**, tanpa perlu bot yang di-invite ke server. User login pakai akun Discord, menyusun pesan di editor visual dengan **live preview** ala Discord, lalu mengirimnya ke webhook mana pun yang mereka punya, baik dengan menyimpan webhook (dengan nama custom) maupun input manual.

Website ini **bukan bot**. Website hanya jadi tempat user mengatur pesan. Tujuan tujuan webhook sepenuhnya milik user.

### Tujuan

1. Editor pesan paling lengkap dan nyaman untuk webhook: pesan biasa, embed, atau keduanya.
2. Login satu klik via Discord, tanpa sign up manual.
3. Fitur produktivitas: template, edit/hapus pesan terkirim, share template, dan logs.
4. UI modern, unik, penuh animasi, responsive di semua device.
5. Security serius, terutama untuk penyimpanan URL webhook.

### Bukan tujuan (v1)

- Bot Discord / slash command / interaksi tombol (webhook biasa tidak bisa menerima interaksi).
- Upload file attachment langsung (gambar lewat URL dulu, lihat Roadmap).
- Penjadwalan pesan (dibatalkan).
- Monetisasi / billing.

---

## 2. Target User & Use Case

| Persona | Kebutuhan |
| --- | --- |
| Admin / mod server | Kirim pengumuman, rules, dan info dengan tampilan rapi tanpa bot |
| Komunitas / event organizer | Pakai ulang template pengumuman |
| Developer / content creator | Prototyping embed, kirim notifikasi manual ke channel |
| Tim kecil | Berbagi template pesan yang sama |

---

## 3. Fitur & Requirements

Prioritas: **P0** wajib MVP · **P1** target v1 · **P2** setelah rilis.

### 3.1 Autentikasi (P0)

- Login **Discord OAuth2** (scope minimal: `identify`; `email` tidak diminta kecuali dibutuhkan).
- Profil dasar tampil di app: username, avatar.
- Logout, dan **hapus akun** (menghapus semua data user: webhook, template, logs).
- Sesi aman (lihat bagian Security).

### 3.2 Manajemen Webhook (P0)

- Tambah webhook: input URL + **nama custom** (contoh: "Pengumuman Server A").
- Daftar webhook tersimpan dengan **badge status** (Aktif / Tidak valid / Rate limited / Belum dicek); edit nama, hapus, uji koneksi, dan **cari berdasarkan nama**.
- Saat kirim pesan, user bisa **pilih webhook tersimpan** atau **tempel URL manual** (tidak disimpan).
- Validasi URL: harus format webhook Discord resmi, dan dicek valid via request `GET` ke webhook.
- Setelah disimpan, URL **tidak pernah dikirim balik utuh ke browser**. UI hanya menampilkan versi masked (misalnya `…/webhooks/1234…/••••abcd`).
- Opsional: tampilkan nama channel/guild yang dikembalikan Discord saat validasi.

#### 3.2.1 Uji Koneksi / Ping Webhook (P0)

Terinspirasi fitur "ping" pada webhook GitHub: user bisa memastikan webhook hidup **sebelum** dipakai kirim pesan.

- Tombol **Ping** di tiap webhook tersimpan, dan di form tambah webhook (sebelum disimpan).
- Ping bersifat **senyap**: server memanggil `GET` ke URL webhook, sehingga **tidak ada pesan yang muncul di channel**.
- Hasil ditampilkan jelas: status (Aktif / Tidak valid / Rate limited / Error jaringan), HTTP status code, **latency (ms)**, nama webhook, channel dan guild dari respons Discord, serta waktu pengecekan.
- Pesan error ramah user, misalnya 404 = "Webhook sudah dihapus atau URL salah", 401 = "Token tidak valid", 429 = "Terkena rate limit, coba lagi dalam N detik".
- Tombol terpisah **"Kirim pesan tes"**: mengirim pesan tes singkat yang **terlihat** di channel (dengan konfirmasi dulu), berguna untuk mengecek izin dan tampilan.
- **Riwayat ping** per webhook (20 pengecekan terakhir) berisi waktu, status, HTTP code, dan latency, mirip daftar "recent deliveries" di GitHub. Ada tombol "Cek ulang semua webhook".
- Status webhook otomatis diperbarui: jika pengiriman gagal dengan 404/401, webhook ditandai **Tidak valid** dan user diberi tahu.
- Ping dibatasi frekuensinya (rate limit) agar tidak membebani Discord.

### 3.3 Message Editor (P0)

Tiga mode pesan:

1. **Normal message**: hanya teks.
2. **Embed message**: hanya embed.
3. **Normal + Embed**: keduanya sekaligus.

**Field level pesan**

- Content (maks 2000 karakter) dengan dukungan markdown Discord.
- Override **username** dan **avatar URL** webhook per pesan.
- Opsi TTS (opsional), **thread_id** (kirim ke thread tertentu), suppress mentions / allowed mentions.

**Embed (hingga 10 embed per pesan)**

- Title + URL title
- Description (markdown)
- Warna (color picker + hex)
- **Author**: nama, URL, **icon image**
- **Thumbnail** (image kecil)
- **Image** (embed image besar)
- **Fields**: nama, value, toggle inline (maks 25)
- **Footer**: teks + **icon image**
- **Timestamp otomatis**: toggle "pakai waktu kirim" (diisi server saat pengiriman) dan opsi pilih waktu manual

**Validasi real-time sesuai batas Discord**

- Title 256, description 4096, field name 256, field value 1024, footer text 2048, author name 256.
- Total karakter semua embed maks 6000; maks 10 embed; maks 25 field per embed.
- Counter karakter per field, error inline, tombol kirim dinonaktifkan jika melewati batas.

**Live preview**

- Render pesan seperti Discord (mode dark dan light), termasuk markdown, embed, warna sidebar, field inline, dan mention.
- Mode import/export **JSON payload** (paste JSON embed dari tempat lain, atau salin hasilnya).
- Undo/redo dan **autosave draft** lokal.

### 3.4 Pengiriman (P0)

- Kirim via server (Next.js Route Handler), **bukan langsung dari browser**, agar URL webhook tidak bocor ke client.
- Kirim dengan `?wait=true` supaya Discord mengembalikan **message ID**, yang disimpan untuk fitur edit/hapus.
- Tangani rate limit Discord (429 dan `retry_after`) dengan pesan error yang jelas ke user.
- Rate limit internal per user (anti-abuse).

### 3.5 Edit & Hapus Pesan Terkirim (P1)

- Dari halaman Logs, user bisa **edit** (PATCH) atau **hapus** (DELETE) pesan yang dikirim lewat Webhook Studio.
- Hanya berlaku untuk pesan yang ID-nya tersimpan, dan webhook-nya harus masih valid.
- Editor terbuka dengan payload lama sebagai titik awal.

### 3.6 Template Library (P1)

- Simpan pesan sebagai template (nama, deskripsi singkat, tag).
- Load template ke editor, duplikasi, rename, hapus, cari, dan filter berdasarkan tag.
- Template **tidak** menyimpan URL webhook.
- Versi sederhana: tiap simpan menimpa; riwayat versi masuk P2.

### 3.7 Share Template via Link (P1)

- Generate link publik read-only: `/t/<slug-acak>`.
- Halaman publik: preview pesan + tombol **"Pakai template ini"** (login dulu, lalu di-import sebagai salinan milik user).
- Owner bisa **cabut link** kapan saja (revoke) dan melihat jumlah import.
- Slug acak dan tidak berurutan, sehingga tidak bisa ditebak.
- Data sensitif tidak pernah ikut terbagi (webhook, ID user internal).

### 3.8 Riwayat & Status Pengiriman (P0)

Setiap pengiriman tercatat dan bisa dilihat di halaman **Logs**.

**Daftar riwayat**

- Kolom: waktu, nama webhook (bukan URL), mode pesan (normal / embed / keduanya), **status**, HTTP code, latency, dan ringkasan isi pesan.
- **Status pengiriman:** `Terkirim`, `Gagal`, `Rate limited` (menunggu/retry), `Diedit`, `Dihapus`. Setiap status punya warna dan ikon yang jelas.
- Kartu ringkasan di atas daftar: jumlah terkirim, gagal, dan tingkat sukses pada rentang waktu terpilih.

**Detail pengiriman** (panel samping/drawer)

- Snapshot payload (preview ala Discord + JSON), respons Discord, message ID, pesan error, dan durasi.
- Aksi: **Duplikasi ke editor**, **Kirim ulang** (untuk yang gagal), **Edit**, **Hapus** (lihat 3.5), dan **Simpan sebagai template**.
- Payload log bisa dimatikan user bila tidak ingin isi pesan disimpan (metadata status tetap tercatat).

**Retensi**

- Default **30 hari**, dibersihkan otomatis oleh job harian. User juga bisa menghapus log manual.

### 3.8.1 Filter & Pencarian (P0)

Berlaku di Logs, dan versi yang lebih sederhana di Webhooks dan Templates.

- **Logs:** filter berdasarkan status, webhook, mode pesan, rentang tanggal (preset: hari ini, 7 hari, 30 hari, kustom), dan sumber (kirim biasa / edit / hapus). **Pencarian teks** pada isi pesan (content, title, description, field), nama webhook, dan message ID.
- **Templates:** pencarian nama/deskripsi dan filter berdasarkan tag.
- **Webhooks:** pencarian nama dan filter berdasarkan status (Aktif / Tidak valid).
- Kombinasi filter bisa dipakai bersamaan, ada chip filter aktif dan tombol "Reset".
- Urutan (terbaru/terlama), pagination atau infinite scroll, dan **filter tersimpan di URL** agar bisa di-bookmark atau dibagikan sendiri.
- Hasil terasa instan: debounce pada input pencarian dan skeleton saat memuat.
- Export hasil filter ke **CSV/JSON** (P1).

### 3.9 Multi-bahasa ID / EN (P1)

- Dua bahasa: **Bahasa Indonesia** dan **English**.
- Bahasa awal dideteksi dari browser, bisa diganti lewat switcher di navbar, dan pilihan tersimpan per user.
- Seluruh teks UI lewat kamus terjemahan (tidak ada teks hardcode di komponen), termasuk pesan error dan validasi, serta format tanggal/waktu sesuai locale.
- Implementasi: **next-intl** dengan routing locale (`/id`, `/en`).
- Konten pesan yang dibuat user tidak diterjemahkan.

### 3.10 Fitur Pendukung (P2)

- Riwayat versi template
- Folder / workspace untuk template
- Upload gambar (Vercel Blob) untuk image/icon
- Kirim ke beberapa webhook sekaligus (multi-target)
- Variabel dalam template (misalnya `{tanggal}`)
- Dashboard statistik sederhana
- Kolaborasi tim

---

## 4. UI / UX

### 4.1 Arah desain: "Sticker Board"

Karakter visual: **playful / bold**, berwarna berani, berbentuk organik, dan terasa seperti **sticker**. Konsep intinya: pesan, embed, dan webhook diperlakukan seperti sticker yang ditempel dan digeser di sebuah papan.

**Bahasa visual**

- Outline tebal (2 sampai 3px) dan **hard shadow offset** (tanpa blur) pada kartu dan tombol.
- Bentuk organik: blob, sudut membulat tidak seragam, dan bentuk "die-cut" dengan border putih/krem tebal seperti sticker asli.
- Elemen sedikit **miring** (rotasi 1 sampai 3 derajat) dan bertumpuk agar terasa hidup, tapi area editor tetap rapi dan lurus.
- Tekstur grain halus pada background untuk kesan kertas/vinyl.
- Motif brand: bentuk **kait (hook)** sebagai maskot atau logo yang bisa berubah ekspresi (loading, sukses, error).
- Hindari pola klise AI: gradient ungu-biru default, glassmorphism berlebihan, kartu seragam dengan ikon generik. Hindari juga warna blurple Discord sebagai warna utama agar produk punya identitas sendiri.

**Tipografi (draft)**

- Display: font grotesk berkarakter dan variabel (kandidat: Bricolage Grotesque) untuk judul dan angka besar.
- Body UI: font sans yang bersih dan terbaca (kandidat: Geist atau DM Sans).
- Payload/JSON/kode: font mono (kandidat: JetBrains Mono).
- Dimuat lewat `next/font` agar tidak ada layout shift.

**Warna (draft, dikunci saat fase desain)**

- Satu warna utama yang berani (misalnya oranye tangerine), dua sampai tiga warna pendukung (pink, lime, biru kobalt), dan netral hangat.
- Semua warna didefinisikan sebagai **design token** dengan varian terang dan gelap, bukan sekadar inversi.
- Kontras tetap memenuhi WCAG AA di kedua tema.

**Tema**

- Light dan dark **setara**, default mengikuti sistem user (`prefers-color-scheme`).
- Ada toggle manual tiga pilihan: Sistem / Terang / Gelap, tersimpan per user.
- Preview pesan punya mode tampilan Discord sendiri (dark/light Discord) yang independen dari tema website.

### 4.2 Animasi: heavy tapi terkontrol

Animasi menjadi bagian dari identitas produk. Cakupan:

- **Transisi antar halaman** (shared element, wipe berbentuk blob, atau sticker yang "ditempel").
- **Efek scroll** di landing page: parallax, elemen bergerak mengikuti scroll, teks yang terungkap bertahap, marquee, dan smooth scroll (Lenis).
- **Micro-interaction di mana-mana**: hover wiggle, tombol yang "ditekan" ke shadow-nya, toggle dengan pegas, toast berbentuk sticker.
- **Editor**: reorder embed dan field dengan drag yang punya tilt dan efek pegas, expand/collapse halus, preview yang ter-update dengan transisi.
- **Momen sukses**: konfeti atau sticker burst saat pesan terkirim, maskot bereaksi pada sukses dan error.
- **Cursor** custom dan efek mengikuti kursor (hanya desktop dengan pointer halus).

Library: **Motion (Framer Motion)** sebagai utama, **Lenis** untuk smooth scroll di landing, CSS untuk efek ringan.

**Pagar pengaman (wajib, karena animasi heavy)**

- **Zona tenang:** saat user mengetik atau mengisi form di editor, efek besar dimatikan, sehingga animasi tidak mengganggu fokus dan tidak membuat input terasa lambat.
- Hormati **`prefers-reduced-motion`**: semua efek besar diganti versi minimal.
- Animasi hanya pada `transform` dan `opacity`, dengan target 60 fps di HP kelas menengah.
- Efek berat (parallax, cursor, konfeti) dimuat **lazy** dan dimatikan otomatis di perangkat lemah atau mode hemat daya.
- Tidak ada animasi yang memblokir aksi: user tidak pernah menunggu animasi selesai untuk menekan tombol.

### 4.3 Responsive

- **Desktop:** editor dan live preview side-by-side, sidebar navigasi.
- **Tablet:** editor dan preview dengan panel yang bisa dilipat.
- **Mobile:** tab Editor / Preview, navigasi bawah, form di bottom sheet, target sentuh minimal 44px.
- Diuji di breakpoint 360, 390, 768, 1024, 1440+.

### 4.4 Halaman utama

1. Landing + tombol "Login dengan Discord"
2. Dashboard (ringkasan aktivitas, akses cepat)
3. Editor (halaman inti)
4. Webhooks
5. Templates
6. Logs
7. Settings (akun, retensi log, hapus akun)
8. Halaman publik template `/t/[slug]`

### 4.5 Aksesibilitas

Kontras WCAG AA, navigasi keyboard penuh, label ARIA, fokus terlihat jelas, dan komponen dasar berbasis primitive yang accessible (misalnya Radix) yang distyling sendiri agar tidak terlihat seperti default.

---

## 5. Security Requirements

Ini bagian paling kritis karena aplikasi menyimpan **URL webhook, yang artinya siapa pun yang memegangnya bisa mengirim pesan ke channel**.

### 5.1 Penyimpanan URL webhook

- Dienkripsi di level aplikasi dengan **AES-256-GCM** sebelum masuk database (IV unik per record).
- Kunci enkripsi di **environment variable Vercel** (terpisah dari database), dengan dukungan **rotasi kunci** (key version di tiap record).
- Plaintext hanya ada di memori server saat dikirim; **tidak pernah di-log, dikirim ke client, atau masuk error tracker**.
- Tampilan ke user selalu masked.
- Simpan juga `webhook_id` Discord terpisah (non-sensitif) untuk tampilan dan deduplikasi.

### 5.2 Autentikasi & sesi

- OAuth2 Discord dengan `state` dan **PKCE**, pakai library teruji (**Auth.js**), jangan menulis ulang sendiri.
- Cookie sesi `HttpOnly`, `Secure`, `SameSite=Lax`, masa berlaku dan rotasi wajar.
- Token OAuth Discord yang tidak dibutuhkan **tidak disimpan**.

### 5.3 Otorisasi

- Setiap query data dibatasi `user_id` milik sesi (tidak ada akses lewat ID saja). Uji IDOR wajib.
- Pertimbangkan **Row-Level Security** di Postgres sebagai lapisan kedua.

### 5.4 Proteksi request

- **Validasi semua input dengan Zod** di server (batas panjang embed, tipe, URL).
- **Anti-SSRF:** server hanya boleh memanggil host `discord.com` / `discordapp.com` (termasuk `ptb.` dan `canary.`) dengan path `/api/webhooks/{id}/{token}`. Tidak ada redirect following ke host lain. URL gambar dikirim apa adanya ke Discord dan **tidak di-fetch oleh server kita**.
- **Rate limiting** per user dan per IP (Upstash Ratelimit) pada login, kirim, tambah webhook, dan endpoint publik.
- **CSRF:** gunakan Server Actions atau cek `Origin` dan token pada Route Handler mutasi.
- **Security headers:** CSP ketat (nonce), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, dan `frame-ancestors 'none'`.
- **Anti-XSS:** renderer preview markdown harus disanitasi. Jangan pernah memakai `dangerouslySetInnerHTML` dengan input user mentah.

### 5.5 Anti-abuse

- **Tanpa kuota jumlah** (tujuan produk: gratis tanpa batasan): jumlah webhook, template, dan log tidak dibatasi per user. Yang ada hanya **rate limit teknis** per menit untuk kirim, ping, dan endpoint publik, demi melindungi dari spam dan menghormati limit Discord.
- Tangani 429 Discord dengan backoff, dan tandai webhook tersimpan yang sudah tidak valid (404/401).
- Halaman template publik: rate limit dan opsi **laporkan**.
- Kebijakan penggunaan yang melarang spam dan konten melanggar ToS Discord.

### 5.6 Operasional

- Semua secret hanya di environment variable Vercel, tidak ada di repo.
- Dependency audit (Dependabot / `npm audit`) di CI.
- Log aplikasi tanpa data sensitif. Error tracking dengan scrubbing.
- Hak user: **ekspor dan hapus data** (hapus akun menghapus semua record terkait).
- Halaman Privacy Policy dan Terms sederhana.

---

## 6. Arsitektur Teknis (disesuaikan untuk Vercel)

### 6.1 Stack

| Layer | Pilihan | Alasan |
| --- | --- | --- |
| Framework | **Next.js (App Router) + TypeScript** | Sesuai permintaan, native di Vercel |
| Styling | **Tailwind CSS** + komponen custom | Cepat dan konsisten, mudah dibuat unik |
| Animasi | **Motion (Framer Motion)** | Layout animation dan reorder halus |
| Smooth scroll | **Lenis** (landing page) | Scroll halus untuk efek scroll |
| i18n | **next-intl** | Dukungan ID/EN di App Router |
| Auth | **Auth.js** (Discord provider) | Teruji, mendukung PKCE dan state |
| Database | **Postgres (Neon atau Supabase)** | Pilihan user, cocok serverless |
| ORM | **Drizzle** (atau Prisma) | Type-safe, ringan di serverless/edge |
| Validasi | **Zod** | Satu skema untuk client dan server |
| Rate limit | **Upstash Ratelimit** | Serverless, ada free tier |
| Hosting | **Vercel** | — |

Catatan: bila memakai Neon, pakai **driver serverless/pooled connection**, karena koneksi Postgres biasa cepat habis di environment serverless.

### 6.2 Model data (garis besar)

- **users**: id, discord_id, username, avatar, created_at
- **webhooks**: id, user_id, name, discord_webhook_id, url_encrypted, key_version, last_status, last_checked_at, created_at, last_used_at
- **webhook_checks**: id, webhook_id, status, http_status, latency_ms, error, created_at (menyimpan 20 terakhir per webhook)
- **templates**: id, user_id, name, description, tags, payload (JSONB), created_at, updated_at
- **template_shares**: id, template_id, slug, is_active, import_count, created_at
- **message_logs**: id, user_id, webhook_id, webhook_name_snapshot, mode, payload (JSONB, nullable), status, http_status, latency_ms, discord_message_id, error, created_at

Index penting: `(user_id, created_at)` dan `(user_id, status)` di logs, indeks pencarian teks (Postgres full-text `tsvector` / `pg_trgm`) untuk isi log, `slug` unik di shares.

### 6.3 Alur kirim pesan

1. Client mengirim payload + referensi webhook (id tersimpan, atau URL manual) ke Route Handler.
2. Server memvalidasi sesi, rate limit, dan skema payload.
3. Server mengambil dan mendekripsi URL (atau memvalidasi URL manual).
4. Server memanggil Discord `POST ...?wait=true`.
5. Hasil (status, message ID) disimpan ke `message_logs`, lalu respons ringkas dikembalikan ke client.

### 6.4 Catatan teknis Discord

- Edit dan hapus pesan memakai endpoint `PATCH` / `DELETE` pada `.../messages/{message_id}` dengan token webhook yang sama.
- Webhook biasa **tidak bisa** mengirim komponen interaktif. Tombol link hanya untuk webhook milik aplikasi, jadi di luar scope.
- Footer, timestamp, `image`, `thumbnail`, `author.icon_url`, dan `footer.icon_url` semuanya didukung payload embed standar.

---

### 6.5 Batas Vercel Hobby & pembersihan log

- Plan **Hobby (gratis)** dipakai. Perhatikan batas durasi dan kuota fungsi, serta ketentuan penggunaan non-komersial dari Vercel.
- Karena tanpa kuota per user, penyimpanan dijaga lewat **retensi log 30 hari**, opsi mematikan penyimpanan payload, dan batas ukuran payload per pesan sesuai batas Discord.
- Pembersihan log memakai **Vercel Cron harian** (cukup untuk plan Hobby, yang hanya mendukung cron sekali sehari): menghapus log lebih dari 30 hari dan riwayat ping lama. Endpoint cron diproteksi secret.
- Database free tier (Neon/Supabase) punya batas storage dan koneksi, sehingga pakai pooled/serverless driver dan pantau pemakaian.

## 7. Non-Functional Requirements

- **Performa:** LCP \< 2,5 detik di 4G, interaksi editor terasa instan (\< 100 ms), bundle editor dipecah (lazy load).
- **Reliabilitas:** tombol kirim tahan double-click (idempotency) sehingga tidak ada pesan ganda, dan error Discord ditampilkan jelas.
- **Skalabilitas:** arsitektur stateless, aman di serverless.
- **Browser:** Chrome, Safari, Firefox, Edge versi terbaru, plus Safari iOS dan Chrome Android.
- **Observability:** error tracking dan metrik dasar tanpa data sensitif.

---

## 8. Metrik Keberhasilan

- Sukses login Discord ≥ 95%
- Rasio pengiriman sukses (di luar kesalahan webhook user) ≥ 99%
- Waktu dari login ke pesan pertama terkirim \< 2 menit
- Skor Lighthouse ≥ 90 (performance, accessibility, best practices)
- Nol insiden kebocoran URL webhook

---

## 9. Roadmap

| Fase | Isi |
| --- | --- |
| **0. Desain** | Konsep visual, design system, prototype editor dan preview |
| **1. MVP (P0)** | Login Discord, webhook manager (terenkripsi) + ping/uji koneksi, editor penuh (normal/embed/keduanya), preview, kirim, riwayat & status pengiriman, filter & pencarian, kerangka i18n ID/EN, security dasar |
| **2. v1 (P1)** | Template library, share link, edit/hapus pesan terkirim, terjemahan ID/EN lengkap, export log |
| **3. Polish** | Animasi lengkap, tuning responsive, audit security, dan uji beban |
| **4. Setelah rilis (P2)** | Upload gambar, multi-target, variabel template, riwayat versi, kolaborasi |

---

## 10. Risiko

| Risiko | Mitigasi |
| --- | --- |
| Kebocoran URL webhook | Enkripsi AES-GCM, masking, tidak pernah ke client, rotasi kunci |
| Disalahgunakan untuk spam | Rate limit, batas kuota, penghentian otomatis webhook invalid |
| Limit koneksi DB di serverless | Pooled/serverless driver |
| Gratis tanpa kuota, terbentur batas free tier | Retensi 30 hari, cron cleanup harian, payload log opsional, rate limit teknis |
| Preview tidak sama dengan Discord asli | Uji kasus markdown dan embed secara sistematis |

---

## 11. Note

- Nama produk: My Kait
- Pallet warna dan bentuk maskot hook: improvisasi saja designnya, owner memberi kebebasan asalkan sesuai dengan tema/arah visual.
- Arah visual: playful dan colorful, dengan tema terang dan gelap setara.
- Tanpa kuota jumlah per user, produk gratis tanpa batasan (tetap ada rate limit teknis).
- Retensi log **30 hari**.
- Multi-bahasa: **ID dan EN**.