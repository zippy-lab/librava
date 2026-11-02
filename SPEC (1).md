# Librava — Technical Specification (SPEC)

**Versi:** 1.0  
**Pasangan dokumen:** PRD.md  
**Produk:** Librava — Modern School Library Management System

> Spesifikasi ini adalah baseline implementasi. Sebelum coding, AI coding agent harus memeriksa isi folder proyek dan mempertahankan stack yang sudah ada bila layak. Jangan mengganti framework atau menghapus file proyek tanpa alasan dan persetujuan.

## 1. Arsitektur yang Disarankan

Untuk proyek baru, gunakan:
- **Frontend:** React + TypeScript + Vite.
- **UI:** Tailwind CSS dan komponen aksesibel yang konsisten.
- **Backend:** Laravel API (PHP) atau backend yang sudah tersedia di proyek. Jika proyek sudah menggunakan PHP Native, jangan migrasi otomatis; adaptasikan struktur dan dokumentasikan keputusan.
- **Database:** MySQL 8+.
- **Autentikasi:** session aman untuk aplikasi same-origin, atau token yang dikelola secara aman bila arsitektur benar-benar memerlukannya.
- **Testing:** unit test domain, integration test API, dan end-to-end untuk alur sirkulasi.
- **Deployment:** konfigurasi environment terpisah untuk development dan production.

### Prinsip arsitektur
- Pisahkan UI, logika domain, akses data, dan validasi.
- Backend adalah sumber kebenaran untuk izin, stok, denda, dan status transaksi.
- Gunakan database transaction untuk operasi sirkulasi.
- Hindari business logic penting hanya di frontend.
- Jangan menaruh secret/API key di kode frontend atau repository.

## 2. Struktur Folder Acuan

Struktur aktual mengikuti stack yang ditemukan. Contoh untuk frontend React:

```text
librava/
├── docs/
│   ├── PRD.md
│   └── SPEC.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── catalog/
│   │   │   ├── circulation/
│   │   │   ├── members/
│   │   │   ├── reservations/
│   │   │   ├── fines/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── styles/
│   │   └── types/
│   └── tests/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/
│   │   ├── Policies/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Jobs/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── tests/
├── .env.example
└── README.md
```

## 3. Model Data

Gunakan primary key integer/bigint atau UUID secara konsisten. Semua tabel memiliki `created_at` dan `updated_at` bila relevan. Gunakan foreign key, index, dan constraint.

### 3.1 `users`
- `id`
- `name`
- `email` (unique)
- `password_hash`
- `role` enum: `admin`, `librarian`, `member`
- `status` enum: `active`, `suspended`, `inactive`
- `last_login_at` nullable
- timestamps

### 3.2 `members`
- `id`
- `user_id` nullable, unique
- `member_code` unique
- `full_name`
- `class_name` nullable
- `phone` nullable
- `joined_at`
- `status` enum: `active`, `suspended`, `inactive`
- timestamps

### 3.3 `books`
- `id`
- `isbn` nullable, indexed
- `title`
- `slug` unique
- `description` nullable
- `publisher_id` nullable
- `publication_year` nullable
- `language` nullable
- `cover_url` nullable
- `created_by`
- `archived_at` nullable
- timestamps

### 3.4 Relasi katalog
- `authors(id, name)`
- `book_authors(book_id, author_id)` — unique composite
- `categories(id, name, slug)` — slug unique
- `book_categories(book_id, category_id)` — unique composite
- `publishers(id, name)`
- `book_copies(id, book_id, inventory_code, barcode, condition, status, location, archived_at)`  
  `inventory_code` dan `barcode` unique; status: `available`, `loaned`, `damaged`, `lost`, `archived`.

### 3.5 `loan_policies`
- `id`
- `name`
- `loan_days`
- `max_active_loans`
- `max_renewals`
- `grace_days`
- `fine_per_day`
- `max_fine` nullable
- `reservation_pickup_days`
- `is_active`
- timestamps

### 3.6 `loans`
- `id`
- `loan_code` unique
- `member_id`
- `copy_id`
- `processed_by`
- `borrowed_at`
- `due_at`
- `returned_at` nullable
- `status` enum: `active`, `returned`, `lost`
- `policy_snapshot` JSON
- timestamps

Aturan: satu eksemplar tidak boleh memiliki lebih dari satu pinjaman aktif. Terapkan validasi dan transaksi database; gunakan unique constraint terfilter/strategi locking sesuai kemampuan database.

### 3.7 `renewals`
- `id`
- `loan_id`
- `requested_by`
- `old_due_at`
- `new_due_at`
- `status` enum: `approved`, `rejected`
- `reviewed_by` nullable
- `reviewed_at` nullable
- `reason` nullable
- timestamps

