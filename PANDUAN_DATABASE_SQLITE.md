# Panduan Database SQLite Librava

Database perpustakaan Librava kini telah dikonfigurasi dan diinisialisasi menggunakan **SQLite**.

---

## 1. File Database Siap Pakai

- 📦 **File Database Fisik**: [`librava.db`](./librava.db) *(File biner SQLite lokal yang sudah terisi data awal 16 buku dummy, member, sirkulasi, reservasi, denda, dan notifikasi)*.
- 📜 **Skrip Skema & Data**: [`schema.sqlite.sql`](./schema.sqlite.sql) *(Skrip SQL dialek SQLite lengkap jika ingin reset atau generate ulang).*

---

## 2. Cara Membuka & Mengelola di GUI Database

Anda dapat membuka file `librava.db` langsung tanpa memerlukan server lokal tambahan menggunakan:
1. **DB Browser for SQLite** (Aplikasi gratis paling populer untuk SQLite)
   - Buka aplikasi `DB Browser for SQLite` -> Klik **Open Database** -> Pilih `librava.db`.
2. **DBeaver / DataGrip / VS Code SQLite Extension**
   - Pilih driver **SQLite**, lalu arahkan file path ke `librava.db`.
3. **SQLite Studio**

---

## 3. Struktur Tabel yang Tersedia di `librava.db`

| Tabel | Jumlah Kolom | Keterangan |
|---|---|---|
| `books` | 17 | Data buku, cover asli Open Library, dan kode eksemplar fisik |
| `members` | 11 | Data anggota perpustakaan, status keanggotaan, barcode member |
| `loans` | 14 | Sirkulasi transaksi peminjaman, pengembalian, dan denda |
| `reservations` | 8 | Antrean reservasi buku oleh member |
| `fines` | 9 | Catatan tagihan denda keterlambatan |
| `notifications` | 9 | Log notifikasi sistem untuk Member, Petugas, dan Admin |

---

## 4. Reset Ulang Database (Jika Diperlukan)

Jika sewaktu-waktu ingin mengembalikan database ke kondisi awal dummy, jalankan perintah berikut di terminal:

```bash
node -e "const fs = require('fs'); const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('librava.db'); db.exec(fs.readFileSync('schema.sqlite.sql', 'utf8')); console.log('Database berhasil di-reset!');"
```

