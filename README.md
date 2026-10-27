# MIS Hayatul Islamiyah Cinangka

Website multi halaman dengan dashboard admin PWA, pengelolaan program, fasilitas, galeri, pengumuman beranda, informasi PPDB, dan pendaftaran siswa.

Beranda juga menampilkan ringkasan profil, program, fasilitas, galeri, PPDB, dan tiga artikel terbit terbaru. Halaman Artikel menyediakan pencarian, filter kategori, dan halaman detail tulisan. Menu Artikel & Kegiatan di dashboard mengelola judul, ringkasan, isi, tanggal, kategori, gambar, serta status Draf/Terbit. Draf tidak dibagikan melalui API publik. Artikel yang dihapus atau dikembalikan menjadi draf tidak lagi muncul di beranda dan halaman artikel.

Galeri menampilkan album berjudul, masing-masing 1 sampai 12 foto. Klik album untuk melihat seluruh foto, lalu klik foto untuk memperbesar dan menavigasi foto dengan tombol atau panah keyboard. Menu Album Foto di admin mendukung unggah beberapa foto, hapus foto, dan tautan foto. Gambar unggahan dioptimalkan di browser sebelum disimpan; total data album dibatasi agar sesuai batas payload server. Foto lama dikelompokkan dalam Dokumentasi Madrasah dan tetap dapat diedit/dihapus sebagai album.

Menu Video YouTube menerima judul dan tautan video watch, youtu.be, Shorts, embed, atau live. Server memvalidasi domain dan ID video, kemudian membuat thumbnail dari i.ytimg.com. Video diputar di YouTube ketika kartu diklik. Thumbnail memerlukan internet; video privat, dihapus, atau dibatasi oleh pemilik bisa tidak tersedia meskipun format tautannya valid.

## Menjalankan lokal

Gunakan Node.js 24 atau lebih baru. Jalankan `node scripts/setup.mjs` untuk membuat `.env` dengan kata sandi admin dan secret acak. Buka `.env` untuk melihat ADMIN_PASSWORD. Jalankan `npm install`, `npm run build`, kemudian `npm start`. Buka http://localhost:3000 dan /admin.html untuk login. Data lokal disimpan di `.data/school.sqlite` dan tidak masuk Git.

## Netlify

### Supabase sekolah

Backend Supabase tersedia untuk lokal dan Netlify. Proyek: `gjlvefvkvzmokhytwbmf` (MIS Hayatul Islamiyah). Tabel `public.school_records` memakai primary key `(kind,id)`, RLS aktif, dan akses langsung `anon`/`authenticated` dicabut. API server tetap memeriksa login admin sebelum membaca data pendaftar, sesi, atau mengubah konten.

Atur `DATA_BACKEND=supabase`, `SUPABASE_URL=https://gjlvefvkvzmokhytwbmf.supabase.co`, serta `SUPABASE_SECRET_KEY` dari dashboard Supabase di `.env`. Secret key hanya untuk server dan tidak boleh ditaruh di `public`, `dist`, Git, atau chat. `ADMIN_PASSWORD` dan `SESSION_SECRET` tetap diperlukan. Uji koneksi dengan `node --env-file=.env scripts/check-supabase.mjs`; pengujian membuat, membaca, memperbarui, lalu menghapus satu record uji.

Untuk Netlify, isi variabel tersebut dengan scope Functions lalu deploy ulang kode backend. Integrasi ini belum berarti website yang sudah dipublikasikan otomatis menggunakan Supabase. Data SQLite/Netlify Database lama tidak dipindahkan otomatis; simpan database lama sampai migrasi data selesai. Tanpa `DATA_BACKEND=supabase`, penyimpanan lama tetap digunakan. Petunjuk Netlify Database di bawah berlaku untuk mode lama.

Publish directory: `dist`, build: `npm run build`. Backend berada di `netlify/functions`. Paket `@netlify/database` dan migrasi SQL menyediakan penyimpanan online di Netlify Database. Aktifkan Database pada proyek Netlify yang mendukung layanan tersebut, lalu atur ADMIN_PASSWORD dan SESSION_SECRET sebagai environment variables dengan scope Functions. Jangan memasukkan rahasia ke Git. Deploy melalui Git integration / CLI agar fungsi serta migrasi ikut diproses; upload folder statis saja tidak menjalankan backend.

Login memakai cookie HttpOnly 8 jam. Pendaftar hanya dapat dibaca admin. Daftar publik tidak menyertakan data pendaftar. Semua mutasi memeriksa origin. Rate limit produksi diterapkan di function. PWA tidak menyimpan respons API atau data pribadi dalam cache; dashboard memerlukan koneksi untuk membaca atau mengubah data.

Sesi admin dicatat di server dan dicabut saat logout. Rotasi password/secret membatalkan sesi sebelumnya. Percobaan login salah dibatasi 10 kali per IP selama 15 menit per proses. Laporan pengujian sebelum migrasi tersedia di `docs/QA-2026-10-19.md`.

Struktur organisasi mengikuti foto yang diberikan pada 19 Oktober 2026. Ejaan nama hasil pembacaan foto perlu dikonfirmasi pihak sekolah sebelum publikasi.

Versi lama satu halaman dipertahankan di index.html sebagai sumber konten build. Halaman website dinamis yang digunakan adalah hasil di dist/. Perubahan konten admin disimpan dalam database dan ditampilkan langsung di website.
