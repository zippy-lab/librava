# Librava — Product Requirements Document (PRD)

**Versi:** 1.0  
**Status:** Draft untuk implementasi  
**Produk:** Librava — Modern School Library Management System  
**Target:** Perpustakaan sekolah  
**Bahasa antarmuka:** Bahasa Indonesia

---

## 1. Ringkasan Produk

Librava adalah aplikasi web untuk mengelola kegiatan perpustakaan sekolah dalam satu sistem: katalog buku, data anggota, sirkulasi peminjaman, reservasi, pengembalian, denda, notifikasi, dan laporan.

Produk harus memiliki kemampuan administrasi yang lengkap, tetapi pengalaman pengguna tetap sederhana. Anggota dapat menemukan buku dan memantau pinjaman dengan mudah, sedangkan petugas dapat menjalankan operasional harian tanpa proses yang berbelit.

### Prinsip produk
1. **Mudah dipahami:** istilah dan alur sesuai kebiasaan perpustakaan sekolah.
2. **Cepat untuk tugas rutin:** pencarian, peminjaman, dan pengembalian dapat dilakukan dengan sedikit langkah.
3. **Data dapat dipercaya:** stok, status pinjaman, dan riwayat tercatat secara konsisten.
4. **Akses sesuai peran:** setiap pengguna hanya melihat dan melakukan tindakan yang diizinkan.
5. **Responsif dan aksesibel:** nyaman digunakan di komputer, tablet, dan ponsel.

## 2. Latar Belakang dan Masalah

Pengelolaan perpustakaan yang tersebar di buku catatan atau spreadsheet menyulitkan petugas dalam:
- Mengetahui ketersediaan dan lokasi eksemplar buku.
- Memantau tanggal jatuh tempo dan keterlambatan.
- Melacak riwayat peminjaman anggota.
- Menghasilkan laporan koleksi dan aktivitas.
- Menjaga konsistensi data ketika beberapa petugas bekerja bersamaan.

Librava menyatukan proses tersebut dengan katalog yang dapat diakses anggota dan dashboard operasional untuk petugas.

## 3. Tujuan dan Indikator Keberhasilan

### Tujuan
- Memusatkan data buku, eksemplar, anggota, dan transaksi.
- Mengurangi kesalahan pencatatan sirkulasi.
- Membantu anggota menemukan buku yang tersedia.
- Menyediakan laporan operasional yang mudah dipahami.
- Menyediakan fondasi yang aman dan dapat dikembangkan.

### Indikator keberhasilan awal
- Petugas dapat membuat transaksi pinjam atau kembali tanpa mengubah stok secara manual.
- Anggota dapat mencari buku, melihat ketersediaan, dan memantau pinjaman.
- Setiap transaksi memiliki jejak waktu dan petugas yang memprosesnya.
- Laporan dapat difilter berdasarkan rentang tanggal dan diekspor.
- Tidak ada pengguna yang dapat mengakses fitur di luar perannya melalui UI maupun API.

## 4. Pengguna dan Hak Akses

### Admin
Mengelola konfigurasi, akun, peran, data master, aturan sirkulasi, serta seluruh laporan. Admin dapat melihat audit log dan melakukan koreksi data dengan alasan yang tercatat.

### Petugas perpustakaan
Mengelola katalog dan eksemplar sesuai izin, memproses peminjaman/pengembalian, reservasi, anggota, serta melihat laporan operasional.

### Anggota
Melihat katalog, mencari dan memfilter buku, mengajukan reservasi, melihat pinjaman dan riwayat, memperpanjang pinjaman jika memenuhi syarat, serta melihat denda dan notifikasi.

### Pengunjung
Dapat melihat katalog publik dan detail buku. Tidak dapat melakukan reservasi atau melihat data anggota.

## 5. Ruang Lingkup

### Termasuk dalam versi awal
- Autentikasi dan pengelolaan akun.
- Role-based access control (RBAC).
- Katalog buku, kategori, penulis, penerbit, dan eksemplar.
- Pencarian, filter, pengurutan, dan detail buku.
- Peminjaman, pengembalian, perpanjangan, dan reservasi.
- Pengelolaan anggota.
- Denda dan pencatatan pembayaran.
- Dashboard sesuai peran.
- Notifikasi dalam aplikasi.
- Laporan dan ekspor CSV.
- Pengaturan aturan perpustakaan.
- Audit log untuk tindakan penting.
- Impor data buku/anggota dari CSV dengan validasi.

