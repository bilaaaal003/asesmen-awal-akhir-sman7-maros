# Portal Asesmen Awal & Akhir Kelas XII — SMAN 7 Maros

Aplikasi web React + Vite dengan dashboard modern, warna ungu-biru, animasi ringan, bank soal, data peserta contoh, sesi kuis, ringkasan analitik, ekspor CSV, dan pengaturan identitas sekolah.

## Jalankan di komputer (Visual Studio Code)

1. Ekstrak ZIP ini.
2. Buka folder `asesmen_awal_akhir_sman7_maros` di Visual Studio Code.
3. Pastikan Node.js versi LTS terpasang.
4. Buka Terminal → New Terminal.
5. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
6. Buka alamat lokal yang ditampilkan Vite (biasanya `http://localhost:5173`).

## Build untuk hosting

```bash
npm run build
```
Hasil build berada di folder `dist`. Proyek dapat disimpan di GitHub lalu di-deploy ke Vercel dengan Build Command `npm run build` dan Output Directory `dist`.

## Fitur yang tersedia

- Dashboard ringkasan asesmen awal dan akhir.
- Form identitas peserta (nama, NISN, kelas).
- Kuis pilihan ganda dengan navigasi soal, penanda soal terjawab, dan skor demo.
- Bank soal dan formulir tambah soal.
- Data peserta contoh, pencarian, status pengerjaan.
- Ringkasan partisipasi dan progres per kelas.
- Ekspor data peserta ke CSV.
- Pengaturan nama sekolah, judul asesmen, dan durasi.
- Tampilan responsif untuk desktop, tablet, dan ponsel.
- Animasi antarmuka dengan dukungan `prefers-reduced-motion`.

## Penting sebelum dipakai secara resmi

**Paket ini adalah prototipe front-end/demo, bukan sistem produksi.** Data peserta dan jawaban masih berada di memori browser; belum ada autentikasi sungguhan, database, timer hitung mundur, penguncian satu kali pengerjaan, penyimpanan hasil resmi, atau integrasi Supabase. Data siswa yang ditampilkan hanyalah contoh dan harus diganti/dihapus sebelum penggunaan nyata.

Untuk penggunaan resmi, langkah berikutnya adalah menghubungkan Supabase:
- Supabase Auth untuk login admin dan peserta.
- Tabel profil peserta, kelas, asesmen, soal, opsi, sesi pengerjaan, jawaban, dan hasil.
- Row Level Security (RLS) untuk membatasi peserta hanya mengakses asesmennya.
- Fungsi server/RPC untuk menilai jawaban tanpa mengirim kunci jawaban ke browser.
- Penyimpanan permanen, audit log, backup, dan uji akses.
- Hindari menaruh `service_role` key di kode front-end. Gunakan hanya Supabase anon/publishable key bersama RLS yang benar.

## Kustomisasi

- Tampilan: `src/styles.css`
- Fitur dan soal contoh: `src/main.jsx`
- Metadata halaman: `index.html`

## SQL Supabase

File skema database awal tersedia di `supabase/schema.sql`. Jalankan melalui **Supabase Dashboard → SQL Editor** pada project uji/cadangan terlebih dahulu.

**Penting:** versi proyek ini masih berupa prototipe frontend. SQL tersebut membuat struktur tabel dan mengaktifkan Row Level Security (RLS), tetapi kebijakan akses/RPC serta integrasi Supabase pada kode frontend belum diselesaikan. Karena itu aplikasi belum siap dipakai untuk asesmen nyata atau menyimpan data ke database. Jangan menonaktifkan RLS atau membuka akses publik ke tabel kunci jawaban.

## Halaman login siswa dan guru

Versi ini menambahkan halaman pemilihan login siswa/guru.
- Siswa: NISN dan tanggal lahir.
- Guru: username/email dan kata sandi.

**Penting:** ini masih prototipe antarmuka. Form login saat ini belum memverifikasi identitas melalui Supabase. Jangan gunakan untuk asesmen resmi atau data siswa sungguhan sampai autentikasi siswa, Supabase Auth untuk guru, kebijakan RLS, serta penyimpanan jawaban terintegrasi dan diuji.

### Menjalankan aplikasi
```bash
npm install
npm run dev
```


## Login administrator (prototipe)

- Username awal: `admin`
- Kata sandi awal: `Admin@2026`
- Pilih tab **Admin** pada halaman login. Setelah masuk, buka menu **Pengaturan** untuk mengganti username dan kata sandi administrator.

**Peringatan keamanan:** ini hanya login demo sisi frontend. Perubahan kredensial hanya berlaku selama halaman masih terbuka dan akan hilang jika dimuat ulang. Jangan deploy atau menggunakan kredensial ini untuk data nyata. Untuk penggunaan produksi, autentikasi harus dipindahkan ke Supabase Auth, role administrator disimpan dan divalidasi di server/database, serta RLS/policies harus dikonfigurasi dengan benar.


## Login siswa dan impor Excel (pembaruan)

Login siswa sekarang memeriksa **NISN dan tanggal lahir** terhadap daftar peserta yang ada di aplikasi. Data contoh fiktif yang tersedia untuk uji lokal:

| NISN | Tanggal lahir | Nama contoh |
|---|---|---|
| `0068123401` | `2008-04-12` | Alya Putri |
| `0068123402` | `2008-09-21` | Muhammad Fajar |
| `0068123403` | `2008-01-30` | Nadia Rahma |
| `0068123404` | `2008-06-18` | Andi Rizky |
| `0068123405` | `2008-11-07` | Nur Aisyah |
| `0068123406` | `2008-03-25` | Rafi Akbar |

