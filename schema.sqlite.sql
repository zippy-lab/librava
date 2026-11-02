-- ==============================================================================
-- DATABASE PERPUSTAKAAN DIGITAL LIBRAVA
-- Dialek: SQLite (Kompatibel dengan SQLite Studio, DB Browser for SQLite, DBeaver, Node.js)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Bersihkan Tabel Lama jika Ingin Reset Bersih
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS fines;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS books;

-- ==============================================================================
-- 2. PEMBUATAN STRUKTUR TABEL
-- ==============================================================================

-- A. Tabel Buku (Books & Bibliografi)
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  isbn TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2024,
  category TEXT NOT NULL,
  call_number TEXT NOT NULL,
  shelf_location TEXT NOT NULL,
  description TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  color_bg TEXT DEFAULT '#E9ECFB',
  cover_image TEXT,
  copies TEXT, -- JSON array string berisi barcode unik per eksemplar
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_call_number ON books(call_number);

-- B. Tabel Anggota (Members)
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  member_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  class_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  joined_at TEXT DEFAULT (CURRENT_DATE),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_code ON members(member_code);
CREATE INDEX idx_members_status ON members(status);

-- C. Tabel Transaksi Sirkulasi (Loans: Peminjaman & Pengembalian)
CREATE TABLE loans (
  id TEXT PRIMARY KEY,
  loan_code TEXT NOT NULL UNIQUE,
  book_title TEXT NOT NULL,
  book_id TEXT,
  copy_code TEXT NOT NULL,
  member_code TEXT NOT NULL,
  member_name TEXT NOT NULL,
  borrowed_at TEXT NOT NULL,
  due_date TEXT NOT NULL,
  returned_at TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'returned', 'overdue')),
  days_overdue INTEGER NOT NULL DEFAULT 0,
  fine_amount REAL NOT NULL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
  FOREIGN KEY (member_code) REFERENCES members(member_code) ON DELETE CASCADE
);

CREATE INDEX idx_loans_member_code ON loans(member_code);
CREATE INDEX idx_loans_copy_code ON loans(copy_code);
CREATE INDEX idx_loans_status ON loans(status);