### Di luar ruang lingkup versi awal
- Pembayaran denda melalui payment gateway.
- Integrasi RFID/barcode scanner khusus (input barcode biasa tetap didukung).
- Aplikasi native Android/iOS.
- E-book ber-DRM atau distribusi konten berhak cipta.
- Integrasi otomatis dengan sistem akademik sekolah.
- Multi-cabang; versi awal hanya satu perpustakaan.

## 6. Kebutuhan Fungsional

### FR-01 — Akun dan autentikasi
- Pengguna dapat masuk dan keluar dengan aman.
- Admin dapat membuat, mengubah, menonaktifkan, dan mengatur peran akun.
- Anggota dapat memperbarui profil dasar dan mengganti kata sandi.
- Akun nonaktif tidak dapat masuk.
- Sistem menyediakan alur pemulihan kata sandi melalui mekanisme yang dikonfigurasi.

### FR-02 — Katalog dan koleksi
- Petugas dapat membuat, membaca, memperbarui, dan mengarsipkan data bibliografi.
- Data buku mencakup judul, ISBN, deskripsi, kategori, penulis, penerbit, tahun terbit, bahasa, sampul, dan metadata opsional.
- Satu judul dapat memiliki beberapa eksemplar dengan kode inventaris/barcode unik.
- Setiap eksemplar memiliki status: tersedia, dipinjam, rusak, hilang, atau diarsipkan.
- Sistem menampilkan jumlah tersedia dan jumlah total secara konsisten.

### FR-03 — Penemuan buku
- Pengunjung dan anggota dapat mencari berdasarkan judul, penulis, ISBN, kategori, atau kata kunci.
- Filter: kategori, status ketersediaan, tahun terbit, dan bahasa.
- Pengurutan: relevansi, judul A–Z, terbaru, dan ketersediaan.
- Hasil pencarian memiliki pagination.
- Halaman detail menampilkan metadata, status ketersediaan, dan pilihan reservasi bagi anggota yang memenuhi syarat.

### FR-04 — Peminjaman
- Petugas memilih anggota dan eksemplar yang tersedia untuk membuat transaksi.
- Sistem memeriksa status anggota, batas pinjaman, dan status eksemplar.
- Sistem menentukan tanggal jatuh tempo dari aturan yang berlaku.
- Transaksi mencatat petugas, waktu, eksemplar, anggota, dan tanggal jatuh tempo.
- Stok/status eksemplar diperbarui secara atomik agar tidak terjadi peminjaman ganda.

### FR-05 — Pengembalian
- Petugas dapat menemukan transaksi melalui kode anggota, barcode eksemplar, atau nomor transaksi.
- Sistem mencatat tanggal pengembalian aktual.
- Jika terlambat, sistem menghitung denda berdasarkan aturan yang berlaku.
- Eksemplar kembali tersedia kecuali ditandai rusak/hilang atau ada reservasi aktif yang harus dipenuhi.
- Pengembalian dan perubahan status dicatat dalam riwayat.

### FR-06 — Perpanjangan
- Anggota dapat meminta perpanjangan dari halaman pinjaman aktif.
- Perpanjangan hanya diizinkan jika belum melewati jatuh tempo, belum mencapai batas perpanjangan, dan tidak ada reservasi aktif dari anggota lain.
- Petugas dapat menyetujui/menolak permintaan jika kebijakan sekolah mengharuskannya.
- Sistem menyimpan tanggal jatuh tempo sebelumnya dan yang baru.

### FR-07 — Reservasi
- Anggota dapat membuat reservasi untuk judul yang sedang tidak tersedia.
- Reservasi memiliki antrean berdasarkan waktu pengajuan.
- Anggota dapat membatalkan reservasi selama belum diproses.
- Saat eksemplar tersedia, petugas dapat menandai reservasi siap diambil dan sistem memberi batas waktu pengambilan.
- Reservasi kedaluwarsa otomatis setelah batas waktu pengambilan, lalu antrean berlanjut.

### FR-08 — Anggota
- Petugas dapat membuat dan memperbarui data anggota.
- Data mencakup nomor anggota, nama, email opsional, kelas/rombel, kontak opsional, status, dan tanggal bergabung.
- Status anggota: aktif, ditangguhkan, atau nonaktif.
- Anggota yang ditangguhkan tidak dapat meminjam atau reservasi.