### 3.8 `reservations`
- `id`
- `reservation_code` unique
- `member_id`
- `book_id`
- `copy_id` nullable
- `queue_position`
- `status` enum: `queued`, `ready`, `fulfilled`, `cancelled`, `expired`
- `created_at`
- `ready_at` nullable
- `pickup_deadline` nullable
- `fulfilled_at` nullable
- timestamps

Aturan: antrean diurutkan berdasarkan waktu pembuatan. Cegah reservasi aktif ganda oleh anggota untuk judul yang sama.

### 3.9 `fines` dan `fine_payments`
`fines`: `id`, `loan_id`, `member_id`, `amount`, `paid_amount`, `status`, `waiver_reason` nullable, `waived_by` nullable, timestamps.  
`fine_payments`: `id`, `fine_id`, `amount`, `received_by`, `paid_at`, `note` nullable, timestamps.

Jumlah pembayaran tidak boleh melebihi sisa denda. Pembebasan denda harus mencatat pelaku dan alasan.

### 3.10 `notifications`
- `id`
- `user_id`
- `type`
- `title`
- `message`
- `read_at` nullable
- `related_type` nullable
- `related_id` nullable
- timestamps

### 3.11 `audit_logs`
- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `before_data` JSON nullable
- `after_data` JSON nullable
- `reason` nullable
- `ip_address` nullable
- `created_at`

Jangan menyimpan password, token, atau data rahasia di audit log.

## 4. Aturan Domain

### 4.1 Peminjaman
1. Pastikan anggota aktif dan tidak melampaui batas pinjaman.
2. Pastikan eksemplar berstatus `available`.
3. Mulai database transaction dan lock baris eksemplar.
4. Validasi ulang status di dalam transaction.
5. Buat loan dengan tanggal pinjam, jatuh tempo, petugas, dan snapshot kebijakan.
6. Ubah status eksemplar menjadi `loaned`.
7. Commit; jika salah satu langkah gagal, rollback.

### 4.2 Pengembalian
1. Temukan loan aktif dan lock baris terkait.
2. Tolak jika sudah dikembalikan.
3. Set `returned_at` dan status `returned`.
4. Hitung hari terlambat: `max(0, tanggal_pengembalian - tanggal_jatuh_tempo - masa_tenggang)`, sesuai definisi kalender pada zona waktu perpustakaan.
5. Hitung denda: `min(hari_terlambat × tarif_harian, batas_denda)` bila batas ditentukan.
6. Buat fine jika nilai lebih dari nol.
7. Tentukan status eksemplar berdasarkan kondisi dan reservasi aktif: `available`, `damaged`, atau `lost`.
8. Commit dan catat audit log.

### 4.3 Perpanjangan
- Tolak jika loan tidak aktif, melewati jatuh tempo, sudah mencapai batas perpanjangan, atau ada reservasi aktif dari anggota lain.
- Perpanjangan menggunakan snapshot aturan yang relevan atau kebijakan aktif sesuai keputusan sekolah; implementasi harus konsisten dan didokumentasikan.
- Catat tanggal jatuh tempo lama dan baru.

### 4.4 Reservasi
- Reservasi hanya untuk anggota aktif.
- Bila tersedia eksemplar, sistem dapat menawarkan peminjaman langsung; reservasi tetap dapat dibuat jika kebijakan mengizinkan.
- Saat eksemplar tersedia, petugas mengalokasikan kepada reservasi antrean pertama dan mengatur `pickup_deadline`.
- Job terjadwal menandai reservasi yang melewati tenggat sebagai `expired`, lalu memproses antrean berikutnya.
- Perubahan status reservasi menghasilkan notifikasi.

### 4.5 Waktu
- Simpan timestamp secara konsisten (UTC bila stack mendukung).
- Tampilkan dan hitung kebijakan berdasarkan `Asia/Jakarta`.
- Tanggal jatuh tempo harus didefinisikan sebagai tanggal kalender lokal; hindari pergeseran tanggal akibat konversi zona waktu.

## 5. API Acuan

Gunakan prefix `/api/v1`. Semua endpoint privat membutuhkan autentikasi dan otorisasi. Format respons konsisten:

```json
{
  "data": {},
  "meta": {},
  "message": "Berhasil"
}
```