-- D. Tabel Reservasi Buku (Reservations)
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  book_title TEXT NOT NULL,
  book_category TEXT,
  member_code TEXT NOT NULL,
  member_name TEXT NOT NULL,
  reserved_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK(status IN ('menunggu', 'siap_diambil', 'selesai', 'dibatalkan')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_member ON reservations(member_code);
CREATE INDEX idx_reservations_status ON reservations(status);

-- E. Tabel Denda & Keterlambatan (Fines)
CREATE TABLE fines (
  id TEXT PRIMARY KEY,
  member_code TEXT NOT NULL,
  member_name TEXT NOT NULL,
  book_title TEXT NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'belum_dibayar' CHECK(status IN ('belum_dibayar', 'lunas')),
  paid_at TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fines_member ON fines(member_code);
CREATE INDEX idx_fines_status ON fines(status);

-- F. Tabel Notifikasi Pengguna (Notifications)
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  recipient_role TEXT NOT NULL CHECK(recipient_role IN ('member', 'librarian', 'admin', 'all')),
  recipient_code TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp_label TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'circulation',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_recipient ON notifications(recipient_role, recipient_code);
CREATE INDEX idx_notif_read ON notifications(is_read);

-- ==============================================================================
-- 3. DATA AWAL LENGKAP (SEED DATA 16 BUKU, COVER ASLI, MEMBER, & TRANSAKSI)
-- ==============================================================================

INSERT INTO books (id, isbn, title, author, publisher, year, category, call_number, shelf_location, description, total_copies, available_copies, color_bg, cover_image, copies) VALUES
('b1', '978-602-03-0301-7', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, 'Fiksi', '813 HIR l', 'Rak F-01', 'Kisah inspiratif tentang 10 anak di Belitung yang berjuang menggapai mimpi dan cita-cita dalam keterbatasan di bawah bimbingan Bu Muslimah.', 3, 2, '#DCE1F8', 'https://covers.openlibrary.org/b/id/7079796-M.jpg', '[{"copyCode":"LIB-B01-C01","status":"dipinjam"},{"copyCode":"LIB-B01-C02","status":"tersedia"},{"copyCode":"LIB-B01-C03","status":"tersedia"}]'),
('b2', '978-979-97312-3-4', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, 'Sejarah', '899.221 TOE b', 'Rak S-01', 'Mahakarya roman sejarah awal abad ke-20 dengan tokoh utama Minke yang memperjuangkan keadilan dan harkat bangsa pribumi.', 2, 1, '#F7E1D4', 'https://covers.openlibrary.org/b/id/6643692-M.jpg', '[{"copyCode":"LIB-B02-C01","status":"dipinjam"},{"copyCode":"LIB-B02-C02","status":"tersedia"}]'),
('b3', '978-602-441-020-9', 'Sapiens: Riwayat Singkat Umat Manusia', 'Yuval Noah Harari', 'KPG (Kepustakaan Populer Gramedia)', 2014, 'Sains', '909 HAR s', 'Rak SN-01', 'Penjelajahan mendalam sejarah evolusi manusia, mulai dari revolusi kognitif, pertanian, hingga era kecerdasan buatan.', 2, 2, '#D6EEE3', 'https://covers.openlibrary.org/b/id/8634250-M.jpg', '[{"copyCode":"LIB-B03-C01","status":"tersedia"},{"copyCode":"LIB-B03-C02","status":"tersedia"}]'),
('b4', '978-602-06-3317-6', 'Matematika Dasar SMA Kelas XI', 'Dr. Sukirman, M.Si', 'Erlangga', 2022, 'Pelajaran', '510 SUK m', 'Rak P-01', 'Buku pelajaran kurikulum nasional mengenai matriks, trigonometri, limit fungsi, turunan aljabar, dan integral.', 9, 8, '#E9ECFB', 'https://covers.openlibrary.org/b/id/7401785-M.jpg', '[{"copyCode":"LIB-B04-C01","status":"dipinjam"},{"copyCode":"LIB-B04-C02","status":"tersedia"},{"copyCode":"LIB-B04-C03","status":"tersedia"},{"copyCode":"LIB-B04-C04","status":"tersedia"},{"copyCode":"LIB-B04-C05","status":"tersedia"},{"copyCode":"LIB-B04-C06","status":"tersedia"},{"copyCode":"LIB-B04-C07","status":"tersedia"},{"copyCode":"LIB-B04-C08","status":"tersedia"},{"copyCode":"LIB-B04-C09","status":"tersedia"}]'),
('b5', '978-979-22-4861-6', 'Negeri 5 Menara', 'Ahmad Fuadi', 'Gramedia Pustaka Utama', 2009, 'Fiksi', '813 FUA n', 'Rak F-02', 'Perjalanan 6 santri dari berbagai pelosok nusantara di Pondok Madani dengan filosofi pembangkit tekad: Man Jadda Wajada.', 3, 3, '#FEF3C7', 'https://covers.openlibrary.org/b/id/14303993-M.jpg', '[{"copyCode":"LIB-B05-C01","status":"tersedia"},{"copyCode":"LIB-B05-C02","status":"tersedia"},{"copyCode":"LIB-B05-C03","status":"tersedia"}]'),
('b6', '978-602-03-8594-5', 'Filosofi Teras', 'Henry Manampiring', 'Kompas Gramedia', 2018, 'Sains', '188 MAN f', 'Rak SN-02', 'Penerapan praktis filsafat stoisisme kuno untuk meredakan kecemasan, mengontrol emosi, dan memperkuat resiliensi mental modern.', 4, 4, '#FDF0D8', 'https://covers.openlibrary.org/b/id/15255806-M.jpg', '[{"copyCode":"LIB-B06-C01","status":"tersedia"},{"copyCode":"LIB-B06-C02","status":"tersedia"},{"copyCode":"LIB-B06-C03","status":"tersedia"},{"copyCode":"LIB-B06-C04","status":"tersedia"}]'),
('b7', '978-602-424-694-5', 'Laut Bercerita', 'Leila S. Chudori', 'KPG', 2017, 'Fiksi', '813 CHU l', 'Rak F-03', 'Kisah haru tentang persahabatan, kekeluargaan, cinta, dan kehilangan aktivis mahasiswa di era 1998 yang tak pernah kembali pulang.', 2, 2, '#E0F2FE', 'https://covers.openlibrary.org/b/id/10648285-M.jpg', '[{"copyCode":"LIB-B07-C01","status":"tersedia"},{"copyCode":"LIB-B07-C02","status":"tersedia"}]'),
('b8', '978-979-421-420-6', 'Sejarah Indonesia Modern', 'M.C. Ricklefs', 'Gadjah Mada University Press', 2008, 'Sejarah', '959.8 RIC s', 'Rak S-02', 'Kajian komprehensif sejarah kepulauan Nusantara sejak penetrasi Islam c. 1200 hingga pembentukan Indonesia kontemporer.', 3, 3, '#EDE9FE', 'https://covers.openlibrary.org/b/id/577988-M.jpg', '[{"copyCode":"LIB-B08-C01","status":"tersedia"},{"copyCode":"LIB-B08-C02","status":"tersedia"},{"copyCode":"LIB-B08-C03","status":"tersedia"}]'),
('b9', '978-602-298-615-7', 'Fisika untuk SMA Kelas X', 'Marthen Kanginan', 'Erlangga', 2021, 'Pelajaran', '530 KAN f', 'Rak P-02', 'Panduan belajar kinematika gerak, hukum newton gravitasi, fluida statis, serta usaha dan energi mekanik berstandar kurikulum nasional.', 5, 5, '#FCE7F3', 'https://covers.openlibrary.org/b/id/7065516-M.jpg', '[{"copyCode":"LIB-B09-C01","status":"tersedia"},{"copyCode":"LIB-B09-C02","status":"tersedia"},{"copyCode":"LIB-B09-C03","status":"tersedia"},{"copyCode":"LIB-B09-C04","status":"tersedia"},{"copyCode":"LIB-B09-C05","status":"tersedia"}]'),
('b10', '978-602-434-118-3', 'Biologi SMA Kelas XI', 'Irnaningtyas', 'Erlangga', 2022, 'Pelajaran', '570 IRN b', 'Rak P-03', 'Materi struktur jaringan tumbuhan dan hewan, sistem sirkulasi darah, pencernaan, respirasi, ekskresi, serta koordinasi tubuh manusia.', 4, 4, '#DCFCE7', 'https://covers.openlibrary.org/b/id/581911-M.jpg', '[{"copyCode":"LIB-B10-C01","status":"tersedia"},{"copyCode":"LIB-B10-C02","status":"tersedia"},{"copyCode":"LIB-B10-C03","status":"tersedia"},{"copyCode":"LIB-B10-C04","status":"tersedia"}]'),
('b11', '978-602-06-3318-3', 'Atomic Habits', 'James Clear', 'Gramedia Pustaka Utama', 2019, 'Sains', '158.1 CLE a', 'Rak SN-03', 'Cara mudah dan terbukti membentuk kebiasaan baik serta membuang kebiasaan buruk dengan memanfaatkan kekuatan perubahan 1% setiap hari.', 3, 3, '#FFEDD5', 'https://covers.openlibrary.org/b/id/12539702-M.jpg', '[{"copyCode":"LIB-B11-C01","status":"tersedia"},{"copyCode":"LIB-B11-C02","status":"tersedia"},{"copyCode":"LIB-B11-C03","status":"tersedia"}]'),
('b12', '978-602-03-3295-6', 'Bumi', 'Tere Liye', 'Gramedia Pustaka Utama', 2014, 'Fiksi', '813 LIY b', 'Rak F-04', 'Awal petualangan fantasi Raib, Seli, dan Ali menjelajahi dunia paralel Klan Bulan dengan kekuatan unik warisan leluhur mereka.', 2, 2, '#E2E8F0', 'https://covers.openlibrary.org/b/id/12810708-M.jpg', '[{"copyCode":"LIB-B12-C01","status":"tersedia"},{"copyCode":"LIB-B12-C02","status":"tersedia"}]'),
('b13', '978-979-910-852-4', 'Sejarah Dunia yang Disembunyikan', 'Jonathan Black', 'Pustaka Alvabet', 2015, 'Sejarah', '900 BLA s', 'Rak S-03', 'Menyingkap misteri dan tradisi esoteris dunia kuno, filsuf misterius, hingga peradaban masa lampau yang jarang tertulis di buku teks standar.', 2, 2, '#F3E8FF', 'https://covers.openlibrary.org/b/id/11129803-M.jpg', '[{"copyCode":"LIB-B13-C01","status":"tersedia"},{"copyCode":"LIB-B13-C02","status":"tersedia"}]'),
('b14', '978-602-298-618-8', 'Kimia untuk SMA Kelas XII', 'Michael Purba', 'Erlangga', 2021, 'Pelajaran', '540 PUR k', 'Rak P-04', 'Eksplorasi sifat koligatif larutan, reaksi redoks dan elektrokimia, senyawa karbon turunan alkana, serta kimia unsur golongan utama.', 4, 4, '#CFFAFE', 'https://covers.openlibrary.org/b/id/9407725-M.jpg', '[{"copyCode":"LIB-B14-C01","status":"tersedia"},{"copyCode":"LIB-B14-C02","status":"tersedia"},{"copyCode":"LIB-B14-C03","status":"tersedia"},{"copyCode":"LIB-B14-C04","status":"tersedia"}]'),
('b15', '978-979-96257-8-6', 'Filosofi Kopi', 'Dee Lestari', 'Truedee Books & Bentang', 2006, 'Fiksi', '813 LES f', 'Rak F-05', 'Kumpulan cerita pendek tentang Ben dan Jody yang meracik kopi terbaik Tiwus serta filosofi makna hidup yang terselip di tiap cangkir.', 3, 3, '#FEF08A', 'https://covers.openlibrary.org/b/id/11181518-M.jpg', '[{"copyCode":"LIB-B15-C01","status":"tersedia"},{"copyCode":"LIB-B15-C02","status":"tersedia"},{"copyCode":"LIB-B15-C03","status":"tersedia"}]'),
('b16', '978-602-03-3450-9', 'Ensiklopedia Sains', 'Tim Penerbit', 'Lentera Abadi', 2020, 'Sains', '503 TIM e', 'Rak SN-05', 'Referensi komprehensif bergambar mencakup astronomi tata surya, energi terbarukan, anatomi manusia, hingga fenomena iklim global bumi.', 5, 5, '#CCFBF1', 'https://covers.openlibrary.org/b/id/11797353-M.jpg', '[{"copyCode":"LIB-B16-C01","status":"tersedia"},{"copyCode":"LIB-B16-C02","status":"tersedia"},{"copyCode":"LIB-B16-C03","status":"tersedia"},{"copyCode":"LIB-B16-C04","status":"tersedia"},{"copyCode":"LIB-B16-C05","status":"tersedia"}]');

INSERT INTO members (id, member_code, name, email, class_name, phone, address, joined_at, status) VALUES
('m1', 'MBR-A001', 'Rani Maharani', 'rani@siswa.sch.id', 'XII IPA 1', '081234567890', 'Jl. Merdeka No. 12, Bandung', '2024-07-15', 'active'),
('m2', 'MBR-A002', 'Budi Santoso', 'budi@siswa.sch.id', 'XI IPS 2', '081298765432', 'Jl. Diponegoro No. 45, Bandung', '2025-01-10', 'active'),
('m3', 'MBR-A003', 'Siti Nurhaliza', 'siti@siswa.sch.id', 'X MIPA 3', '085712341234', 'Jl. Cihampelas No. 88, Bandung', '2025-07-20', 'suspended'),
('m4', 'MBR-A004', 'Ahmad Fauzi', 'ahmad@guru.sch.id', 'Guru Bahasa', '081344556677', 'Komplek Guru No. 3, Bandung', '2023-08-01', 'active');

INSERT INTO loans (id, loan_code, book_title, book_id, copy_code, member_code, member_name, borrowed_at, due_date, returned_at, status, days_overdue, fine_amount) VALUES
('l1', 'PJ-2026-001', 'Bumi Manusia', 'b2', 'LIB-B02-C01', 'MBR-A002', 'Budi Santoso', '2026-10-20', '2026-10-27', NULL, 'overdue', 6, 6000.0),
('l2', 'PJ-2026-002', 'Laskar Pelangi', 'b1', 'LIB-B01-C01', 'MBR-A001', 'Rani Maharani', '2026-10-26', '2026-11-09', NULL, 'active', 0, 0.0),
('l3', 'PJ-2026-003', 'Matematika Dasar SMA Kelas XI', 'b4', 'LIB-B04-C01', 'MBR-A001', 'Rani Maharani', '2026-10-26', '2026-11-02', NULL, 'active', 0, 0.0);

INSERT INTO reservations (id, book_title, book_category, member_code, member_name, reserved_at, status) VALUES
('r1', 'Bumi Manusia', 'Sejarah', 'MBR-A001', 'Rani Maharani', '2026-10-29', 'siap_diambil'),
('r2', 'Sapiens: Riwayat Singkat Umat Manusia', 'Sains', 'MBR-A003', 'Siti Nurhaliza', '2026-10-30', 'menunggu');

INSERT INTO fines (id, member_code, member_name, book_title, days_overdue, amount, status, paid_at) VALUES
('f1', 'MBR-A002', 'Budi Santoso', 'Bumi Manusia', 6, 6000.0, 'belum_dibayar', NULL),
('f2', 'MBR-A003', 'Siti Nurhaliza', 'Filosofi Teras', 2, 2000.0, 'lunas', '2026-10-29');

INSERT INTO notifications (id, recipient_role, recipient_code, title, message, timestamp_label, is_read, type) VALUES
('notif-m1', 'member', 'MBR-A001', 'Buku Siap Diambil!', 'Reservasi buku "Bumi Manusia" sudah disiapkan petugas. Silakan ambil di meja sirkulasi.', '10 menit yang lalu', 0, 'reservation'),
('notif-m2', 'member', 'MBR-A001', 'Pengingat Jatuh Tempo Hari Ini', 'Buku "Matematika Dasar SMA Kelas XI" jatuh tempo hari ini (2 Nov 2026). Perpanjang atau kembalikan tepat waktu.', '1 jam yang lalu', 0, 'due'),
('notif-p1', 'librarian', 'P01', 'Peminjaman Melewati Batas Tempo', 'Buku "Bumi Manusia" oleh Budi Santoso terlambat 6 hari. Denda berjalan: Rp 6.000.', '2 jam yang lalu', 0, 'fine'),
('notif-p2', 'librarian', 'P01', 'Permintaan Reservasi Baru', 'Siti Nurhaliza mengajukan reservasi "Sapiens: Riwayat Singkat Umat Manusia".', '1 hari yang lalu', 0, 'reservation');