### FR-09 — Denda
- Denda keterlambatan dihitung dari jumlah hari terlambat dan tarif harian yang dikonfigurasi.
- Admin dapat mengatur masa tenggang, tarif, dan batas denda.
- Petugas dapat mencatat pembayaran penuh atau sebagian sesuai kebijakan.
- Status denda: belum dibayar, dibayar sebagian, lunas, atau dibebaskan.
- Pembebasan denda wajib memiliki alasan dan dicatat di audit log.
- Versi awal hanya mencatat pembayaran; tidak memproses uang secara online.

### FR-10 — Notifikasi
- Notifikasi dalam aplikasi untuk reservasi, jatuh tempo mendekat, keterlambatan, perubahan status reservasi, dan denda.
- Notifikasi memiliki status sudah/belum dibaca.
- Pengiriman email/SMS bersifat opsional dan bergantung pada konfigurasi penyedia.

### FR-11 — Dashboard dan laporan
- Dashboard admin: total judul, total eksemplar, anggota aktif, pinjaman aktif, terlambat, dan ringkasan aktivitas.
- Dashboard petugas: transaksi hari ini, pengembalian jatuh tempo, antrean reservasi, dan tindakan cepat.
- Dashboard anggota: pinjaman aktif, tanggal jatuh tempo, reservasi, denda, dan riwayat.
- Laporan: peminjaman/pengembalian, buku populer, koleksi, anggota aktif, keterlambatan, dan denda.
- Laporan dapat difilter tanggal/kategori/kelas dan diekspor ke CSV.

### FR-12 — Pengaturan dan audit
- Admin dapat mengatur durasi pinjaman, batas buku per anggota, batas perpanjangan, tarif denda, masa tenggang, dan periode pengambilan reservasi.
- Sistem mencatat tindakan sensitif: perubahan role, perubahan aturan, koreksi transaksi, pembebasan denda, dan perubahan data penting.
- Audit log menampilkan pelaku, tindakan, objek, waktu, dan alasan jika diwajibkan.

## 7. User Stories dan Acceptance Criteria

1. **Sebagai anggota, saya ingin mencari buku berdasarkan judul** agar dapat menemukan koleksi dengan cepat.  
   **Kriteria:** pencarian mengembalikan hasil relevan; filter dapat digabung; keadaan kosong memberi pesan dan saran untuk mengubah kata kunci.

2. **Sebagai petugas, saya ingin meminjamkan buku kepada anggota** agar transaksi tercatat.  
   **Kriteria:** hanya anggota aktif dan eksemplar tersedia yang dapat diproses; tanggal jatuh tempo dihitung; status eksemplar berubah; transaksi tercatat satu kali.

3. **Sebagai petugas, saya ingin memproses pengembalian** agar status koleksi akurat.  
   **Kriteria:** sistem mencatat waktu aktual; menghitung denda sesuai aturan; status eksemplar diperbarui; transaksi tidak dapat dikembalikan dua kali.

4. **Sebagai anggota, saya ingin melihat pinjaman aktif dan jatuh tempo** agar tidak terlambat.  
   **Kriteria:** daftar menampilkan judul, tanggal pinjam, jatuh tempo, status, dan tindakan yang diizinkan.

5. **Sebagai admin, saya ingin mengatur kebijakan pinjaman** agar sesuai aturan sekolah.  
   **Kriteria:** perubahan berlaku untuk transaksi baru; transaksi lama tetap menyimpan nilai aturan yang digunakan saat dibuat.

6. **Sebagai admin, saya ingin mengekspor laporan** agar dapat melakukan rekap.  
   **Kriteria:** filter diterapkan pada hasil; file CSV memiliki header jelas; data mengikuti hak akses pengguna.

## 8. Alur Utama

### Peminjaman
Petugas masuk → pilih menu Sirkulasi → cari anggota → scan/masukkan barcode eksemplar → sistem memvalidasi → petugas konfirmasi → transaksi tersimpan dan bukti ringkas ditampilkan.

### Pengembalian
Petugas masuk → pilih Pengembalian → cari/scan eksemplar → sistem menemukan transaksi aktif → tampilkan keterlambatan/denda → petugas konfirmasi kondisi → transaksi selesai dan status eksemplar diperbarui.

