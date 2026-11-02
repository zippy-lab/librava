# Panduan Import Database Librava (MySQL / phpMyAdmin / SQL Lab)

File database lengkap telah dibuat pada file: **[`database.sql`](./database.sql)**.

Skrip ini kompatibel 100% dengan:
- **phpMyAdmin** (XAMPP / Laragon / cPanel)
- **MySQL Workbench**
- **DBeaver / HeidiSQL / Navicat**
- **Terminal CLI MySQL**

---

## Cara Menjalankan di phpMyAdmin (SQL Lab)

1. Buka browser dan masuk ke **phpMyAdmin** (biasanya di `http://localhost/phpmyadmin`).
2. Klik tab **SQL** pada menu navigasi atas.
3. Buka file [`database.sql`](./database.sql), salin (**Copy**) seluruh isinya.
4. Tempel (**Paste**) ke area query SQL phpMyAdmin.
5. Klik tombol **Kirim / Go** di pojok kanan bawah.

> Database `librava_db` beserta 6 tabel utama dan seluruh 16 data buku dummy (termasuk cover URL dan kode barcode eksemplar) akan dibuat secara otomatis.

---

## Alternatif: Import File Langsung

1. Pada phpMyAdmin, klik tab **Impor (Import)**.
2. Klik tombol **Pilih Berkas / Browse** lalu arahkan ke file `database.sql`.
3. Klik tombol **Kirim / Go** di bagian bawah halaman.

---

## Alternatif: Via Terminal / Command Prompt

Jika menggunakan MySQL via command prompt / bash:

```bash
mysql -u root -p < database.sql
```

---

## Ringkasan Struktur Tabel yang Dibuat

| Nama Tabel | Deskripsi |
|---|---|
| `books` | Data bibliografi buku, cover URL, dan array eksemplar (`copies` JSON) |
| `members` | Data anggota (Siswa/Guru), status akun, dan barcode member |
| `loans` | Transaksi sirkulasi peminjaman, pengembalian, status overdue, dan denda |
| `reservations` | Antrean pemesanan/reservasi buku oleh member |
| `fines` | Pencatatan riwayat denda dan status pelunasan |
| `notifications` | Sistem notifikasi terintegrasi untuk Admin, Petugas, dan Member |