Format error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang dimasukkan.",
    "details": {}
  }
}
```

### Auth dan profil
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `PATCH /me`

### Katalog
- `GET /books` — query: `q`, `category`, `available`, `language`, `year`, `sort`, `page`, `per_page`
- `GET /books/{id}`
- `POST /books` — admin/petugas
- `PATCH /books/{id}` — admin/petugas
- `DELETE /books/{id}` — arsipkan, bukan hard delete
- `GET /books/{id}/copies`
- `POST /books/{id}/copies`
- `PATCH /copies/{id}`

### Anggota
- `GET /members`
- `POST /members`
- `GET /members/{id}`
- `PATCH /members/{id}`
- `PATCH /members/{id}/status`

### Sirkulasi
- `POST /loans`
- `GET /loans`
- `GET /loans/{id}`
- `POST /loans/{id}/return`
- `POST /loans/{id}/renew`
- `GET /me/loans`

### Reservasi
- `POST /reservations`
- `GET /reservations`
- `GET /me/reservations`
- `POST /reservations/{id}/cancel`
- `POST /reservations/{id}/ready`
- `POST /reservations/{id}/fulfill`

### Denda
- `GET /fines`
- `GET /me/fines`
- `POST /fines/{id}/payments`
- `POST /fines/{id}/waive` — admin dengan alasan wajib

### Dashboard, laporan, pengaturan
- `GET /dashboard/summary`
- `GET /reports/loans`
- `GET /reports/collection`
- `GET /reports/popular-books`
- `GET /reports/fines`
- `GET /reports/export?type=...`
- `GET /settings/library`
- `PATCH /settings/library`
- `GET /audit-logs` — admin

API harus memvalidasi payload, membatasi pagination, dan menerapkan rate limit pada autentikasi serta endpoint sensitif.

## 6. Otorisasi

| Kemampuan | Pengunjung | Anggota | Petugas | Admin |
|---|---:|---:|---:|---:|
| Lihat katalog | Ya | Ya | Ya | Ya |
| Buat reservasi | Tidak | Ya | Atas nama anggota | Ya |
| Lihat pinjaman sendiri | Tidak | Ya | Ya | Ya |
| Proses pinjam/kembali | Tidak | Tidak | Ya | Ya |
| Kelola katalog | Tidak | Tidak | Ya | Ya |
| Kelola anggota | Tidak | Tidak | Ya | Ya |
| Ubah aturan | Tidak | Tidak | Tidak | Ya |
| Kelola role | Tidak | Tidak | Tidak | Ya |
| Lihat audit log | Tidak | Tidak | Terbatas | Ya |

Otorisasi wajib dilakukan di backend, bukan hanya dengan menyembunyikan tombol di frontend.

## 7. Spesifikasi Halaman

### Beranda publik
- Header: logo Librava, Katalog, Masuk.
- Hero singkat dengan pencarian utama.
- Bagian kategori/populer dan CTA ke katalog.
- Footer berisi informasi perpustakaan.

### Katalog
- Search bar, filter kategori/status, sort, pagination.
- Kartu buku: sampul, judul, penulis, badge ketersediaan.
- Skeleton loading, empty state, error state.

### Detail buku
- Sampul, metadata, deskripsi, kategori, ketersediaan.
- Tombol reservasi hanya bagi anggota yang memenuhi syarat.
- Jangan tampilkan informasi peminjam.

### Dashboard anggota
- Ringkasan pinjaman aktif, jatuh tempo terdekat, reservasi, dan denda.
- Daftar pinjaman dengan status dan tindakan yang tersedia.
- Riwayat dan notifikasi.

### Dashboard petugas
- Kartu statistik operasional dan tindakan cepat.
- Peminjaman/pengembalian dengan pencarian anggota dan barcode.
- Hasil validasi harus jelas dan mudah dipahami.

### Dashboard admin
- Statistik koleksi, sirkulasi, anggota, dan keterlambatan.
- Menu pengaturan, pengguna, laporan, dan audit log.

### Form dan tabel
- Label selalu terlihat; validasi inline.
- Konfirmasi untuk arsip, pembebasan denda, dan koreksi.
- Tabel mendukung pagination, sorting yang relevan, dan tampilan mobile yang tidak meluap.

## 8. Design System

- **Brand:** Librava.
- **Arah visual:** modern, minimal, ramah pendidikan, profesional.
- **Warna:** latar netral terang, teks kontras tinggi, satu warna utama konsisten, warna status semantik.
- **Tipografi:** sans-serif yang mudah dibaca; hierarki heading/body/label jelas.
- **Komponen:** button, input, select, badge, card, table, modal, toast, tabs, pagination, sidebar, topbar, empty state.
- **Spacing:** gunakan skala konsisten (misalnya kelipatan 4 atau 8).
- **Radius dan shadow:** halus dan konsisten; hindari efek berlebihan.
- **Responsif:** desktop sidebar; tablet sidebar ringkas; mobile drawer/bottom navigation sesuai kebutuhan.
- **Aksesibilitas:** fokus keyboard terlihat, label semantik, kontras memadai, dan status tidak bergantung pada warna saja.

## 9. Keamanan dan Validasi

- Hash password dengan algoritma bawaan framework yang aman.
- Lindungi session/cookie dengan `HttpOnly`, `Secure`, dan `SameSite` sesuai deployment.
- Terapkan CSRF protection bila menggunakan cookie session.
- Validasi dan sanitasi input di server; gunakan parameterized queries/ORM.
- Cegah IDOR dengan pemeriksaan kepemilikan dan role pada setiap resource.
- Batasi ukuran/tipe file sampul; simpan file di lokasi yang aman.
- Rate limit login dan endpoint sensitif.
- Jangan menampilkan stack trace atau secret pada respons production.
- Catat aktivitas sensitif tanpa menyimpan kredensial.
- Sediakan `.env.example`; jangan commit `.env`.

## 10. Testing

### Unit test
- Perhitungan jatuh tempo dan denda.
- Batas pinjaman dan perpanjangan.
- Validasi status eksemplar dan reservasi.

### Integration test
- Peminjaman atomik.
- Pengembalian dan pembentukan denda.
- Pembayaran dan pembebasan denda.
- Hak akses endpoint.
- Impor dan ekspor data.

### End-to-end minimum
1. Admin membuat buku dan eksemplar.
2. Admin/petugas membuat anggota.
3. Petugas meminjamkan eksemplar.
4. Anggota melihat pinjaman.
5. Petugas mengembalikan eksemplar.
6. Sistem menghitung denda bila terlambat.
7. Pengguna tanpa izin ditolak saat membuka endpoint admin.

## 11. Data Awal dan Impor

- Seed role dan aturan default yang dapat diubah.
- Data demo harus diberi label dan tidak dianggap data produksi.
- CSV impor menampilkan preview, jumlah baris valid/tidak valid, dan alasan kegagalan.
- Gunakan transaksi atau batch yang aman; jangan membuat data parsial tanpa laporan.
- Sediakan template CSV untuk buku, eksemplar, dan anggota.

## 12. Deployment dan Operasional

- Pisahkan konfigurasi development dan production.
- Jalankan migration dan seeder secara eksplisit.
- Sediakan backup terjadwal dan uji pemulihan.
- Gunakan HTTPS, log aplikasi, dan monitoring error.
- Sediakan instruksi instalasi, konfigurasi environment, migrasi, seeding, testing, dan build di README.

## 13. Tahapan Implementasi

1. **Audit proyek:** periksa stack, file, dependensi, dan fitur yang sudah ada; jangan menimpa tanpa alasan.
2. **Fondasi:** konfigurasi, database, autentikasi, role, layout, dan design system.
3. **Katalog:** buku, kategori, penulis, penerbit, eksemplar, pencarian.
4. **Anggota dan sirkulasi:** anggota, pinjam, kembali, perpanjangan.
5. **Reservasi dan denda:** antrean, notifikasi, pembayaran/pembebasan.
6. **Dashboard dan laporan:** ringkasan, filter, ekspor.
7. **Hardening:** audit log, validasi, aksesibilitas, keamanan, testing.
8. **Dokumentasi dan verifikasi:** README, env example, migration, tes alur utama.

Setiap tahap harus menghasilkan aplikasi yang dapat dijalankan dan diuji. Jangan membuat semua halaman hanya berupa mockup; hubungkan UI ke backend dan database sesuai fitur yang sudah diimplementasikan.

## 14. Instruksi untuk AI Coding Agent

- Baca `PRD.md` dan `SPEC.md` sebelum mengubah kode.
- Periksa proyek yang sudah ada dan laporkan stack serta struktur aktual secara singkat.
- Jika terdapat konflik antara dokumen dan kondisi proyek, pilih perubahan paling kecil dan jelaskan alasannya.
- Jangan menghapus data atau konfigurasi tanpa izin.
- Jangan mengarang integrasi eksternal atau mengklaim fitur selesai jika belum berjalan.
- Implementasikan bertahap, jalankan tes, perbaiki error, dan perbarui dokumentasi.
- Prioritaskan alur inti yang benar: katalog → anggota → pinjam → kembali → laporan.
- Gunakan data demo hanya untuk development dan beri penanda yang jelas.
- Pastikan desain tetap sederhana, konsisten, responsif, dan berbahasa Indonesia.