### Reservasi anggota
Anggota masuk → cari judul → buka detail → pilih Reservasi jika tidak tersedia → sistem memvalidasi batas reservasi → reservasi masuk antrean → anggota menerima notifikasi saat siap diambil.

## 9. Struktur Navigasi

### Area publik
- Beranda
- Katalog
- Detail buku
- Masuk

### Area anggota
- Dashboard
- Katalog
- Pinjaman saya
- Reservasi
- Riwayat
- Denda
- Notifikasi
- Profil

### Area petugas
- Dashboard
- Sirkulasi
  - Peminjaman
  - Pengembalian
  - Reservasi
- Katalog dan eksemplar
- Anggota
- Laporan
- Profil

### Area admin
- Semua menu petugas
- Pengguna dan peran
- Pengaturan perpustakaan
- Audit log

## 10. Prinsip UI/UX

- Gunakan layout dashboard dengan sidebar pada desktop dan navigasi ringkas pada layar kecil.
- Gunakan warna netral sebagai dasar, satu warna utama untuk aksi, dan warna status yang konsisten.
- Prioritaskan keterbacaan, hierarki informasi, ruang kosong, dan tombol aksi yang jelas.
- Katalog menggunakan kartu buku dengan sampul, judul, penulis, dan indikator ketersediaan.
- Form memiliki label permanen, validasi dekat dengan field, dan pesan error yang dapat ditindaklanjuti.
- Semua tabel mendukung pencarian/filter yang relevan, pagination, dan keadaan loading/kosong/error.
- Jangan mengandalkan warna saja untuk menyampaikan status.
- Konfirmasi diperlukan untuk tindakan destruktif atau koreksi transaksi.

## 11. Kebutuhan Nonfungsional

- Responsif untuk lebar layar 360 px ke atas.
- Waktu respons target p95 di bawah 2 detik untuk operasi umum pada data uji yang wajar.
- Semua komunikasi menggunakan HTTPS pada deployment.
- Kata sandi disimpan dengan hashing aman; tidak pernah disimpan dalam teks biasa.
- Validasi dilakukan di frontend dan backend.
- Operasi sirkulasi harus transaksional dan aman dari race condition.
- Mendukung backup database dan prosedur pemulihan.
- Memiliki log error tanpa membocorkan informasi sensitif.
- Memenuhi praktik aksesibilitas dasar: navigasi keyboard, label input, kontras memadai, dan fokus terlihat.

## 12. Prioritas Pengembangan

### P0 — Wajib untuk rilis awal
Autentikasi/RBAC, katalog, eksemplar, anggota, peminjaman, pengembalian, aturan dasar, dashboard, dan laporan dasar.

### P1 — Penting
Reservasi, perpanjangan, denda, notifikasi, impor CSV, audit log, ekspor laporan.

### P2 — Pengembangan lanjutan
Barcode scanner khusus, email/SMS, integrasi akademik, analitik lanjutan, multi-cabang, dan payment gateway.

## 13. Asumsi dan Batasan

- Aplikasi ditujukan untuk satu perpustakaan sekolah.
- Bahasa utama adalah Bahasa Indonesia dan zona waktu default `Asia/Jakarta`.
- Admin sekolah menentukan kebijakan pinjaman dan denda.
- Pembayaran denda dicatat manual pada versi awal.
- Data buku dan anggota awal dapat diimpor dari CSV.
- Katalog publik tidak menampilkan data pribadi anggota.
- Antigravity harus mengonfirmasi stack yang tersedia di folder proyek sebelum membuat atau mengganti konfigurasi.

## 14. Risiko dan Mitigasi

- **Stok tidak konsisten:** gunakan transaksi database dan penguncian/validasi status eksemplar.
- **Akses data tidak sah:** validasi role di backend pada setiap endpoint.
- **Aturan berubah:** simpan snapshot kebijakan pada transaksi.
- **Data impor tidak bersih:** tampilkan preview, validasi baris, dan laporan baris gagal.
- **Pengguna bingung:** gunakan istilah sederhana, empty state yang membantu, dan alur tugas yang konsisten.

## 15. Definition of Done

Fitur dinyatakan selesai jika:
- Memenuhi acceptance criteria.
- Validasi frontend dan backend tersedia.
- Akses role diuji.
- Loading, empty, success, dan error state tersedia.
- Tidak ada data contoh palsu yang menyamar sebagai data produksi.
- Tes utama lulus dan dokumentasi konfigurasi diperbarui.