Semua data di atas hanya contoh. Jangan digunakan sebagai data autentikasi produksi.

### Mengimpor data siswa
1. Login sebagai administrator (`admin` / `Admin@2026`) pada prototipe lokal.
2. Buka menu **Data Peserta**.
3. Klik **Unduh Template Excel** atau gunakan file `Template_Impor_Siswa_SMAN_7_Maros.xlsx` yang disertakan.
4. Isi kolom **NISN, Nama, Kelas, Tanggal Lahir, Jenis Kelamin**. Simpan NISN sebagai teks dan tanggal lahir dalam format `YYYY-MM-DD`.
5. Pilih file Excel melalui **Pilih file Excel**. Data valid akan muncul di tabel dan dapat digunakan untuk login siswa selama aplikasi belum dimuat ulang.
6. Logout admin, lalu login siswa menggunakan NISN dan tanggal lahir yang sama persis.

Impor ini masih menyimpan data di memori aplikasi saja, bukan Supabase; refresh browser akan menghapus data impor. Login siswa juga belum merupakan autentikasi produksi. Jangan masukkan data pribadi siswa asli sampai Supabase/RLS dan validasi server sudah dikonfigurasi dan diuji.

---

# PEMBARUAN AUTH ADMIN & GURU (Supabase)

Pembaruan ini mempertahankan tampilan utama dan menambahkan autentikasi Supabase untuk **Administrator dan Guru**, serta menu **Manajemen Pengguna** khusus Administrator.

## 1. Konfigurasi lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `VITE_SUPABASE_URL` dengan Project URL Supabase.
3. Isi `VITE_SUPABASE_ANON_KEY` dengan publishable/anon key dari Supabase API settings.
4. Jangan pernah memasukkan `service_role` key ke file `.env` frontend, GitHub, atau Vercel.
5. Jalankan:
   ```bash
   npm install
   npm run dev
   ```

## 2. Login Administrator

Gunakan email dan kata sandi akun Administrator yang sudah dibuat di Supabase Auth. Akun tersebut harus mempunyai baris aktif di `public.staff_profiles` dengan `role = 'admin'`. Aplikasi memeriksa role dari database setelah Supabase Auth berhasil memverifikasi kata sandi.

## 3. Deploy Edge Function pembuat akun guru

Fungsi berada di `supabase/functions/create-teacher/index.ts`. Fungsi memverifikasi access token pemanggil, memastikan pemanggil adalah Administrator aktif, membuat akun Auth, lalu membuat profil role `teacher`. Service-role key hanya digunakan di lingkungan server Edge Function.

Dengan Supabase CLI yang sudah terhubung ke project yang benar, jalankan dari folder proyek:

```bash
supabase login
supabase link --project-ref PROJECT_REF_ANDA
supabase functions deploy create-teacher
```

Jangan menyalin service-role key ke source code. Fungsi menggunakan environment secrets bawaan Supabase Edge Functions.

## 4. Cara Administrator menambahkan guru

1. Login sebagai Administrator menggunakan email Supabase Auth.
2. Buka **Manajemen Pengguna**.
3. Isi nama lengkap, NIP, dan kata sandi awal minimal 8 karakter.
4. Klik **Buat Akun Guru**.
5. Berikan NIP dan kata sandi awal kepada guru secara pribadi.
6. Guru memilih **Login Guru**, memasukkan NIP dan kata sandi tersebut.

Untuk kompatibilitas login, NIP dipetakan secara internal ke alamat login `nip@guru.sman7maros.id`. Guru tidak perlu mengetik alamat email buatan tersebut; cukup masukkan NIP.

## 5. Pemeriksaan SQL (hanya baca)

Jalankan di Supabase SQL Editor untuk memastikan akun Administrator sudah aktif:

```sql
SELECT user_id, full_name, nip, role, is_active
FROM public.staff_profiles
WHERE role = 'admin';
```

Pastikan akun Administrator yang digunakan memiliki `is_active = true`. Tidak perlu menjalankan ulang schema awal atau menghapus tabel yang sudah ada.

## Pemulihan password administrator

- Pada halaman login, pilih **Admin**, lalu klik **Lupa kata sandi atau email?**.
- Masukkan email Administrator yang aktif/terdaftar dan kirim tautan pemulihan.
- Buka tautan dari email, lalu tetapkan kata sandi baru minimal 8 karakter.

Jika alamat email Administrator lupa:

1. Buka Supabase Dashboard project yang digunakan.
2. Masuk ke **Authentication → Users**.
3. Cari akun yang memiliki profil `role = 'admin'`, catat atau perbarui alamat emailnya.
4. Pastikan redirect URL aplikasi sudah ditambahkan pada **Authentication → URL Configuration**.

## Batasan yang masih harus diselesaikan sebelum asesmen resmi

- Login siswa masih berupa prototipe lokal (data contoh di browser), belum memakai verifikasi server dan sesi siswa yang aman.
- Modul bank soal, impor siswa, asesmen, jawaban, nilai, dan laporan pada antarmuka lama masih belum sepenuhnya terhubung ke Supabase. Tampilan demo tidak boleh dianggap sebagai penyimpanan nilai resmi.
- Sebelum digunakan sungguhan, alur siswa dan pengerjaan asesmen harus dipindahkan ke RPC/Edge Function yang memeriksa identitas, kepemilikan attempt, jadwal, dan status; kunci jawaban tidak boleh dikirim ke browser siswa.
- Login Guru/Admin sekarang memakai Supabase Auth. Role tetap divalidasi terhadap `staff_profiles` dan RLS.
- Pembuatan akun guru dilakukan oleh Edge Function; jangan membuat akun guru dengan memberi hak INSERT langsung ke browser.
