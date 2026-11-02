import React, { useState, useEffect, useRef } from 'react';
import { BarcodeItem, BarcodeScannerModal } from './components/BarcodeComponents';
import { LabelPreviewModal, type CopyLabelData } from './components/BookLabelComponents';
import { BookCover } from './components/BookCover';

// Data Interfaces
export interface CopyItem {
  copyCode: string; // Barcode unik per eksemplar, misal: 'LIB-B01-C01'
  status: 'tersedia' | 'dipinjam' | 'rusak';
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  callNumber: string;
  shelfLocation: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  colorBg: string;
  coverImage?: string;
  copies: CopyItem[]; // Barcode unik setiap eksemplar buku
}

export interface Member {
  id: string;
  memberCode: string; // Barcode unik member, misal: 'MBR-A001'
  name: string;
  email: string;
  className: string;
  phone: string;
  address: string;
  joinedAt: string;
  status: 'active' | 'suspended' | 'inactive';
}

export interface Loan {
  id: string;
  loanCode: string;
  bookTitle: string;
  bookId: string;
  copyCode: string;
  memberCode: string;
  memberName: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue';
  daysOverdue?: number;
  fineAmount?: number;
}

export interface Reservation {
  id: string;
  bookTitle: string;
  bookCategory?: string;
  memberCode: string;
  memberName: string;
  reservedAt: string;
  status: 'menunggu' | 'siap_diambil' | 'selesai' | 'dibatalkan';
}

export interface Fine {
  id: string;
  memberCode: string;
  memberName: string;
  bookTitle: string;
  daysOverdue: number;
  amount: number;
  status: 'belum_dibayar' | 'lunas';
  paidAt?: string;
}

export interface AppNotification {
  id: string;
  recipientRole: 'member' | 'librarian' | 'admin' | 'all';
  recipientCode?: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'circulation' | 'due' | 'fine' | 'stock' | 'system' | 'reservation';
}

// Initial Mock Data (16 Buku Sesuai Ketentuan Tabel Spesifikasi)
const INITIAL_BOOKS: Book[] = [
  {
    id: 'b1',
    isbn: '978-602-03-0301-7',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    publisher: 'Bentang Pustaka',
    year: 2005,
    category: 'Fiksi',
    callNumber: '813 HIR l',
    shelfLocation: 'Rak F-01',
    description: 'Kisah inspiratif tentang 10 anak di Belitung yang berjuang menggapai mimpi dan cita-cita dalam keterbatasan di bawah bimbingan Bu Muslimah.',
    totalCopies: 3,
    availableCopies: 2,
    colorBg: '#DCE1F8',
    coverImage: 'https://covers.openlibrary.org/b/id/7079796-M.jpg',
    copies: [
      { copyCode: 'LIB-B01-C01', status: 'dipinjam' },
      { copyCode: 'LIB-B01-C02', status: 'tersedia' },
      { copyCode: 'LIB-B01-C03', status: 'tersedia' }
    ]
  },
  {
    id: 'b2',
    isbn: '978-979-97312-3-4',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    publisher: 'Hasta Mitra',
    year: 1980,
    category: 'Sejarah',
    callNumber: '899.221 TOE b',
    shelfLocation: 'Rak S-01',
    description: 'Mahakarya roman sejarah awal abad ke-20 dengan tokoh utama Minke yang memperjuangkan keadilan dan harkat bangsa pribumi.',
    totalCopies: 2,
    availableCopies: 1,
    colorBg: '#F7E1D4',
    coverImage: 'https://covers.openlibrary.org/b/id/6643692-M.jpg',
    copies: [
      { copyCode: 'LIB-B02-C01', status: 'dipinjam' },
      { copyCode: 'LIB-B02-C02', status: 'tersedia' }
    ]
  },
  {
    id: 'b3',
    isbn: '978-602-441-020-9',
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    publisher: 'KPG (Kepustakaan Populer Gramedia)',
    year: 2014,
    category: 'Sains',
    callNumber: '909 HAR s',
    shelfLocation: 'Rak SN-01',
    description: 'Penjelajahan mendalam sejarah evolusi manusia, mulai dari revolusi kognitif, pertanian, hingga era kecerdasan buatan.',
    totalCopies: 2,
    availableCopies: 2,
    colorBg: '#D6EEE3',
    coverImage: 'https://covers.openlibrary.org/b/id/8634250-M.jpg',
    copies: [
      { copyCode: 'LIB-B03-C01', status: 'tersedia' },
      { copyCode: 'LIB-B03-C02', status: 'tersedia' }
    ]
  },
  {
    id: 'b4',
    isbn: '978-602-06-3317-6',
    title: 'Matematika Dasar SMA Kelas XI',
    author: 'Dr. Sukirman, M.Si',
    publisher: 'Erlangga',
    year: 2022,
    category: 'Pelajaran',
    callNumber: '510 SUK m',
    shelfLocation: 'Rak P-01',
    description: 'Buku pelajaran kurikulum nasional mengenai matriks, trigonometri, limit fungsi, turunan aljabar, dan integral.',
    totalCopies: 9,
    availableCopies: 8,
    colorBg: '#E9ECFB',
    coverImage: 'https://covers.openlibrary.org/b/id/7401785-M.jpg',
    copies: [
      { copyCode: 'LIB-B04-C01', status: 'dipinjam' },
      { copyCode: 'LIB-B04-C02', status: 'tersedia' },
      { copyCode: 'LIB-B04-C03', status: 'tersedia' },
      { copyCode: 'LIB-B04-C04', status: 'tersedia' },
      { copyCode: 'LIB-B04-C05', status: 'tersedia' },
      { copyCode: 'LIB-B04-C06', status: 'tersedia' },
      { copyCode: 'LIB-B04-C07', status: 'tersedia' },
      { copyCode: 'LIB-B04-C08', status: 'tersedia' },
      { copyCode: 'LIB-B04-C09', status: 'tersedia' }
    ]
  },
  {
    id: 'b5',
    isbn: '978-979-22-4861-6',
    title: 'Negeri 5 Menara',
    author: 'Ahmad Fuadi',
    publisher: 'Gramedia Pustaka Utama',
    year: 2009,
    category: 'Fiksi',
    callNumber: '813 FUA n',
    shelfLocation: 'Rak F-02',
    description: 'Perjalanan 6 santri dari berbagai pelosok nusantara di Pondok Madani dengan filosofi pembangkit tekad: Man Jadda Wajada.',
    totalCopies: 3,
    availableCopies: 3,
    colorBg: '#FEF3C7',
    coverImage: 'https://covers.openlibrary.org/b/id/14303993-M.jpg',
    copies: [
      { copyCode: 'LIB-B05-C01', status: 'tersedia' },
      { copyCode: 'LIB-B05-C02', status: 'tersedia' },
      { copyCode: 'LIB-B05-C03', status: 'tersedia' }
    ]
  },
  {
    id: 'b6',
    isbn: '978-602-03-8594-5',
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    publisher: 'Kompas Gramedia',
    year: 2018,
    category: 'Sains',
    callNumber: '188 MAN f',
    shelfLocation: 'Rak SN-02',
    description: 'Penerapan praktis filsafat stoisisme kuno untuk meredakan kecemasan, mengontrol emosi, dan memperkuat resiliensi mental modern.',
    totalCopies: 4,
    availableCopies: 4,
    colorBg: '#FDF0D8',
    coverImage: 'https://covers.openlibrary.org/b/id/15255806-M.jpg',
    copies: [
      { copyCode: 'LIB-B06-C01', status: 'tersedia' },
      { copyCode: 'LIB-B06-C02', status: 'tersedia' },
      { copyCode: 'LIB-B06-C03', status: 'tersedia' },
      { copyCode: 'LIB-B06-C04', status: 'tersedia' }
    ]
  },
  {
    id: 'b7',
    isbn: '978-602-424-694-5',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    publisher: 'KPG',
    year: 2017,
    category: 'Fiksi',
    callNumber: '813 CHU l',
    shelfLocation: 'Rak F-03',
    description: 'Kisah haru tentang persahabatan, kekeluargaan, cinta, dan kehilangan aktivis mahasiswa di era 1998 yang tak pernah kembali pulang.',
    totalCopies: 2,
    availableCopies: 2,
    colorBg: '#E0F2FE',
    coverImage: 'https://covers.openlibrary.org/b/id/10648285-M.jpg',
    copies: [
      { copyCode: 'LIB-B07-C01', status: 'tersedia' },
      { copyCode: 'LIB-B07-C02', status: 'tersedia' }
    ]
  },
  {
    id: 'b8',
    isbn: '978-979-421-420-6',
    title: 'Sejarah Indonesia Modern',
    author: 'M.C. Ricklefs',
    publisher: 'Gadjah Mada University Press',
    year: 2008,
    category: 'Sejarah',
    callNumber: '959.8 RIC s',
    shelfLocation: 'Rak S-02',
    description: 'Kajian komprehensif sejarah kepulauan Nusantara sejak penetrasi Islam c. 1200 hingga pembentukan Indonesia kontemporer.',
    totalCopies: 3,
    availableCopies: 3,
    colorBg: '#EDE9FE',
    coverImage: 'https://covers.openlibrary.org/b/id/577988-M.jpg',
    copies: [
      { copyCode: 'LIB-B08-C01', status: 'tersedia' },
      { copyCode: 'LIB-B08-C02', status: 'tersedia' },
      { copyCode: 'LIB-B08-C03', status: 'tersedia' }
    ]
  },
  {
    id: 'b9',
    isbn: '978-602-298-615-7',
    title: 'Fisika untuk SMA Kelas X',
    author: 'Marthen Kanginan',
    publisher: 'Erlangga',
    year: 2021,
    category: 'Pelajaran',
    callNumber: '530 KAN f',
    shelfLocation: 'Rak P-02',
    description: 'Panduan belajar kinematika gerak, hukum newton gravitasi, fluida statis, serta usaha dan energi mekanik berstandar kurikulum nasional.',
    totalCopies: 5,
    availableCopies: 5,
    colorBg: '#FCE7F3',
    coverImage: 'https://covers.openlibrary.org/b/id/7065516-M.jpg',
    copies: [
      { copyCode: 'LIB-B09-C01', status: 'tersedia' },
      { copyCode: 'LIB-B09-C02', status: 'tersedia' },
      { copyCode: 'LIB-B09-C03', status: 'tersedia' },
      { copyCode: 'LIB-B09-C04', status: 'tersedia' },
      { copyCode: 'LIB-B09-C05', status: 'tersedia' }
    ]
  },
  {
    id: 'b10',
    isbn: '978-602-434-118-3',
    title: 'Biologi SMA Kelas XI',
    author: 'Irnaningtyas',
    publisher: 'Erlangga',
    year: 2022,
    category: 'Pelajaran',
    callNumber: '570 IRN b',
    shelfLocation: 'Rak P-03',
    description: 'Materi struktur jaringan tumbuhan dan hewan, sistem sirkulasi darah, pencernaan, respirasi, ekskresi, serta koordinasi tubuh manusia.',
    totalCopies: 4,
    availableCopies: 4,
    colorBg: '#DCFCE7',
    coverImage: 'https://covers.openlibrary.org/b/id/581911-M.jpg',
    copies: [
      { copyCode: 'LIB-B10-C01', status: 'tersedia' },
      { copyCode: 'LIB-B10-C02', status: 'tersedia' },
      { copyCode: 'LIB-B10-C03', status: 'tersedia' },
      { copyCode: 'LIB-B10-C04', status: 'tersedia' }
    ]
  },
  {
    id: 'b11',
    isbn: '978-602-06-3318-3',
    title: 'Atomic Habits',
    author: 'James Clear',
    publisher: 'Gramedia Pustaka Utama',
    year: 2019,
    category: 'Sains',
    callNumber: '158.1 CLE a',
    shelfLocation: 'Rak SN-03',
    description: 'Cara mudah dan terbukti membentuk kebiasaan baik serta membuang kebiasaan buruk dengan memanfaatkan kekuatan perubahan 1% setiap hari.',
    totalCopies: 3,
    availableCopies: 3,
    colorBg: '#FFEDD5',
    coverImage: 'https://covers.openlibrary.org/b/id/12539702-M.jpg',
    copies: [
      { copyCode: 'LIB-B11-C01', status: 'tersedia' },
      { copyCode: 'LIB-B11-C02', status: 'tersedia' },
      { copyCode: 'LIB-B11-C03', status: 'tersedia' }
    ]
  },
  {
    id: 'b12',
    isbn: '978-602-03-3295-6',
    title: 'Bumi',
    author: 'Tere Liye',
    publisher: 'Gramedia Pustaka Utama',
    year: 2014,
    category: 'Fiksi',
    callNumber: '813 LIY b',
    shelfLocation: 'Rak F-04',
    description: 'Awal petualangan fantasi Raib, Seli, dan Ali menjelajahi dunia paralel Klan Bulan dengan kekuatan unik warisan leluhur mereka.',
    totalCopies: 2,
    availableCopies: 2,
    colorBg: '#E2E8F0',
    coverImage: 'https://covers.openlibrary.org/b/id/12810708-M.jpg',
    copies: [
      { copyCode: 'LIB-B12-C01', status: 'tersedia' },
      { copyCode: 'LIB-B12-C02', status: 'tersedia' }
    ]
  },
  {
    id: 'b13',
    isbn: '978-979-910-852-4',
    title: 'Sejarah Dunia yang Disembunyikan',
    author: 'Jonathan Black',
    publisher: 'Pustaka Alvabet',
    year: 2015,
    category: 'Sejarah',
    callNumber: '900 BLA s',
    shelfLocation: 'Rak S-03',
    description: 'Menyingkap misteri dan tradisi esoteris dunia kuno, filsuf misterius, hingga peradaban masa lampau yang jarang tertulis di buku teks standar.',
    totalCopies: 2,
    availableCopies: 2,
    colorBg: '#F3E8FF',
    coverImage: 'https://covers.openlibrary.org/b/id/11129803-M.jpg',
    copies: [
      { copyCode: 'LIB-B13-C01', status: 'tersedia' },
      { copyCode: 'LIB-B13-C02', status: 'tersedia' }
    ]
  },
  {
    id: 'b14',
    isbn: '978-602-298-618-8',
    title: 'Kimia untuk SMA Kelas XII',
    author: 'Michael Purba',
    publisher: 'Erlangga',
    year: 2021,
    category: 'Pelajaran',
    callNumber: '540 PUR k',
    shelfLocation: 'Rak P-04',
    description: 'Eksplorasi sifat koligatif larutan, reaksi redoks dan elektrokimia, senyawa karbon turunan alkana, serta kimia unsur golongan utama.',
    totalCopies: 4,
    availableCopies: 4,
    colorBg: '#CFFAFE',
    coverImage: 'https://covers.openlibrary.org/b/id/9407725-M.jpg',
    copies: [
      { copyCode: 'LIB-B14-C01', status: 'tersedia' },
      { copyCode: 'LIB-B14-C02', status: 'tersedia' },
      { copyCode: 'LIB-B14-C03', status: 'tersedia' },
      { copyCode: 'LIB-B14-C04', status: 'tersedia' }
    ]
  },
  {
    id: 'b15',
    isbn: '978-979-96257-8-6',
    title: 'Filosofi Kopi',
    author: 'Dee Lestari',
    publisher: 'Truedee Books & Bentang',
    year: 2006,
    category: 'Fiksi',
    callNumber: '813 LES f',
    shelfLocation: 'Rak F-05',
    description: 'Kumpulan cerita pendek tentang Ben dan Jody yang meracik kopi terbaik Tiwus serta filosofi makna hidup yang terselip di tiap cangkir.',
    totalCopies: 3,
    availableCopies: 3,
    colorBg: '#FEF08A',
    coverImage: 'https://covers.openlibrary.org/b/id/11181518-M.jpg',
    copies: [
      { copyCode: 'LIB-B15-C01', status: 'tersedia' },
      { copyCode: 'LIB-B15-C02', status: 'tersedia' },
      { copyCode: 'LIB-B15-C03', status: 'tersedia' }
    ]
  },
  {
    id: 'b16',
    isbn: '978-602-03-3450-9',
    title: 'Ensiklopedia Sains',
    author: 'Tim Penerbit',
    publisher: 'Lentera Abadi',
    year: 2020,
    category: 'Sains',
    callNumber: '503 TIM e',
    shelfLocation: 'Rak SN-05',
    description: 'Referensi komprehensif bergambar mencakup astronomi tata surya, energi terbarukan, anatomi manusia, hingga fenomena iklim global bumi.',
    totalCopies: 5,
    availableCopies: 5,
    colorBg: '#CCFBF1',
    coverImage: 'https://covers.openlibrary.org/b/id/11797353-M.jpg',
    copies: [
      { copyCode: 'LIB-B16-C01', status: 'tersedia' },
      { copyCode: 'LIB-B16-C02', status: 'tersedia' },
      { copyCode: 'LIB-B16-C03', status: 'tersedia' },
      { copyCode: 'LIB-B16-C04', status: 'tersedia' },
      { copyCode: 'LIB-B16-C05', status: 'tersedia' }
    ]
  }
];

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', memberCode: 'MBR-A001', name: 'Rani Maharani', email: 'rani@siswa.sch.id', className: 'XII IPA 1', phone: '081234567890', address: 'Jl. Merdeka No. 12, Bandung', joinedAt: '2024-07-15', status: 'active' },
  { id: 'm2', memberCode: 'MBR-A002', name: 'Budi Santoso', email: 'budi@siswa.sch.id', className: 'XI IPS 2', phone: '081298765432', address: 'Jl. Diponegoro No. 45, Bandung', joinedAt: '2025-01-10', status: 'active' },
  { id: 'm3', memberCode: 'MBR-A003', name: 'Siti Nurhaliza', email: 'siti@siswa.sch.id', className: 'X MIPA 3', phone: '085712341234', address: 'Jl. Cihampelas No. 88, Bandung', joinedAt: '2025-07-20', status: 'suspended' },
  { id: 'm4', memberCode: 'MBR-A004', name: 'Ahmad Fauzi', email: 'ahmad@guru.sch.id', className: 'Guru Bahasa', phone: '081344556677', address: 'Komplek Guru No. 3, Bandung', joinedAt: '2023-08-01', status: 'active' }
];

const INITIAL_LOANS: Loan[] = [
  {
    id: 'l1',
    loanCode: 'PJ-2026-001',
    bookTitle: 'Bumi Manusia',
    bookId: 'b2',
    copyCode: 'LIB-B02-C01',
    memberCode: 'MBR-A002',
    memberName: 'Budi Santoso',
    borrowedAt: '2026-10-20',
    dueDate: '2026-10-27',
    status: 'overdue',
    daysOverdue: 6,
    fineAmount: 6000
  },
  {
    id: 'l2',
    loanCode: 'PJ-2026-002',
    bookTitle: 'Laskar Pelangi',
    bookId: 'b1',
    copyCode: 'LIB-B01-C01',
    memberCode: 'MBR-A001',
    memberName: 'Rani Maharani',
    borrowedAt: '2026-10-26',
    dueDate: '2026-11-09',
    status: 'active'
  },
  {
    id: 'l3',
    loanCode: 'PJ-2026-003',
    bookTitle: 'Matematika Dasar SMA Kelas XI',
    bookId: 'b4',
    copyCode: 'LIB-B04-C01',
    memberCode: 'MBR-A001',
    memberName: 'Rani Maharani',
    borrowedAt: '2026-10-26',
    dueDate: '2026-11-02',
    status: 'active'
  }
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'r1', bookTitle: 'Bumi Manusia', memberCode: 'MBR-A001', memberName: 'Rani Maharani', reservedAt: '2026-10-29', status: 'siap_diambil' },
  { id: 'r2', bookTitle: 'Sapiens: Riwayat Singkat Umat Manusia', memberCode: 'MBR-A003', memberName: 'Siti Nurhaliza', reservedAt: '2026-10-30', status: 'menunggu' }
];

const INITIAL_FINES: Fine[] = [
  { id: 'f1', memberCode: 'MBR-A002', memberName: 'Budi Santoso', bookTitle: 'Bumi Manusia', daysOverdue: 6, amount: 6000, status: 'belum_dibayar' },
  { id: 'f2', memberCode: 'MBR-A003', memberName: 'Siti Nurhaliza', bookTitle: 'Filosofi Teras', daysOverdue: 2, amount: 2000, status: 'lunas', paidAt: '2026-10-29' }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-m1',
    recipientRole: 'member',
    recipientCode: 'MBR-A001',
    title: 'Buku Siap Diambil!',
    message: 'Reservasi buku "Bumi Manusia" sudah disiapkan petugas. Silakan ambil di meja sirkulasi.',
    timestamp: '10 menit yang lalu',
    isRead: false,
    type: 'reservation'
  },
  {
    id: 'notif-m2',
    recipientRole: 'member',
    recipientCode: 'MBR-A001',
    title: 'Pengingat Jatuh Tempo Hari Ini',
    message: 'Buku "Matematika Dasar SMA Kelas XI" jatuh tempo hari ini (2 Nov 2026). Perpanjang atau kembalikan tepat waktu.',
    timestamp: '1 jam yang lalu',
    isRead: false,
    type: 'due'
  },
  {
    id: 'notif-p1',
    recipientRole: 'librarian',
    title: 'Keterlambatan Pengembalian Buku',
    message: 'Peminjaman PJ-2026-001 atas nama Budi Santoso (MBR-A002) telah terlambat 6 hari.',
    timestamp: '25 menit yang lalu',
    isRead: false,
    type: 'due'
  }
];

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('beranda');
  const [subPage, setSubPage] = useState<string>('dashboard');

  const [currentUser, setCurrentUser] = useState<{
    role: 'guest' | 'member' | 'librarian' | 'admin';
    name: string;
    email: string;
    code: string;
  }>({
    role: 'guest',
    name: 'Tamu / Pengunjung',
    email: '',
    code: ''
  });

  // Master Data States (Didukung Sinkronisasi LocalStorage & Supabase)
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('librava_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Pastikan coverImage dari INITIAL_BOOKS ter-merge jika local data belum memilikinya
        return parsed.map((pb: Book) => {
          const matchInitial = INITIAL_BOOKS.find(ib => ib.id === pb.id);
          return {
            ...pb,
            coverImage: pb.coverImage || matchInitial?.coverImage
          };
        });
      }
      return INITIAL_BOOKS;
    } catch { return INITIAL_BOOKS; }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('librava_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch { return INITIAL_MEMBERS; }
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem('librava_loans');
      return saved ? JSON.parse(saved) : INITIAL_LOANS;
    } catch { return INITIAL_LOANS; }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('librava_reservations');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch { return INITIAL_RESERVATIONS; }
  });

  const [fines, setFines] = useState<Fine[]>(() => {
    try {
      const saved = localStorage.getItem('librava_fines');
      return saved ? JSON.parse(saved) : INITIAL_FINES;
    } catch { return INITIAL_FINES; }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('librava_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch { return INITIAL_NOTIFICATIONS; }
  });

  // Simpan otomatis ke localStorage sebagai fallback offline/client state
  useEffect(() => { localStorage.setItem('librava_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('librava_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('librava_loans', JSON.stringify(loans)); }, [loans]);
  useEffect(() => { localStorage.setItem('librava_reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { localStorage.setItem('librava_fines', JSON.stringify(fines)); }, [fines]);
  useEffect(() => { localStorage.setItem('librava_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Notifications & Profile Dropdown
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Search, Filter & Pagination States
  const [selectedBook, setSelectedBook] = useState<Book>(INITIAL_BOOKS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Admin & Petugas Catalog Management Filter & Pagination
  const [adminBookSearch, setAdminBookSearch] = useState('');
  const [adminBookCategory, setAdminBookCategory] = useState('Semua');
  const [adminBookPage, setAdminBookPage] = useState(1);
  const booksPerPage = 5;

  // Admin & Petugas Member Management Filter & Pagination
  const [adminMemberSearch, setAdminMemberSearch] = useState('');
  const [adminMemberStatus, setAdminMemberStatus] = useState('Semua');
  const [adminMemberPage, setAdminMemberPage] = useState(1);
  const membersPerPage = 5;

  // Circulation input
  const [loanMemberCode, setLoanMemberCode] = useState('');
  const [loanCopyCode, setLoanCopyCode] = useState('');

  // Status Scan Barcode Peminjaman (Fitur 7)
  const [borrowStep, setBorrowStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [borrowMemberData, setBorrowMemberData] = useState<Member | null>(null);
  const [borrowBookData, setBorrowBookData] = useState<{ book: Book; copy: CopyItem } | null>(null);
  const [borrowErrorMessage, setBorrowErrorMessage] = useState<string>('');

  // Status Scan Barcode Pengembalian (Fitur 7)
  const [returnStep, setReturnStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [returnLoanData, setReturnLoanData] = useState<{ loan: Loan; isOverdue: boolean; fineAmount: number; daysLate: number } | null>(null);
  const [returnErrorMessage, setReturnErrorMessage] = useState<string>('');

  // 📷 Scanner Modal State
  const [scannerConfig, setScannerConfig] = useState<{
    isOpen: boolean;
    targetField: 'member' | 'book_copy' | 'return_copy' | null;
    title: string;
  }>({
    isOpen: false,
    targetField: null,
    title: ''
  });

  // 🏷️ Label Preview & Print Modal State (Fitur 5)
  const [labelModal, setLabelModal] = useState<{
    isOpen: boolean;
    labels: CopyLabelData[];
    title: string;
  }>({
    isOpen: false,
    labels: [],
    title: ''
  });

  // Modal Cetak Kartu Member Digital
  const [memberCardModal, setMemberCardModal] = useState<{
    isOpen: boolean;
    member?: Member;
  }>({
    isOpen: false
  });

  // ⚡ Modal Peminjaman Buku Cepat (Quick Borrow Modal)
  const [quickBorrowModal, setQuickBorrowModal] = useState<{
    isOpen: boolean;
    book?: Book;
    copyCode?: string;
  }>({
    isOpen: false
  });

  // 📝 Modal Form CRUD Buku (Tambah / Edit)
  const [bookModal, setBookModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    bookData?: Partial<Book>;
  }>({
    isOpen: false,
    mode: 'add'
  });

  // 📝 Modal Form CRUD Anggota (Tambah / Edit)
  const [memberModal, setMemberModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    memberData?: Partial<Member>;
  }>({
    isOpen: false,
    mode: 'add'
  });

  // Modal Detail & Manajemen Eksemplar
  const [copyManageModal, setCopyManageModal] = useState<{
    isOpen: boolean;
    book?: Book;
  }>({
    isOpen: false
  });

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications filtering
  const userNotifications = notifications.filter(n => {
    if (currentUser.role === 'admin') return n.recipientRole === 'admin' || n.recipientRole === 'all';
    if (currentUser.role === 'librarian') return n.recipientRole === 'librarian' || n.recipientRole === 'all';
    if (currentUser.role === 'member') {
      return (n.recipientRole === 'member' && (!n.recipientCode || n.recipientCode === (currentUser.code || 'MBR-A001'))) || n.recipientRole === 'all';
    }
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    const userNotifIds = new Set(userNotifications.map(n => n.id));
    setNotifications(notifications.map(n => userNotifIds.has(n.id) ? { ...n, isRead: true } : n));
    showToast('Semua notifikasi ditandai sudah dibaca.');
  };

  const markSingleAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newN: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now() + Math.random().toString(36).slice(2, 6),
      timestamp: 'Baru saja',
      isRead: false
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = loginEmail.trim().toLowerCase();

    if (query.includes('admin')) {
      setCurrentUser({
        role: 'admin',
        name: 'Ibu Ratna (Administrator)',
        email: loginEmail || 'admin@sekolah.sch.id',
        code: 'ADM01'
      });
      setSubPage('dashboard');
      setCurrentRoute('admin_dashboard');
      showToast('Login berhasil sebagai Administrator.');
    } else if (query.includes('petugas') || query.includes('joko')) {
      setCurrentUser({
        role: 'librarian',
        name: 'Pak Joko (Petugas)',
        email: loginEmail || 'joko@petugas.sch.id',
        code: 'P01'
      });
      setSubPage('dashboard');
      setCurrentRoute('petugas_dashboard');
      showToast('Login berhasil sebagai Petugas Perpustakaan.');
    } else {
      setCurrentUser({
        role: 'member',
        name: 'Rani Maharani',
        email: loginEmail || 'rani@siswa.sch.id',
        code: 'MBR-A001'
      });
      setCurrentRoute('beranda');
      showToast('Login berhasil! Selamat datang, Rani Maharani.');
    }
  };

  const handleLogout = () => {
    setCurrentUser({ role: 'guest', name: 'Tamu / Pengunjung', email: '', code: '' });
    setIsProfileDropdownOpen(false);
    setIsNotifDropdownOpen(false);
    setCurrentRoute('beranda');
    showToast('Anda telah keluar.');
  };

  // ========================================================
  // CRUD OPERASI BUKU & EKSEMPLAR (ADMIN & PETUGAS)
  // ========================================================
  const handleSaveBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const isbn = formData.get('isbn') as string;
    const publisher = formData.get('publisher') as string;
    const year = parseInt(formData.get('year') as string) || 2026;
    const category = formData.get('category') as string;
    const callNumber = formData.get('callNumber') as string;
    const shelfLocation = formData.get('shelfLocation') as string;
    const description = formData.get('description') as string;
    const coverImage = (formData.get('coverImage') as string)?.trim() || undefined;
    const totalCopiesInput = parseInt(formData.get('totalCopies') as string) || 1;

    if (bookModal.mode === 'add') {
      const bookIndex = books.length + 1;
      const newBookId = 'b' + (Date.now() % 10000);
      const copyPrefix = `LIB-B${String(bookIndex).padStart(2, '0')}`;
      
      const newCopies: CopyItem[] = [];
      for (let i = 1; i <= totalCopiesInput; i++) {
        newCopies.push({
          copyCode: `${copyPrefix}-C${String(i).padStart(2, '0')}`,
          status: 'tersedia'
        });
      }

      const colors = ['#DCE1F8', '#F7E1D4', '#D6EEE3', '#E9ECFB', '#FDF0D8'];
      const newBook: Book = {
        id: newBookId,
        isbn,
        title,
        author,
        publisher,
        year,
        category,
        callNumber,
        shelfLocation,
        description,
        totalCopies: totalCopiesInput,
        availableCopies: totalCopiesInput,
        colorBg: colors[Math.floor(Math.random() * colors.length)],
        coverImage,
        copies: newCopies
      };

      setBooks([newBook, ...books]);
      showToast(`✅ Buku "${title}" dengan ${totalCopiesInput} eksemplar unik berhasil ditambahkan!`);
      addNotification({
        recipientRole: 'admin',
        title: 'Penambahan Buku Baru',
        message: `${currentUser.name} menambahkan buku "${title}" (${totalCopiesInput} eksemplar).`,
        type: 'stock'
      });
    } else if (bookModal.mode === 'edit' && bookModal.bookData) {
      setBooks(books.map(b => {
        if (b.id === bookModal.bookData!.id) {
          return {
            ...b,
            isbn,
            title,
            author,
            publisher,
            year,
            category,
            callNumber,
            shelfLocation,
            description,
            coverImage: coverImage !== undefined ? coverImage : b.coverImage
          };
        }
        return b;
      }));
      showToast(`✅ Informasi buku "${title}" berhasil diperbarui!`);
    }
    setBookModal({ isOpen: false, mode: 'add' });
  };

  const handleDeleteBook = (bookId: string, bookTitle: string) => {
    // Validasi apakah sedang ada eksemplar yang dipinjam
    const hasActiveLoan = loans.some(l => l.bookId === bookId && l.status !== 'returned');
    if (hasActiveLoan) {
      showToast(`❌ Tidak dapat menghapus "${bookTitle}". Masih terdapat eksemplar yang sedang dipinjam!`);
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus buku "${bookTitle}" beserta seluruh eksemplarnya?`)) {
      setBooks(books.filter(b => b.id !== bookId));
      showToast(`🗑️ Buku "${bookTitle}" telah dihapus dari sistem.`);
      addNotification({
        recipientRole: 'admin',
        title: 'Penghapusan Buku',
        message: `Buku "${bookTitle}" telah dihapus oleh Admin.`,
        type: 'system'
      });
    }
  };

  // Tambah Eksemplar Baru pada Buku yang Ada
  const handleAddCopy = (bookId: string) => {
    const bk = books.find(b => b.id === bookId);
    if (!bk) return;
    const nextNum = bk.copies.length + 1;
    const bookNum = books.findIndex(b => b.id === bookId) + 1;
    const newCode = `LIB-B${String(bookNum).padStart(2, '0')}-C${String(nextNum).padStart(2, '0')}`;

    setBooks(books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          totalCopies: b.totalCopies + 1,
          availableCopies: b.availableCopies + 1,
          copies: [...b.copies, { copyCode: newCode, status: 'tersedia' }]
        };
      }
      return b;
    }));
    showToast(`✅ Eksemplar baru [${newCode}] berhasil dibuat dan siap cetak!`);
  };

  // Hapus Eksemplar
  const handleDeleteCopy = (bookId: string, copyCode: string) => {
    const isLoaned = loans.some(l => l.copyCode === copyCode && l.status !== 'returned');
    if (isLoaned) {
      showToast(`❌ Eksemplar [${copyCode}] tidak dapat dihapus karena sedang dipinjam!`);
      return;
    }

    if (window.confirm(`Hapus eksemplar [${copyCode}] secara permanen?`)) {
      setBooks(books.map(b => {
        if (b.id === bookId) {
          const updatedCopies = b.copies.filter(c => c.copyCode !== copyCode);
          return {
            ...b,
            totalCopies: updatedCopies.length,
            availableCopies: updatedCopies.filter(c => c.status === 'tersedia').length,
            copies: updatedCopies
          };
        }
        return b;
      }));
      showToast(`🗑️ Eksemplar [${copyCode}] telah dihapus.`);
    }
  };

  // ========================================================
  // CRUD OPERASI ANGGOTA MEMBER (ADMIN & PETUGAS)
  // ========================================================
  const handleSaveMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const className = formData.get('className') as string;
    const phone = formData.get('phone') as string;
    const address = (formData.get('address') as string) || '-';

    if (memberModal.mode === 'add') {
      const newMemberIndex = members.length + 1;
      const newMemberCode = `MBR-A${String(newMemberIndex).padStart(3, '0')}`;
      const newMember: Member = {
        id: 'm' + Date.now(),
        memberCode: newMemberCode,
        name,
        email,
        className,
        phone,
        address,
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      setMembers([newMember, ...members]);
      showToast(`✅ Anggota baru "${name}" (${newMemberCode}) berhasil didaftarkan!`);
      addNotification({
        recipientRole: 'admin',
        title: 'Pendaftaran Anggota Baru',
        message: `${name} (${newMemberCode}) didaftarkan ke dalam sistem.`,
        type: 'system'
      });
    } else if (memberModal.mode === 'edit' && memberModal.memberData) {
      setMembers(members.map(m => {
        if (m.id === memberModal.memberData!.id) {
          return {
            ...m,
            name,
            email,
            className,
            phone,
            address
          };
        }
        return m;
      }));
      showToast(`✅ Data anggota "${name}" berhasil diperbarui!`);
    }
    setMemberModal({ isOpen: false, mode: 'add' });
  };

  const handleToggleMemberStatus = (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setMembers(members.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
    showToast(`Status anggota berhasil diubah menjadi ${newStatus.toUpperCase()}`);
  };

  const handleDeleteMember = (memberId: string, memberCode: string, memberName: string) => {
    const hasActiveLoan = loans.some(l => l.memberCode === memberCode && l.status !== 'returned');
    if (hasActiveLoan) {
      showToast(`❌ Tidak dapat menghapus "${memberName}". Masih memiliki pinjaman buku yang aktif!`);
      return;
    }

    if (window.confirm(`Hapus anggota "${memberName}" (${memberCode}) secara permanen?`)) {
      setMembers(members.filter(m => m.id !== memberId));
      showToast(`🗑️ Anggota "${memberName}" telah dihapus.`);
    }
  };

  // ========================================================
  // SIRKULASI BARCODE (FITUR 7: STATEFUL STEP SCAN & VALIDASI)
  // ========================================================

  // Reset alur scan peminjaman
  const resetBorrowFlow = () => {
    setBorrowStep(1);
    setBorrowMemberData(null);
    setBorrowBookData(null);
    setBorrowErrorMessage('');
    setLoanMemberCode('');
    setLoanCopyCode('');
  };

  // Step A: Verifikasi Member
  const handleVerifyMember = (codeToVerify?: string) => {
    const raw = (codeToVerify !== undefined ? codeToVerify : loanMemberCode).trim().toUpperCase();
    if (!raw) {
      showToast('⚠️ Masukkan atau scan barcode kartu member.');
      return;
    }
    const mem = members.find(m => m.memberCode.toUpperCase() === raw || m.memberCode.replace('MBR-', '') === raw);
    
    if (!mem) {
      const errMsg = `Barcode member [${raw}] tidak valid atau tidak terdaftar di sistem.`;
      setBorrowStep(7);
      setBorrowErrorMessage(errMsg);
      addNotification({
        recipientRole: 'librarian',
        title: 'Peminjaman Ditolak (Scan Barcode)',
        message: `Percobaan scan member gagal: ${errMsg}`,
        type: 'circulation'
      });
      showToast(`❌ ${errMsg}`);
      return;
    }

    if (mem.status !== 'active') {
      const errMsg = `Status keanggotaan ${mem.name} (${mem.memberCode}) sedang ${mem.status.toUpperCase()}.`;
      setBorrowStep(7);
      setBorrowErrorMessage(errMsg);
      // Notifikasi ke member dan petugas
      addNotification({
        recipientRole: 'member',
        recipientCode: mem.memberCode,
        title: 'Peminjaman Ditolak',
        message: `Permintaan pinjam ditolak karena status akun Anda sedang ${mem.status.toUpperCase()}. Harap hubungi staf perpustakaan.`,
        type: 'circulation'
      });
      addNotification({
        recipientRole: 'librarian',
        title: 'Peminjaman Ditolak (Status Anggota)',
        message: `Transaksi ditolak: ${mem.name} (${mem.memberCode}) berstatus ${mem.status.toUpperCase()}.`,
        type: 'circulation'
      });
      showToast(`⚠️ ${errMsg}`);
      return;
    }

    const activeMemberLoans = loans.filter(l => l.memberCode === mem.memberCode && l.status !== 'returned');
    if (activeMemberLoans.length >= 3) {
      const errMsg = `Batas pinjam maksimal 3 buku tercapai! ${mem.name} saat ini sedang meminjam ${activeMemberLoans.length} buku.`;
      setBorrowStep(7);
      setBorrowErrorMessage(errMsg);
      addNotification({
        recipientRole: 'member',
        recipientCode: mem.memberCode,
        title: 'Peminjaman Ditolak',
        message: 'Permintaan pinjam ditolak karena batas kuota 3 buku aktif telah tercapai. Kembalikan buku sebelum meminjam buku baru.',
        type: 'circulation'
      });
      addNotification({
        recipientRole: 'librarian',
        title: 'Peminjaman Ditolak (Limit Buku)',
        message: `${mem.name} (${mem.memberCode}) telah mencapai batas pinjam 3 buku.`,
        type: 'circulation'
      });
      showToast(`⚠️ ${errMsg}`);
      return;
    }

    const unpaidFines = fines.filter(f => f.memberCode === mem.memberCode && f.status === 'belum_dibayar');
    if (unpaidFines.length > 0) {
      const totalFine = unpaidFines.reduce((acc, f) => acc + f.amount, 0);
      const errMsg = `Anggota ${mem.name} memiliki denda keterlambatan tertunggak sebesar Rp ${totalFine.toLocaleString()}.`;
      setBorrowStep(7);
      setBorrowErrorMessage(errMsg);
      addNotification({
        recipientRole: 'member',
        recipientCode: mem.memberCode,
        title: 'Peminjaman Ditolak (Ada Tunggakan Denda)',
        message: `Harap melunasi denda keterlambatan Rp ${totalFine.toLocaleString()} di kasir perpustakaan sebelum meminjam kembali.`,
        type: 'fine'
      });
      addNotification({
        recipientRole: 'librarian',
        title: 'Peminjaman Ditolak (Denda Tertunggak)',
        message: `Transaksi ${mem.name} ditahan karena memiliki denda Rp ${totalFine.toLocaleString()}.`,
        type: 'fine'
      });
      showToast(`⚠️ ${errMsg}`);
      return;
    }

    // Lolos: Member berhasil ditemukan & memenuhi syarat
    setBorrowMemberData(mem);
    setBorrowStep(3); // Langsung arahkan menunggu scan buku
    showToast(`✅ Member ditemukan: ${mem.name} (${mem.memberCode}). Lanjut scan buku.`);
  };

  // Step B: Verifikasi Buku
  const handleVerifyBook = (codeToVerify?: string) => {
    const raw = (codeToVerify !== undefined ? codeToVerify : loanCopyCode).trim().toUpperCase();
    if (!raw) {
      showToast('⚠️ Masukkan atau scan barcode eksemplar buku.');
      return;
    }

    let foundBook: Book | null = null;
    let foundCopy: CopyItem | null = null;

    for (const b of books) {
      const cp = b.copies.find(c => c.copyCode.toUpperCase() === raw);
      if (cp) {
        foundBook = b;
        foundCopy = cp;
        break;
      }
    }

    if (!foundBook || !foundCopy) {
      const errMsg = `Barcode eksemplar [${raw}] tidak ditemukan di katalog perpustakaan.`;
      setBorrowStep(7);
      setBorrowErrorMessage(errMsg);
      addNotification({
        recipientRole: 'librarian',
        title: 'Peminjaman Ditolak (Barcode Tidak Valid)',
        message: `Percobaan scan eksemplar gagal: [${raw}] tidak terdaftar.`,
        type: 'circulation'
      });
      showToast(`❌ ${errMsg}`);
      return;
    }

    if (foundCopy.status === 'dipinjam') {
      const errMsg = `Eksemplar [${foundCopy.copyCode}] "${foundBook.title}" sedang dipinjam oleh pemustaka lain.`;
      setBorrowStep(7);
      setBorrowErrorMessage(errMsg);
      addNotification({
        recipientRole: 'librarian',
        title: 'Peminjaman Ditolak (Buku Tidak Tersedia)',
        message: `Eksemplar [${foundCopy.copyCode}] "${foundBook.title}" berstatus sedang dipinjam.`,
        type: 'stock'
      });
      showToast(`⚠️ ${errMsg}`);
      return;
    }

    // Lolos: Buku ditemukan dan tersedia
    setBorrowBookData({ book: foundBook, copy: foundCopy });
    setBorrowStep(5); // Menunggu konfirmasi peminjaman
    showToast(`✅ Buku ditemukan & siap: "${foundBook.title}" [${foundCopy.copyCode}]`);
  };

  // Step C: Konfirmasi Eksekusi Peminjaman
  const handleConfirmBorrow = () => {
    if (!borrowMemberData || !borrowBookData) return;

    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 7);
    const borrowDateStr = now.toISOString().split('T')[0];
    const dueDateStr = due.toISOString().split('T')[0];
    const loanCode = `PJ-${now.getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`;

    const newLoan: Loan = {
      id: 'l' + Date.now(),
      loanCode: loanCode,
      bookTitle: borrowBookData.book.title,
      bookId: borrowBookData.book.id,
      copyCode: borrowBookData.copy.copyCode,
      memberCode: borrowMemberData.memberCode,
      memberName: borrowMemberData.name,
      borrowedAt: borrowDateStr,
      dueDate: dueDateStr,
      status: 'active'
    };

    // 1. Simpan ke database state
    setLoans([newLoan, ...loans]);
    setBooks(books.map(b => {
      if (b.id === borrowBookData.book.id) {
        return {
          ...b,
          availableCopies: b.availableCopies - 1,
          copies: b.copies.map(c => c.copyCode === borrowBookData.copy.copyCode ? { ...c, status: 'dipinjam' } : c)
        };
      }
      return b;
    }));

    // 2. Kirim notifikasi otomatis setelah sukses disimpan
    // Member Notification
    addNotification({
      recipientRole: 'member',
      recipientCode: borrowMemberData.memberCode,
      title: 'Peminjaman Berhasil',
      message: `Buku "${borrowBookData.book.title}" [${borrowBookData.copy.copyCode}] berhasil dipinjam pada ${borrowDateStr}. Tanggal jatuh tempo pengembalian: ${dueDateStr}.`,
      type: 'circulation'
    });

    // Librarian Notification
    addNotification({
      recipientRole: 'librarian',
      title: 'Peminjaman Berhasil Diproses',
      message: `Peminjaman [${loanCode}]: "${borrowBookData.book.title}" [${borrowBookData.copy.copyCode}] untuk ${borrowMemberData.name} (${borrowMemberData.memberCode}). Waktu: ${borrowDateStr}.`,
      type: 'circulation'
    });

    // Admin Notification
    addNotification({
      recipientRole: 'admin',
      title: 'Transaksi Sirkulasi Peminjaman',
      message: `Transaksi ${loanCode} berhasil: ${borrowMemberData.name} meminjam "${borrowBookData.book.title}".`,
      type: 'circulation'
    });

    setBorrowStep(6);
    showToast(`🎉 Peminjaman ${loanCode} berhasil diproses!`);
  };

  // Reset alur scan pengembalian
  const resetReturnFlow = () => {
    setReturnStep(1);
    setReturnLoanData(null);
    setReturnErrorMessage('');
  };

  // Verifikasi Barcode Pengembalian
  const handleVerifyReturn = (scannedCopyCode: string) => {
    const cleanCode = scannedCopyCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast('⚠️ Masukkan atau scan barcode eksemplar buku.');
      return;
    }

    const activeLoan = loans.find(l => l.copyCode.toUpperCase() === cleanCode && l.status !== 'returned');

    if (!activeLoan) {
      setReturnStep(1);
      setReturnErrorMessage(`Tidak ada transaksi peminjaman aktif untuk barcode [${cleanCode}].`);
      addNotification({
        recipientRole: 'librarian',
        title: 'Pengembalian Gagal (Barcode Tidak Ditemukan)',
        message: `Barcode eksemplar [${cleanCode}] tidak memiliki status pinjaman aktif.`,
        type: 'circulation'
      });
      showToast(`⚠️ Tidak ada pinjaman aktif untuk barcode [${cleanCode}].`);
      return;
    }

    const now = new Date();
    const dueDate = new Date(activeLoan.dueDate);
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isLate = diffDays > 0;
    const fineRate = 1000; // Rp 1.000 / hari
    const fineTotal = isLate ? diffDays * fineRate : 0;

    setReturnLoanData({
      loan: activeLoan,
      isOverdue: isLate,
      fineAmount: fineTotal,
      daysLate: isLate ? diffDays : 0
    });
    setReturnStep(3); // Menunggu konfirmasi pengembalian
    showToast(`✅ Buku ditemukan: "${activeLoan.bookTitle}". Menunggu konfirmasi.`);
  };

  // Konfirmasi Eksekusi Pengembalian
  const handleConfirmReturn = () => {
    if (!returnLoanData) return;
    const { loan: activeLoan, isOverdue, fineAmount, daysLate } = returnLoanData;
    const returnDateStr = new Date().toISOString().split('T')[0];

    // Update loans di database
    setLoans(loans.map(l => l.id === activeLoan.id ? { ...l, status: 'returned', returnedAt: returnDateStr } : l));

    // Update ketersediaan eksemplar
    setBooks(books.map(b => {
      if (b.id === activeLoan.bookId) {
        return {
          ...b,
          availableCopies: b.availableCopies + 1,
          copies: b.copies.map(c => c.copyCode.toUpperCase() === activeLoan.copyCode.toUpperCase() ? { ...c, status: 'tersedia' } : c)
        };
      }
      return b;
    }));

    if (isOverdue && fineAmount > 0) {
      // Buat tagihan denda di database
      const newFine: Fine = {
        id: 'fn-' + Date.now(),
        memberCode: activeLoan.memberCode,
        memberName: activeLoan.memberName,
        bookTitle: activeLoan.bookTitle,
        daysOverdue: daysLate,
        amount: fineAmount,
        status: 'belum_dibayar'
      };
      setFines([newFine, ...fines]);

      // Notifikasi keterlambatan & denda untuk member
      addNotification({
        recipientRole: 'member',
        recipientCode: activeLoan.memberCode,
        title: 'Pengembalian Terlambat & Tagihan Denda',
        message: `Buku "${activeLoan.bookTitle}" dikembalikan terlambat ${daysLate} hari (Jatuh tempo: ${activeLoan.dueDate}). Dikenakan denda sebesar Rp ${fineAmount.toLocaleString()}. Harap segera selesaikan di kasir perpustakaan.`,
        type: 'fine'
      });

      // Notifikasi keterlambatan untuk petugas
      addNotification({
        recipientRole: 'librarian',
        title: 'Pengembalian Terlambat & Denda Diterbitkan',
        message: `Buku "${activeLoan.bookTitle}" [${activeLoan.copyCode}] oleh ${activeLoan.memberName} terlambat ${daysLate} hari. Denda Rp ${fineAmount.toLocaleString()} dicatat.`,
        type: 'fine'
      });

      setReturnStep(5); // Status Pengembalian Terlambat & Denda
      showToast(`⚠️ Pengembalian selesai: Terlambat ${daysLate} hari, denda Rp ${fineAmount.toLocaleString()}.`);
    } else {
      // Pengembalian tepat waktu
      addNotification({
        recipientRole: 'member',
        recipientCode: activeLoan.memberCode,
        title: 'Pengembalian Berhasil',
        message: `Buku "${activeLoan.bookTitle}" [${activeLoan.copyCode}] berhasil dikembalikan pada tanggal ${returnDateStr}. Terima kasih telah mengembalikan tepat waktu!`,
        type: 'circulation'
      });

      addNotification({
        recipientRole: 'librarian',
        title: 'Pengembalian Berhasil Diproses',
        message: `Pengembalian buku "${activeLoan.bookTitle}" [${activeLoan.copyCode}] dari ${activeLoan.memberName} (${activeLoan.memberCode}) berhasil diproses pada ${returnDateStr}.`,
        type: 'circulation'
      });

      setReturnStep(4); // Status Pengembalian Berhasil Diproses
      showToast(`✅ Pengembalian buku "${activeLoan.bookTitle}" berhasil diproses!`);
    }
  };

  const handleScanDecoded = (decodedText: string) => {
    if (scannerConfig.targetField === 'member') {
      setLoanMemberCode(decodedText);
      handleVerifyMember(decodedText);
    } else if (scannerConfig.targetField === 'book_copy') {
      setLoanCopyCode(decodedText);
      handleVerifyBook(decodedText);
    } else if (scannerConfig.targetField === 'return_copy') {
      handleVerifyReturn(decodedText);
    }
  };

  // ⚡ Helper Peminjaman Cepat Langsung (1-Klik untuk Member Login atau Pilih Member)
  const executeDirectQuickBorrow = (bookToBorrow: Book, targetCopyCode?: string, memberCodeToUse?: string) => {
    // 1. Tentukan member
    const code = memberCodeToUse || (currentUser.role === 'member' ? (currentUser.code || 'MBR-A001') : 'MBR-A001');
    const mem = members.find(m => m.memberCode.toUpperCase() === code.toUpperCase() || m.memberCode.replace('MBR-', '') === code.toUpperCase());

    if (!mem) {
      showToast('❌ Member tidak ditemukan.');
      return false;
    }

    if (mem.status !== 'active') {
      showToast(`⚠️ Anggota ${mem.name} sedang ${mem.status.toUpperCase()}! Tidak dapat meminjam.`);
      return false;
    }

    const activeMemberLoans = loans.filter(l => l.memberCode === mem.memberCode && l.status !== 'returned');
    if (activeMemberLoans.length >= 3) {
      showToast(`⚠️ Batas pinjam maksimal 3 buku tercapai untuk ${mem.name}!`);
      return false;
    }

    const unpaidFines = fines.filter(f => f.memberCode === mem.memberCode && f.status === 'belum_dibayar');
    if (unpaidFines.length > 0) {
      showToast(`⚠️ ${mem.name} memiliki tunggakan denda yang belum dibayar.`);
      return false;
    }

    // 2. Tentukan eksemplar yang tersedia
    let availableCopy: CopyItem | undefined;
    if (targetCopyCode) {
      availableCopy = bookToBorrow.copies.find(c => c.copyCode === targetCopyCode && c.status === 'tersedia');
    } else {
      availableCopy = bookToBorrow.copies.find(c => c.status === 'tersedia');
    }

    if (!availableCopy) {
      showToast(`⚠️ Stok eksemplar buku "${bookToBorrow.title}" sedang tidak tersedia / habis dipinjam.`);
      return false;
    }

    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 7);
    const borrowDateStr = now.toISOString().split('T')[0];
    const dueDateStr = due.toISOString().split('T')[0];
    const loanCode = `PJ-${now.getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`;

    const newLoan: Loan = {
      id: 'l' + Date.now(),
      loanCode: loanCode,
      bookTitle: bookToBorrow.title,
      bookId: bookToBorrow.id,
      copyCode: availableCopy.copyCode,
      memberCode: mem.memberCode,
      memberName: mem.name,
      borrowedAt: borrowDateStr,
      dueDate: dueDateStr,
      status: 'active'
    };

    setLoans([newLoan, ...loans]);
    setBooks(books.map(b => {
      if (b.id === bookToBorrow.id) {
        return {
          ...b,
          availableCopies: b.availableCopies - 1,
          copies: b.copies.map(c => c.copyCode === availableCopy!.copyCode ? { ...c, status: 'dipinjam' } : c)
        };
      }
      return b;
    }));

    // Notifikasi Otomatis
    addNotification({
      recipientRole: 'member',
      recipientCode: mem.memberCode,
      title: 'Peminjaman Buku Cepat Berhasil',
      message: `Buku "${bookToBorrow.title}" [${availableCopy.copyCode}] berhasil dipinjam secara kilat. Jatuh tempo: ${dueDateStr}.`,
      type: 'circulation'
    });

    addNotification({
      recipientRole: 'librarian',
      title: 'Peminjaman Cepat Terkonfirmasi',
      message: `Peminjaman cepat [${loanCode}]: "${bookToBorrow.title}" [${availableCopy.copyCode}] oleh ${mem.name} (${mem.memberCode}).`,
      type: 'circulation'
    });

    showToast(`⚡ Peminjaman Cepat Berhasil! [${availableCopy.copyCode}] untuk ${mem.name}.`);
    return true;
  };

  // ========================================================
  // KOMPONEN SIRKULASI BARCODE INTERAKTIF (STATUS 7 LANGKAH PINJAM & 5 LANGKAH KEMBALI)
  // ========================================================
  const renderCirculationBarcodeSection = (_isAdmin: boolean) => {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* KOTAK A: ALUR PEMINJAMAN DENGAN 7 STATUS LIVE */}
          <div className="b" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Peminjaman Buku (Barcode)</h2>
                <span style={{ fontSize: '11px', background: '#E0E7FF', color: '#3730A3', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>Code 128 Scanner</span>
              </div>

              {/* INDIKATOR VISUAL 7 STATUS PEMINJAMAN */}
              <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '10px', background: borrowStep === 7 ? '#FEF2F2' : borrowStep === 6 ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${borrowStep === 7 ? '#FCA5A5' : borrowStep === 6 ? '#86EFAC' : '#E2E8F0'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: borrowStep === 7 ? '#DC2626' : borrowStep === 6 ? '#16A34A' : '#475569' }}>
                    Status Alur Peminjaman (Tahap {borrowStep}/7)
                  </span>
                  <button onClick={resetBorrowFlow} style={{ background: 'transparent', border: 0, color: '#64748B', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Reset Ulang
                  </button>
                </div>

                {/* Deskripsi status saat ini */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {borrowStep === 1 && '⏳'}
                    {borrowStep === 2 && '👤'}
                    {borrowStep === 3 && '📖'}
                    {borrowStep === 4 && '✨'}
                    {borrowStep === 5 && '🔔'}
                    {borrowStep === 6 && '✅'}
                    {borrowStep === 7 && '❌'}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: borrowStep === 7 ? '#991B1B' : borrowStep === 6 ? '#166534' : '#1E293B' }}>
                      {borrowStep === 1 && '1. Menunggu scan barcode kartu member'}
                      {borrowStep === 2 && '2. Member berhasil ditemukan'}
                      {borrowStep === 3 && '3. Menunggu scan barcode buku fisik'}
                      {borrowStep === 4 && '4. Buku berhasil ditemukan dan tersedia'}
                      {borrowStep === 5 && '5. Menunggu konfirmasi peminjaman'}
                      {borrowStep === 6 && '6. Peminjaman berhasil diproses!'}
                      {borrowStep === 7 && '7. Peminjaman Ditolak / Tidak Memenuhi Syarat'}
                    </p>
                    <p className="mut" style={{ margin: '2px 0 0', fontSize: '11px', color: borrowStep === 7 ? '#B91C1C' : borrowStep === 6 ? '#15803D' : '#64748B' }}>
                      {borrowStep === 1 && 'Pindai barcode kartu siswa atau ketikkan kode ID member.'}
                      {borrowStep === 2 && `Member: ${borrowMemberData?.name} (${borrowMemberData?.memberCode})`}
                      {borrowStep === 3 && `Member terverifikasi: ${borrowMemberData?.name}. Silakan scan barcode eksemplar buku.`}
                      {borrowStep === 4 && `Buku: ${borrowBookData?.book.title} [${borrowBookData?.copy.copyCode}]`}
                      {borrowStep === 5 && `Periksa data pinjam di bawah sebelum menekan tombol konfirmasi.`}
                      {borrowStep === 6 && 'Data transaksi telah dicatat dan notifikasi otomatis telah dikirim.'}
                      {borrowStep === 7 && (borrowErrorMessage || 'Persyaratan sirkulasi tidak terpenuhi.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUT BARCODE MEMBER */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>
                    1. Barcode ID Kartu Member
                  </label>
                  {borrowMemberData ? (
                    <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>✓ Terverifikasi: {borrowMemberData.name}</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="mut" style={{ fontSize: '11px' }}>Pilih Cepat:</span>
                      {members.filter(m => m.status === 'active').slice(0, 3).map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setLoanMemberCode(m.memberCode);
                            handleVerifyMember(m.memberCode);
                          }}
                          style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#3730A3', borderRadius: '4px', fontSize: '10px', padding: '1px 5px', cursor: 'pointer', fontWeight: 600 }}
                          title={`Gunakan akun ${m.name}`}
                        >
                          {m.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="in"
                    placeholder="Scan kartu member / cth: MBR-A001..."
                    value={loanMemberCode}
                    onChange={(e) => setLoanMemberCode(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleVerifyMember(); } }}
                    disabled={borrowStep >= 3 && borrowStep <= 6}
                    style={{ background: borrowMemberData ? '#F0FDF4' : '#fff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setScannerConfig({ isOpen: true, targetField: 'member', title: 'Pindai Barcode Kartu Member' })}
                    className="btn2"
                    style={{ padding: '0 12px' }}
                    disabled={borrowStep >= 3 && borrowStep <= 6}
                  >
                    📷 Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyMember()}
                    className="btn2"
                    style={{ padding: '0 12px', color: '#2536A0', fontWeight: 600 }}
                    disabled={borrowStep >= 3 && borrowStep <= 6}
                  >
                    Cek
                  </button>
                </div>
              </div>

              {/* INPUT BARCODE EKSEMPLAR BUKU */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>
                    2. Barcode Eksemplar Buku Fisik
                  </label>
                  {borrowBookData ? (
                    <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>✓ Siap: {borrowBookData.book.title}</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="mut" style={{ fontSize: '11px' }}>Pilih Cepat:</span>
                      {books.filter(b => b.availableCopies > 0).slice(0, 3).map(b => {
                        const avail = b.copies.find(c => c.status === 'tersedia');
                        if (!avail) return null;
                        return (
                          <button
                            key={avail.copyCode}
                            type="button"
                            onClick={() => {
                              setLoanCopyCode(avail.copyCode);
                              handleVerifyBook(avail.copyCode);
                            }}
                            style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', borderRadius: '4px', fontSize: '10px', padding: '1px 5px', cursor: 'pointer', fontWeight: 600 }}
                            title={`Gunakan barcode ${avail.copyCode} (${b.title})`}
                          >
                            {b.title.slice(0, 10)}...
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="in"
                    placeholder="Scan barcode buku / cth: LIB-B01-C02..."
                    value={loanCopyCode}
                    onChange={(e) => setLoanCopyCode(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleVerifyBook(); } }}
                    disabled={borrowStep < 2 || borrowStep === 6}
                    style={{ background: borrowBookData ? '#F0FDF4' : '#fff' }}
                  />
                  <button
                    type="button"
                    onClick={() => setScannerConfig({ isOpen: true, targetField: 'book_copy', title: 'Pindai Barcode Buku Fisik' })}
                    className="btn2"
                    style={{ padding: '0 12px' }}
                    disabled={borrowStep < 2 || borrowStep === 6}
                  >
                    📷 Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyBook()}
                    className="btn2"
                    style={{ padding: '0 12px', color: '#2536A0', fontWeight: 600 }}
                    disabled={borrowStep < 2 || borrowStep === 6}
                  >
                    Cek
                  </button>
                </div>
              </div>

              {/* RINGKASAN PRA-KONFIRMASI */}
              {borrowMemberData && borrowBookData && borrowStep >= 5 && (
                <div style={{ background: '#FAFBFD', border: '1px dashed #3B82F6', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1E3A8A' }}>
                    Konfirmasi Detail Transaksi:
                  </p>
                  <div style={{ marginTop: '6px', fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>Peminjam: <b>{borrowMemberData.name}</b> ({borrowMemberData.memberCode})</div>
                    <div>Judul: <b>{borrowBookData.book.title}</b></div>
                    <div>Barcode: <code>{borrowBookData.copy.copyCode}</code></div>
                    <div>Durasi: <b>7 Hari</b> (Jatuh tempo: {new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]})</div>
                  </div>
                </div>
              )}
            </div>

            {/* TOMBOL AKSI ALUR PINJAM */}
            <div>
              {borrowStep === 5 && (
                <button
                  type="button"
                  onClick={handleConfirmBorrow}
                  className="btn"
                  style={{ width: '100%', minHeight: '40px', fontSize: '14px', fontWeight: 700 }}
                >
                  ✓ Konfirmasi & Proses Peminjaman
                </button>
              )}
              {borrowStep === 6 && (
                <button
                  type="button"
                  onClick={resetBorrowFlow}
                  className="btn"
                  style={{ width: '100%', minHeight: '38px', background: '#16A34A', fontSize: '13px' }}
                >
                  + Transaksi Peminjaman Baru
                </button>
              )}
              {borrowStep === 7 && (
                <button
                  type="button"
                  onClick={resetBorrowFlow}
                  className="btn2"
                  style={{ width: '100%', minHeight: '38px', color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  🔄 Ulangi Pemindaian
                </button>
              )}
              {borrowStep < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!borrowMemberData) handleVerifyMember();
                    else handleVerifyBook();
                  }}
                  className="btn"
                  style={{ width: '100%', minHeight: '38px', opacity: 0.9 }}
                >
                  {!borrowMemberData ? 'Verifikasi Member Terlebih Dahulu →' : 'Verifikasi Buku Terlebih Dahulu →'}
                </button>
              )}
            </div>
          </div>

          {/* KOTAK B: ALUR PENGEMBALIAN DENGAN 5 STATUS LIVE */}
          <div className="b" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Pengembalian Buku Cepat</h2>
                <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>Cek Denda Otomatis</span>
              </div>

              {/* INDIKATOR VISUAL 5 STATUS PENGEMBALIAN */}
              <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: '10px', background: returnStep === 5 ? '#FFFBEB' : returnStep === 4 ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${returnStep === 5 ? '#FCD34D' : returnStep === 4 ? '#86EFAC' : '#E2E8F0'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: returnStep === 5 ? '#D97706' : returnStep === 4 ? '#16A34A' : '#475569' }}>
                    Status Alur Pengembalian (Tahap {returnStep}/5)
                  </span>
                  <button onClick={resetReturnFlow} style={{ background: 'transparent', border: 0, color: '#64748B', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Reset
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {returnStep === 1 && '🔍'}
                    {returnStep === 2 && '📖'}
                    {returnStep === 3 && '⚖️'}
                    {returnStep === 4 && '✅'}
                    {returnStep === 5 && '⚠️'}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: returnStep === 5 ? '#B45309' : returnStep === 4 ? '#166534' : '#1E293B' }}>
                      {returnStep === 1 && '1. Menunggu scan barcode buku'}
                      {returnStep === 2 && '2. Buku berhasil ditemukan'}
                      {returnStep === 3 && '3. Menunggu konfirmasi pengembalian'}
                      {returnStep === 4 && '4. Pengembalian berhasil diproses'}
                      {returnStep === 5 && '5. Pengembalian terlambat & terdapat denda!'}
                    </p>
                    <p className="mut" style={{ margin: '2px 0 0', fontSize: '11px', color: returnStep === 5 ? '#92400E' : returnStep === 4 ? '#15803D' : '#64748B' }}>
                      {returnStep === 1 && 'Pindai barcode pada buku yang diserahkan siswa.'}
                      {returnStep === 2 && `Data pinjam terdeteksi: ${returnLoanData?.loan.bookTitle}`}
                      {returnStep === 3 && (returnLoanData?.isOverdue ? `Terlambat ${returnLoanData.daysLate} hari! Denda Rp ${returnLoanData.fineAmount.toLocaleString()}.` : 'Buku tepat waktu, tidak dikenakan denda.')}
                      {returnStep === 4 && 'Buku kembali masuk stok, status selesai, notifikasi terkirim.'}
                      {returnStep === 5 && `Tagihan denda Rp ${returnLoanData?.fineAmount.toLocaleString()} diterbitkan ke kasir.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUT SCAN PENGEMBALIAN */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Barcode Eksemplar Buku Dikembalikan
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="return_input_code"
                    className="in"
                    placeholder="Scan / ketik barcode (cth: LIB-B01-C01)..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyReturn(e.currentTarget.value);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setScannerConfig({ isOpen: true, targetField: 'return_copy', title: 'Pindai Barcode Buku yang Dikembalikan' })}
                    className="btn2"
                    style={{ padding: '0 12px' }}
                  >
                    📷 Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById('return_input_code') as HTMLInputElement;
                      if (inp) handleVerifyReturn(inp.value);
                    }}
                    className="btn2"
                    style={{ padding: '0 12px', color: '#2536A0', fontWeight: 600 }}
                  >
                    Cek
                  </button>
                </div>
                {returnErrorMessage && (
                  <p style={{ color: '#DC2626', fontSize: '12px', margin: '6px 0 0' }}>{returnErrorMessage}</p>
                )}
              </div>

              {/* DETAIL HASIL SCAN PENGEMBALIAN */}
              {returnLoanData && (
                <div style={{ background: returnLoanData.isOverdue ? '#FFFBEB' : '#F0FDF4', border: `1px solid ${returnLoanData.isOverdue ? '#FDE68A' : '#BBF7D0'}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: returnLoanData.isOverdue ? '#92400E' : '#166534' }}>
                    {returnLoanData.isOverdue ? '⚠️ Pengembalian Lewat Jatuh Tempo' : '✓ Pengembalian Tepat Waktu'}
                  </p>
                  <div style={{ marginTop: '6px', fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>Peminjam: <b>{returnLoanData.loan.memberName}</b> ({returnLoanData.loan.memberCode})</div>
                    <div>Buku: <b>{returnLoanData.loan.bookTitle}</b></div>
                    <div>Barcode: <code>{returnLoanData.loan.copyCode}</code></div>
                    <div>Jatuh Tempo: <b>{returnLoanData.loan.dueDate}</b></div>
                    {returnLoanData.isOverdue && (
                      <div style={{ gridColumn: '1 / -1', color: '#DC2626', fontWeight: 700 }}>
                        Terlambat: {returnLoanData.daysLate} Hari · Total Denda: Rp {returnLoanData.fineAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TOMBOL AKSI PENGEMBALIAN */}
            <div>
              {returnStep === 3 && (
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="btn"
                  style={{ width: '100%', minHeight: '40px', fontSize: '14px', fontWeight: 700, background: returnLoanData?.isOverdue ? '#D97706' : '#3347C4' }}
                >
                  ✓ Konfirmasi & Terima Pengembalian
                </button>
              )}
              {(returnStep === 4 || returnStep === 5) && (
                <button
                  type="button"
                  onClick={resetReturnFlow}
                  className="btn2"
                  style={{ width: '100%', minHeight: '38px', fontWeight: 600 }}
                >
                  + Pengembalian Buku Berikutnya
                </button>
              )}
              {returnStep < 3 && (
                <p className="mut" style={{ fontSize: '12px', textAlign: 'center', margin: 0 }}>
                  Pindai barcode buku untuk memunculkan data & konfirmasi pengembalian.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* TABEL SIRKULASI BERJALAN & HISTORI */}
        <div className="b" style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF0F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Riwayat & Status Transaksi Sirkulasi</h3>
              <p className="mut" style={{ fontSize: '12px', margin: '2px 0 0' }}>Data realtime transaksi peminjaman dan pengembalian perpustakaan.</p>
            </div>
            <span className="mut" style={{ fontSize: '12px' }}>Total {loans.length} transaksi sirkulasi</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Barcode Eksemplar</th>
                <th>Peminjam</th>
                <th>Judul Buku</th>
                <th>Tgl Pinjam</th>
                <th>Jatuh Tempo</th>
                <th>Tgl Kembali</th>
                <th>Status Transaksi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(l => (
                <tr key={l.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.loanCode}</td>
                  <td><code>{l.copyCode}</code></td>
                  <td><b>{l.memberName}</b><br /><span className="mut" style={{ fontSize: '11px' }}>{l.memberCode}</span></td>
                  <td><b>{l.bookTitle}</b></td>
                  <td className="mut" style={{ fontSize: '12px' }}>{l.borrowedAt}</td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: l.status === 'overdue' ? 700 : 500, color: l.status === 'overdue' ? '#DC2626' : 'inherit' }}>
                      {l.dueDate}
                    </span>
                  </td>
                  <td className="mut" style={{ fontSize: '12px' }}>{l.returnedAt || '-'}</td>
                  <td>
                    <span className={`tag ${l.status === 'returned' ? 'ok' : l.status === 'overdue' ? 'bad' : 'warn'}`}>
                      {l.status === 'returned' ? '✓ Selesai Dikembalikan' : l.status === 'overdue' ? '⚠️ Terlambat' : '📖 Dipinjam'}
                    </span>
                  </td>
                  <td>
                    {l.status !== 'returned' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleVerifyReturn(l.copyCode)}
                          className="btn"
                          style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                          title="Proses Pengembalian"
                        >
                          Kembalikan
                        </button>
                        <button
                          onClick={() => handleExtendLoan(l.id)}
                          className="btn2"
                          style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                          title="Perpanjang 7 hari"
                        >
                          +7 Hari
                        </button>
                      </div>
                    ) : (
                      <span className="mut" style={{ fontSize: '12px' }}>Tutup</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABEL DENDA SIRKULASI */}
        <div className="b" style={{ overflowX: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF0F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Daftar Denda & Sanksi Keterlambatan</h3>
              <p className="mut" style={{ fontSize: '12px', margin: '2px 0 0' }}>Tarif keterlambatan: Rp 1.000 / hari per buku.</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID Anggota</th>
                <th>Nama Anggota</th>
                <th>Judul Buku</th>
                <th>Hari Terlambat</th>
                <th>Nominal Denda</th>
                <th>Status Denda</th>
                <th>Aksi Kasir</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(f => (
                <tr key={f.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{f.memberCode}</td>
                  <td><b>{f.memberName}</b></td>
                  <td>{f.bookTitle}</td>
                  <td>{f.daysOverdue} hari</td>
                  <td><b style={{ color: '#DC2626' }}>Rp {f.amount.toLocaleString()}</b></td>
                  <td>
                    <span className={`tag ${f.status === 'lunas' ? 'ok' : 'bad'}`}>
                      {f.status === 'lunas' ? 'LUNAS' : 'BELUM DIBAYAR'}
                    </span>
                  </td>
                  <td>
                    {f.status === 'belum_dibayar' ? (
                      <button
                        onClick={() => {
                          setFines(fines.map(item => item.id === f.id ? { ...item, status: 'lunas' } : item));
                          addNotification({
                            recipientRole: 'member',
                            recipientCode: f.memberCode,
                            title: 'Denda Keterlambatan Dilunasi',
                            message: `Pembayaran denda Rp ${f.amount.toLocaleString()} untuk buku "${f.bookTitle}" telah diterima. Status akun kembali bersih.`,
                            type: 'fine'
                          });
                          showToast(`✅ Denda sebesar Rp ${f.amount.toLocaleString()} berhasil dilunasi!`);
                        }}
                        className="btn"
                        style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
                      >
                        Tandai Lunas
                      </button>
                    ) : (
                      <span className="mut" style={{ fontSize: '12px' }}>Sudah Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleReserve = (bk: Book) => {
    if (currentUser.role === 'guest') {
      showToast('Silakan masuk terlebih dahulu untuk reservasi.');
      setCurrentRoute('masuk');
      return;
    }
    const newRes: Reservation = {
      id: 'r' + Date.now(),
      bookTitle: bk.title,
      memberCode: currentUser.code || 'MBR-A001',
      memberName: currentUser.name,
      reservedAt: new Date().toISOString().split('T')[0],
      status: 'menunggu'
    };
    setReservations([newRes, ...reservations]);

    addNotification({
      recipientRole: 'librarian',
      title: 'Permintaan Reservasi Baru',
      message: `${currentUser.name} (${currentUser.code || 'MBR-A001'}) mengajukan reservasi buku "${bk.title}".`,
      type: 'reservation'
    });

    showToast(`✅ Reservasi "${bk.title}" berhasil diajukan!`);
  };

  const handleExtendLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + 7);
    const newDueDate = currentDue.toISOString().split('T')[0];
    setLoans(loans.map(l => l.id === loanId ? { ...l, dueDate: newDueDate } : l));

    addNotification({
      recipientRole: 'member',
      recipientCode: loan.memberCode,
      title: 'Perpanjangan Berhasil Disetujui',
      message: `Peminjaman buku "${loan.bookTitle}" diperpanjang hingga ${newDueDate}.`,
      type: 'circulation'
    });

    showToast(`✅ Masa pinjam diperpanjang 7 hari hingga ${newDueDate}!`);
  };

  // Helper untuk membuka dialog cetak label buku (Fitur 5)
  const openLabelModalForBook = (book: Book, specificCopyCode?: string) => {
    const targetCopies = specificCopyCode
      ? book.copies.filter(c => c.copyCode === specificCopyCode)
      : book.copies;

    const labelsData: CopyLabelData[] = targetCopies.map(c => ({
      bookTitle: book.title,
      author: book.author,
      category: book.category,
      callNumber: book.callNumber,
      shelfLocation: book.shelfLocation,
      copyCode: c.copyCode
    }));

    setLabelModal({
      isOpen: true,
      labels: labelsData,
      title: specificCopyCode ? `Pratinjau Label: ${specificCopyCode}` : `Pratinjau Seluruh Label: ${book.title}`
    });
  };

  // Filtered books
  const filteredBooks = books.filter(b => {
    const matchCat = selectedCategory === 'Semua' || b.category === selectedCategory;
    const matchQuery = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       b.isbn.includes(searchQuery);
    return matchCat && matchQuery;
  });

  // Admin / Petugas Book Filter & Pagination
  const filteredAdminBooks = books.filter(b => {
    const matchCat = adminBookCategory === 'Semua' || b.category === adminBookCategory;
    const matchQuery = b.title.toLowerCase().includes(adminBookSearch.toLowerCase()) ||
                       b.author.toLowerCase().includes(adminBookSearch.toLowerCase()) ||
                       b.isbn.includes(adminBookSearch);
    return matchCat && matchQuery;
  });
  const totalAdminBookPages = Math.ceil(filteredAdminBooks.length / booksPerPage) || 1;
  const paginatedAdminBooks = filteredAdminBooks.slice((adminBookPage - 1) * booksPerPage, adminBookPage * booksPerPage);

  // Admin / Petugas Member Filter & Pagination
  const filteredAdminMembers = members.filter(m => {
    const matchStatus = adminMemberStatus === 'Semua' || m.status === adminMemberStatus;
    const matchQuery = m.name.toLowerCase().includes(adminMemberSearch.toLowerCase()) ||
                       m.memberCode.toLowerCase().includes(adminMemberSearch.toLowerCase()) ||
                       m.email.toLowerCase().includes(adminMemberSearch.toLowerCase());
    return matchStatus && matchQuery;
  });
  const totalAdminMemberPages = Math.ceil(filteredAdminMembers.length / membersPerPage) || 1;
  const paginatedAdminMembers = filteredAdminMembers.slice((adminMemberPage - 1) * membersPerPage, adminMemberPage * membersPerPage);

  // Reusable Notification Bell
  const renderNotificationBell = () => {
    if (currentUser.role === 'guest') return null;

    return (
      <div ref={notifDropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
          title="Notifikasi"
          style={{
            position: 'relative',
            background: isNotifDropdownOpen ? '#E9ECFB' : '#F1F3F7',
            border: '1px solid #E3E6EC',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#2536A0',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>

          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#EF4444',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '99px',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px #ffffff'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isNotifDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '340px',
              maxWidth: '90vw',
              background: '#ffffff',
              border: '1px solid #E3E6EC',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #EEF0F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFBFD' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1B1F2A' }}>Notifikasi</span>
                {unreadCount > 0 && (
                  <span style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>
                    {unreadCount} baru
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{ background: 'transparent', border: 0, color: '#3347C4', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {userNotifications.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#6B7280' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Tidak ada notifikasi baru</p>
                </div>
              ) : (
                userNotifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => markSingleAsRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #EEF0F4',
                      background: n.isRead ? '#ffffff' : '#F4F7FF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: n.isRead ? 600 : 700, color: '#1B1F2A' }}>{n.title}</p>
                      {!n.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: '4px' }}></span>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#4B5563', marginTop: '3px', lineHeight: '1.4' }}>{n.message}</p>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', display: 'block' }}>{n.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid #EEF0F4', textAlign: 'center', background: '#FAFBFD' }}>
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(false);
                  setCurrentRoute('all_notifikasi');
                }}
                style={{ background: 'transparent', border: 0, color: '#3347C4', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', padding: '4px 0' }}
              >
                Lihat Semua Notifikasi →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========================================================
  // 1. PUBLIC WEBSITE ROUTE
  // ========================================================
  const isPublicWebRoute = ['beranda', 'katalog', 'detail_buku', 'masuk', 'member_dashboard', 'member_riwayat', 'member_profil', 'all_notifikasi'].includes(currentRoute);

  if (isPublicWebRoute) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F6F7F9' }}>
        
        {currentUser.role === 'admin' && (
          <div style={{ background: '#1E293B', color: '#E2E8F0', padding: '8px 36px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>👀 Mode Pratinjau Tampilan Web Member (Anda login sebagai Administrator)</span>
            <button
              onClick={() => { setSubPage('dashboard'); setCurrentRoute('admin_dashboard'); }}
              style={{ background: '#3347C4', border: 0, color: '#fff', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Kembali ke Dashboard Admin
            </button>
          </div>
        )}

        {/* NAVBAR */}
        <header className="b" style={{ borderRadius: 0, borderWidth: '0 0 1px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', padding: '14px 36px', background: '#fff' }}>
          <div onClick={() => setCurrentRoute('beranda')} className="logo" style={{ padding: 0, fontSize: '22px' }}>
            Librava
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentRoute('beranda')}
                style={{ padding: '8px 14px', color: currentRoute === 'beranda' ? '#2536A0' : '#4B5563', fontWeight: currentRoute === 'beranda' ? 700 : 500, fontSize: '14px', background: 'transparent', border: 0, cursor: 'pointer' }}
              >
                Beranda
              </button>
              <button
                onClick={() => setCurrentRoute('katalog')}
                style={{ padding: '8px 14px', color: currentRoute === 'katalog' ? '#2536A0' : '#4B5563', fontWeight: currentRoute === 'katalog' ? 700 : 500, fontSize: '14px', background: 'transparent', border: 0, cursor: 'pointer' }}
              >
                Katalog
              </button>
            </nav>

            {currentUser.role === 'guest' && (
              <button onClick={() => setCurrentRoute('masuk')} className="btn" style={{ minHeight: '38px', padding: '0 20px' }}>
                Masuk
              </button>
            )}

            {renderNotificationBell()}

            {currentUser.role !== 'guest' && (
              <div ref={profileDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F1F3F7', border: '1px solid #E3E6EC', borderRadius: '99px', padding: '6px 14px 6px 8px', cursor: 'pointer' }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#3347C4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1B1F2A' }}>{currentUser.name}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '46px', width: '220px', background: '#fff', border: '1px solid #E3E6EC', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEF0F4', background: '#FAFBFD' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1B1F2A' }}>{currentUser.name}</p>
                      <p className="mut" style={{ fontSize: '12px' }}>ID: {currentUser.code || 'MBR-A001'}</p>
                    </div>

                    <button
                      onClick={() => { setCurrentRoute('member_dashboard'); setIsProfileDropdownOpen(false); }}
                      style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 0, textAlign: 'left', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}
                    >
                      <span>🪪</span> Kartu Member & Profil
                    </button>

                    <button
                      onClick={() => { setCurrentRoute('member_riwayat'); setIsProfileDropdownOpen(false); }}
                      style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 0, textAlign: 'left', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}
                    >
                      <span>📖</span> Riwayat Peminjaman
                    </button>

                    <div style={{ borderTop: '1px solid #EEF0F4' }}>
                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 0, textAlign: 'left', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#DC2626' }}
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#1E293B', color: '#fff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', zIndex: 99999, fontSize: '14px' }}>
            {toast}
          </div>
        )}

        {/* BERANDA */}
        {currentRoute === 'beranda' && (
          <div style={{ flex: 1 }}>
            <section style={{ padding: '64px 32px', textAlign: 'center', background: '#E9ECFB' }}>
              <h1 style={{ fontSize: '38px', fontWeight: 700, color: '#1B1F2A' }}>Perpustakaan sekolah, lebih mudah dijelajahi</h1>
              <p className="mut" style={{ margin: '10px auto 0', maxWidth: '520px', fontSize: '16px' }}>
                Cari buku, cek ketersediaan, dan pantau pinjamanmu dalam satu tempat.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', maxWidth: '600px', margin: '24px auto 0', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', textAlign: 'left' }}>
                  <label htmlFor="search_input">Cari buku</label>
                  <input
                    id="search_input"
                    className="in"
                    placeholder="Judul, penulis, atau ISBN"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setCurrentRoute('katalog'); }}
                  />
                </div>
                <button onClick={() => setCurrentRoute('katalog')} className="btn" style={{ alignSelf: 'flex-end' }}>
                  Cari
                </button>
              </div>
            </section>

            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px 0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1B1F2A' }}>Kategori</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', margin: '14px 0 0' }}>
                {['Fiksi', 'Pelajaran', 'Sains', 'Sejarah'].map(cat => (
                  <div
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setCurrentRoute('katalog'); }}
                    className="b"
                    style={{ padding: '18px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </section>

            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 32px 48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1B1F2A' }}>Buku populer</h2>
                <button onClick={() => setCurrentRoute('katalog')} className="btn2">Lihat semua katalog</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '14px' }}>
                {books.slice(0, 4).map(bk => (
                  <article
                    key={bk.id}
                    onClick={() => { setSelectedBook(bk); setCurrentRoute('detail_buku'); }}
                    className="b"
                    style={{ padding: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <BookCover book={bk} aspectRatio="2 / 3" hoverEffect={true} borderRadius="8px" />
                    <h3 style={{ fontSize: '15px', marginTop: '12px', fontWeight: 700, lineHeight: 1.3 }}>{bk.title}</h3>
                    <p className="mut" style={{ marginTop: '2px', fontSize: '13px' }}>{bk.author}</p>
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', background: '#F1F3F7', padding: '2px 8px', borderRadius: '4px' }}>{bk.category}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: bk.availableCopies > 0 ? '#14673A' : '#9B1C1C' }}>
                        {bk.availableCopies > 0 ? `${bk.availableCopies} Tersedia` : 'Dipinjam'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* KATALOG */}
        {currentRoute === 'katalog' && (
          <div style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0 32px', flex: 1, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Katalog Perpustakaan</h1>
                <p className="mut" style={{ marginTop: '4px' }}>Temukan buku favorit dan literatur referensi sekolah.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  className="in"
                  style={{ width: '260px' }}
                  placeholder="Cari judul, penulis, atau ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="in"
                  style={{ width: '160px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Fiksi">Fiksi</option>
                  <option value="Pelajaran">Pelajaran</option>
                  <option value="Sains">Sains</option>
                  <option value="Sejarah">Sejarah</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '24px', marginBottom: '48px' }}>
              {filteredBooks.map(bk => (
                <article
                  key={bk.id}
                  onClick={() => { setSelectedBook(bk); setCurrentRoute('detail_buku'); }}
                  className="b"
                  style={{ padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
                >
                  <div>
                    <BookCover book={bk} aspectRatio="2 / 3" hoverEffect={true} borderRadius="8px" />
                    <h3 style={{ fontSize: '16px', marginTop: '12px', fontWeight: 700, lineHeight: 1.3 }}>{bk.title}</h3>
                    <p className="mut" style={{ marginTop: '2px', fontSize: '13px' }}>{bk.author} ({bk.year})</p>
                    <p style={{ fontSize: '13px', color: '#4B5563', marginTop: '8px', lineHeight: '1.4' }}>{bk.description.slice(0, 80)}...</p>
                  </div>
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #EEF0F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#3347C4' }}>{bk.callNumber}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: bk.availableCopies > 0 ? '#14673A' : '#9B1C1C' }}>
                        {bk.availableCopies > 0 ? `${bk.availableCopies} Tersedia` : 'Semua Dipinjam'}
                      </span>
                      {bk.availableCopies > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickBorrowModal({ isOpen: true, book: bk });
                          }}
                          style={{ background: '#2563EB', color: '#fff', border: 0, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          title="Pinjam cepat buku ini"
                        >
                          ⚡ Pinjam
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* DETAIL BUKU & LABEL CETAK (Fitur 5) */}
        {currentRoute === 'detail_buku' && (
          <div style={{ maxWidth: '1000px', margin: '36px auto', padding: '0 32px', flex: 1, width: '100%' }}>
            <button onClick={() => setCurrentRoute('katalog')} className="btn2" style={{ minHeight: '36px', padding: '0 12px', marginBottom: '16px' }}>
              ← Kembali ke Katalog
            </button>
            <div className="b" style={{ padding: '32px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
              <div>
                <BookCover book={selectedBook} aspectRatio="2 / 3" borderRadius="10px" />
                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedBook.availableCopies > 0 ? (
                    <button
                      onClick={() => setQuickBorrowModal({ isOpen: true, book: selectedBook })}
                      className="btn"
                      style={{ width: '100%', background: '#2563EB', fontWeight: 700 }}
                    >
                      ⚡ Pinjam Cepat Sekarang
                    </button>
                  ) : (
                    <button
                      disabled
                      className="btn2"
                      style={{ width: '100%', background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }}
                    >
                      Stok Sedang Habis
                    </button>
                  )}
                  <button onClick={() => handleReserve(selectedBook)} className="btn2" style={{ width: '100%' }}>
                    Ajukan Reservasi
                  </button>
                </div>
              </div>
              <div>
                <span className="tag ok" style={{ background: '#E9ECFB', color: '#2536A0', padding: '4px 10px' }}>
                  {selectedBook.category}
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginTop: '10px' }}>{selectedBook.title}</h1>
                <p className="mut" style={{ fontSize: '15px', marginTop: '4px' }}>Penulis: <strong style={{ color: '#1B1F2A' }}>{selectedBook.author}</strong></p>
                <p className="mut" style={{ fontSize: '14px' }}>Penerbit: {selectedBook.publisher} ({selectedBook.year})</p>

                <div style={{ margin: '20px 0', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E3E6EC', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <span className="mut" style={{ fontSize: '12px' }}>Nomor Panggil</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{selectedBook.callNumber}</p>
                  </div>
                  <div>
                    <span className="mut" style={{ fontSize: '12px' }}>Lokasi Rak</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{selectedBook.shelfLocation}</p>
                  </div>
                  <div>
                    <span className="mut" style={{ fontSize: '12px' }}>Ketersediaan</span>
                    <p style={{ fontWeight: 600, marginTop: '2px', color: selectedBook.availableCopies > 0 ? '#14673A' : '#9B1C1C' }}>
                      {selectedBook.availableCopies} dari {selectedBook.totalCopies} eksemplar
                    </p>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Sinopsis / Deskripsi</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>{selectedBook.description}</p>
                </div>
                <p className="mut" style={{ marginTop: '14px', fontSize: '13px' }}>ISBN: {selectedBook.isbn}</p>

                {/* TABEL BARCODE EKSEMPLAR & TOMBOL CETAK LABEL BUKU */}
                <div style={{ marginTop: '24px', borderTop: '1px solid #EEF0F4', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Label & Barcode Eksemplar Fisik</h3>
                    <button
                      onClick={() => openLabelModalForBook(selectedBook)}
                      className="btn2"
                      style={{ fontSize: '12px', minHeight: '32px' }}
                    >
                      🏷️ Cetak Semua Label Buku (PDF)
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {selectedBook.copies.map((c, idx) => (
                      <div key={c.copyCode} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Eksemplar #{idx + 1}</span>
                        <BarcodeItem value={c.copyCode} width={1.2} height={36} fontSize={10} />
                        <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '99px',
                            background: c.status === 'tersedia' ? '#E4F5EA' : '#FBE5E5',
                            color: c.status === 'tersedia' ? '#14673A' : '#9B1C1C'
                          }}>
                            {c.status.toUpperCase()}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {c.status === 'tersedia' && (
                              <button
                                onClick={() => setQuickBorrowModal({ isOpen: true, book: selectedBook, copyCode: c.copyCode })}
                                style={{ background: '#2563EB', border: 0, color: '#fff', borderRadius: '4px', fontSize: '10px', padding: '2px 6px', fontWeight: 600, cursor: 'pointer' }}
                                title="Pinjam eksemplar ini langsung"
                              >
                                ⚡ Pinjam
                              </button>
                            )}
                            <button
                              onClick={() => openLabelModalForBook(selectedBook, c.copyCode)}
                              style={{ background: 'transparent', border: 0, color: '#3347C4', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Cetak Label
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD & KARTU DIGITAL MEMBER */}
        {(currentRoute === 'member_dashboard' || currentRoute === 'member_riwayat' || currentRoute === 'member_profil') && (
          <div style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0 32px', flex: 1, width: '100%' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', color: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '520px', marginBottom: '28px', boxShadow: '0 10px 25px rgba(37,99,235,0.25)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85 }}>KARTU ANGGOTA PERPUSTAKAAN DIGITAL</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{currentUser.name}</h2>
                  <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>Kelas: XII IPA 1 · SMA Perpustakaan</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}>
                  LIBRAVA
                </div>
              </div>

              <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '10px', marginTop: '20px', textAlign: 'center' }}>
                <BarcodeItem value={currentUser.code || 'MBR-A001'} width={1.8} height={46} fontSize={12} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '12px', opacity: 0.9 }}>
                <span>ID Anggota: <b>{currentUser.code || 'MBR-A001'}</b></span>
                <button
                  onClick={() => {
                    const mem = members.find(m => m.memberCode === (currentUser.code || 'MBR-A001')) || members[0];
                    setMemberCardModal({ isOpen: true, member: mem });
                  }}
                  style={{ background: '#fff', color: '#1E3A8A', border: 0, padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                >
                  🖨️ Cetak Kartu
                </button>
              </div>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Ringkasan Pinjaman & Reservasi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div className="b" style={{ padding: '18px' }}>
                <p className="mut">Pinjaman aktif</p>
                <p style={{ fontSize: '30px', fontWeight: 700, marginTop: '6px' }}>
                  {loans.filter(l => l.memberCode === (currentUser.code || 'MBR-A001') && l.status === 'active').length}
                </p>
              </div>
              <div className="b" style={{ padding: '18px' }}>
                <p className="mut">Jatuh tempo terdekat</p>
                <p style={{ fontSize: '30px', fontWeight: 700, marginTop: '6px' }}>2 Nov</p>
              </div>
              <div className="b" style={{ padding: '18px' }}>
                <p className="mut">Reservasi aktif</p>
                <p style={{ fontSize: '30px', fontWeight: 700, marginTop: '6px' }}>
                  {reservations.filter(r => r.memberCode === (currentUser.code || 'MBR-A001')).length}
                </p>
              </div>
              <div className="b" style={{ padding: '18px' }}>
                <p className="mut">Denda belum dibayar</p>
                <p style={{ fontSize: '30px', fontWeight: 700, marginTop: '6px' }}>Rp0</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 700 }}>
                  {currentRoute === 'member_riwayat' ? 'Riwayat Transaksi Peminjaman & Pengembalian' : 'Ringkasan & Pinjaman Saya'}
                </h2>
                <p className="mut" style={{ fontSize: '13px' }}>Pantau status buku pinjaman fisik, tanggal jatuh tempo, denda, dan riwayat pengembalian.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentRoute('member_dashboard')}
                  className={currentRoute === 'member_dashboard' ? 'btn' : 'btn2'}
                  style={{ minHeight: '34px', fontSize: '12px' }}
                >
                  Pinjaman Aktif
                </button>
                <button
                  onClick={() => setCurrentRoute('member_riwayat')}
                  className={currentRoute === 'member_riwayat' ? 'btn' : 'btn2'}
                  style={{ minHeight: '34px', fontSize: '12px' }}
                >
                  Semua Riwayat Transaksi
                </button>
              </div>
            </div>

            <section className="b" style={{ marginTop: '16px', overflowX: 'auto', marginBottom: '40px' }}>
              <table>
                <thead>
                  <tr>
                    <th>No. Transaksi</th>
                    <th>Barcode Eksemplar</th>
                    <th>Judul Buku</th>
                    <th>Tgl Pinjam</th>
                    <th>Batas Jatuh Tempo</th>
                    <th>Tgl Pengembalian</th>
                    <th>Status Transaksi</th>
                    <th>Aksi Pinjaman</th>
                  </tr>
                </thead>
                <tbody>
                  {loans
                    .filter(l => l.memberCode === (currentUser.code || 'MBR-A001'))
                    .filter(l => currentRoute === 'member_riwayat' ? true : l.status !== 'returned')
                    .map(l => (
                      <tr key={l.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.loanCode}</td>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3347C4' }}>{l.copyCode}</span></td>
                        <td><b>{l.bookTitle}</b></td>
                        <td className="mut" style={{ fontSize: '12px' }}>{l.borrowedAt}</td>
                        <td style={{ fontWeight: l.status === 'overdue' ? 700 : 500, color: l.status === 'overdue' ? '#DC2626' : 'inherit' }}>
                          {l.dueDate}
                        </td>
                        <td className="mut" style={{ fontSize: '12px' }}>
                          {l.returnedAt || '-'}
                        </td>
                        <td>
                          {l.status === 'returned' ? (
                            <span className="tag" style={{ background: '#DCFCE7', color: '#166534' }}>✓ Berhasil Dikembalikan</span>
                          ) : l.status === 'overdue' ? (
                            <span className="tag bad">⚠️ Terlambat ({l.daysOverdue || 1} Hari)</span>
                          ) : (
                            <span className="tag ok">📖 Sedang Dipinjam</span>
                          )}
                        </td>
                        <td>
                          {l.status === 'active' && (
                            <button onClick={() => handleExtendLoan(l.id)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>
                              Perpanjang (+7 Hari)
                            </button>
                          )}
                          {l.status === 'returned' && (
                            <span className="mut" style={{ fontSize: '12px' }}>Selesai</span>
                          )}
                          {l.status === 'overdue' && (
                            <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>Harap Kembalikan Segera</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {loans.filter(l => l.memberCode === (currentUser.code || 'MBR-A001')).length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                        Belum ada riwayat transaksi peminjaman.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* MASUK / LOGIN */}
        {currentRoute === 'masuk' && (
          <div style={{ maxWidth: '420px', margin: '60px auto', padding: '0 24px', flex: 1, width: '100%' }}>
            <div className="b" style={{ padding: '36px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div className="logo" style={{ textAlign: 'center', padding: '0 0 16px', fontSize: '26px' }}>
                Librava
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>Masuk ke Sistem</h1>
              <p className="mut" style={{ textAlign: 'center', marginTop: '4px', marginBottom: '24px' }}>
                Akses perpustakaan untuk Siswa, Petugas & Administrator.
              </p>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="login_email">Email / ID Barcode Anggota</label>
                  <input
                    id="login_email"
                    className="in"
                    required
                    placeholder="Contoh: rani@siswa.sch.id / MBR-A001"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label htmlFor="login_pass">Kata Sandi</label>
                  <input
                    id="login_pass"
                    type="password"
                    required
                    className="in"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn" style={{ width: '100%', marginBottom: '12px' }}>
                  Masuk Sekarang
                </button>
              </form>

              <div style={{ borderTop: '1px solid #EEF0F4', paddingTop: '16px', marginTop: '16px' }}>
                <p className="mut" style={{ fontSize: '12px', textAlign: 'center', marginBottom: '8px' }}>Uji Coba Cepat (Akun Demo Sesuai Role):</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <button onClick={() => { setLoginEmail('rani@siswa.sch.id'); setLoginPassword('123456'); }} className="btn2" style={{ minHeight: '34px', fontSize: '12px', padding: 0 }}>
                    Siswa / Member
                  </button>
                  <button onClick={() => { setLoginEmail('joko@petugas.sch.id'); setLoginPassword('123456'); }} className="btn2" style={{ minHeight: '34px', fontSize: '12px', padding: 0 }}>
                    Petugas
                  </button>
                  <button onClick={() => { setLoginEmail('admin@sekolah.sch.id'); setLoginPassword('123456'); }} className="btn2" style={{ minHeight: '34px', fontSize: '12px', padding: 0 }}>
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ padding: '24px 32px', borderTop: '1px solid #E3E6EC', background: '#fff', textAlign: 'center' }}>
          <p className="mut">Librava · Modern School Library Management System · Jam layanan 07.30 - 16.00 WIB · Kontak: perpustakaan@sekolah.sch.id</p>
        </footer>
      </div>
    );
  }

  // ========================================================
  // 2. DASHBOARD PETUGAS
  // ========================================================
  if (currentRoute === 'petugas_dashboard') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh', background: '#F6F7F9' }}>
        
        {/* SIDEBAR PETUGAS */}
        <aside style={{ width: '232px', background: '#fff', borderRight: '1px solid #E3E6EC', padding: '20px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="logo">Librava</div>
            <nav className="nav">
              <button onClick={() => setSubPage('dashboard')} className={subPage === 'dashboard' ? 'on' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </button>

              <button onClick={() => setSubPage('sirkulasi')} className={subPage === 'sirkulasi' ? 'on' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8h14l-4-4M20 16H6l4 4"></path>
                </svg>
                Sirkulasi Barcode
              </button>

              {/* Menu "Katalog dan Eksemplar" Petugas Sesuai Butir 1 */}
              <button onClick={() => setSubPage('katalog_petugas')} className={subPage === 'katalog_petugas' ? 'on' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h14v16H6a2 2 0 0 1-2-2zM8 4v12"></path>
                </svg>
                Katalog dan Eksemplar
              </button>

              {/* Menu "Anggota" Petugas Sesuai Butir 2 */}
              <button onClick={() => setSubPage('anggota_petugas')} className={subPage === 'anggota_petugas' ? 'on' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M4 21a8 8 0 0 1 16 0"></path>
                </svg>
                Anggota
              </button>

              <button onClick={() => setSubPage('denda')} className={subPage === 'denda' ? 'on' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Denda
              </button>

              <button onClick={() => setSubPage('laporan')} className={subPage === 'laporan' ? 'on' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>
                </svg>
                Laporan
              </button>
            </nav>
          </div>

          <div style={{ borderTop: '1px solid #E3E6EC', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700 }}>{currentUser.name}</p>
            <p className="mut" style={{ fontSize: '12px' }}>Petugas Sirkulasi</p>
            <button onClick={handleLogout} className="btn2" style={{ width: '100%', minHeight: '34px', fontSize: '12px', marginTop: '10px' }}>
              Keluar
            </button>
          </div>
        </aside>

        {/* WORKSPACE PETUGAS */}
        <main style={{ flex: 1, minWidth: '320px', padding: '28px 36px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Dashboard Petugas</h1>
              <p className="mut" style={{ marginTop: '4px' }}>Kelola operasional buku, eksemplar, anggota, dan sirkulasi barcode.</p>
            </div>
            {renderNotificationBell()}
          </div>

          {toast && (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#1E293B', color: '#fff', padding: '12px 20px', borderRadius: '8px', zIndex: 99999 }}>
              {toast}
            </div>
          )}

          {/* DASHBOARD SUMMARY PETUGAS */}
          {subPage === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginTop: '10px' }}>
                <div className="b st"><p>Transaksi sirkulasi</p><p>{loans.length}</p></div>
                <div className="b st"><p>Jatuh tempo hari ini</p><p>2</p></div>
                <div className="b st"><p>Antrean reservasi</p><p>{reservations.filter(r => r.status === 'menunggu').length}</p></div>
                <div className="b st"><p>Terlambat</p><p style={{ color: '#9B1C1C' }}>{loans.filter(l => l.status === 'overdue').length}</p></div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setSubPage('sirkulasi')} className="btn">
                  📷 Sirkulasi & Scan Barcode
                </button>
                <button onClick={() => setSubPage('katalog_petugas')} className="btn2">
                  📚 Buka Katalog & Eksemplar
                </button>
                <button onClick={() => setSubPage('anggota_petugas')} className="btn2">
                  👥 Periksa Anggota
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '24px' }}>
                <section className="b" style={{ flex: 2, minWidth: '320px', overflowX: 'auto' }}>
                  <h2 style={{ fontSize: '17px', padding: '18px 18px 6px', fontWeight: 700 }}>Jatuh tempo hari ini</h2>
                  <table>
                    <thead>
                      <tr><th>Barcode Eksemplar</th><th>Anggota</th><th>Judul</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>LIB-B04-C01</code></td>
                        <td>Rani Maharani (MBR-A001)</td>
                        <td>Matematika Dasar SMA Kelas XI</td>
                        <td><span className="tag warn">Hari ini</span></td>
                      </tr>
                      <tr>
                        <td><code>LIB-B02-C01</code></td>
                        <td>Budi Santoso (MBR-A002)</td>
                        <td>Bumi Manusia</td>
                        <td><span className="tag bad">Terlambat 6 hari</span></td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section className="b" style={{ flex: 1, minWidth: '260px', padding: '18px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Antrean reservasi</h2>
                  <p style={{ marginTop: '12px', fontSize: '14px' }}>
                    <b>Bumi Manusia</b><br /><span className="mut">2 anggota mengantre</span>
                  </p>
                  <button onClick={() => showToast('Buku ditandai siap diambil!')} className="btn2" style={{ marginTop: '10px' }}>
                    Tandai siap diambil
                  </button>
                </section>
              </div>
            </div>
          )}

          {/* SIRKULASI BARCODE PETUGAS (FITUR 7: LIVE STATUS & NOTIFIKASI OTOMATIS) */}
          {subPage === 'sirkulasi' && renderCirculationBarcodeSection(false)}

          {/* KATALOG DAN EKSEMPLAR PETUGAS (CRUD: Tambah, Edit, Kelola Eksemplar, Cetak Label - TIDAK BISA HAPUS BUKU) */}
          {subPage === 'katalog_petugas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Katalog dan Eksemplar Buku</h2>
                  <p className="mut" style={{ fontSize: '13px' }}>Petugas dapat menambah judul, mengedit data, dan mengelola eksemplar fisik.</p>
                </div>
                <button
                  onClick={() => setBookModal({ isOpen: true, mode: 'add' })}
                  className="btn"
                >
                  + Tambah Buku Baru
                </button>
              </div>

              {/* Filter & Pencarian */}
              <div className="b" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  className="in"
                  placeholder="Cari judul, ISBN, atau penulis..."
                  value={adminBookSearch}
                  onChange={(e) => { setAdminBookSearch(e.target.value); setAdminBookPage(1); }}
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <select
                  className="in"
                  value={adminBookCategory}
                  onChange={(e) => { setAdminBookCategory(e.target.value); setAdminBookPage(1); }}
                  style={{ width: '180px' }}
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Fiksi">Fiksi</option>
                  <option value="Pelajaran">Pelajaran</option>
                  <option value="Sains">Sains</option>
                  <option value="Sejarah">Sejarah</option>
                </select>
              </div>

              {/* Tabel Buku Petugas */}
              <div className="b" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Judul & Penulis</th>
                      <th>ISBN</th>
                      <th>Kategori</th>
                      <th>Nomor Panggil</th>
                      <th>Stok</th>
                      <th>Aksi Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdminBooks.map(b => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ width: '42px', height: '60px', borderRadius: '4px', overflow: 'hidden' }}>
                            <BookCover book={b} width="42px" height="60px" borderRadius="4px" />
                          </div>
                        </td>
                        <td>
                          <b>{b.title}</b>
                          <p className="mut" style={{ fontSize: '12px' }}>{b.author} ({b.year})</p>
                        </td>
                        <td className="mut" style={{ fontSize: '12px' }}>{b.isbn}</td>
                        <td><span className="tag ok" style={{ background: '#F1F3F7', color: '#1B1F2A' }}>{b.category}</span></td>
                        <td><b>{b.callNumber}</b><br /><span className="mut" style={{ fontSize: '11px' }}>{b.shelfLocation}</span></td>
                        <td><b>{b.availableCopies}</b> / {b.totalCopies}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setBookModal({ isOpen: true, mode: 'edit', bookData: b })}
                              className="btn2"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setCopyManageModal({ isOpen: true, book: b })}
                              className="btn2"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px', color: '#2563EB' }}
                            >
                              Eksemplar ({b.copies.length})
                            </button>
                            <button
                              onClick={() => openLabelModalForBook(b)}
                              className="btn2"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                              title="Cetak Label Buku PDF"
                            >
                              🏷️ Label
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedAdminBooks.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>Buku tidak ditemukan.</td></tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #EEF0F4' }}>
                  <span className="mut" style={{ fontSize: '12px' }}>Halaman {adminBookPage} dari {totalAdminBookPages} ({filteredAdminBooks.length} buku)</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button disabled={adminBookPage <= 1} onClick={() => setAdminBookPage(p => p - 1)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Sebelumnya</button>
                    <button disabled={adminBookPage >= totalAdminBookPages} onClick={() => setAdminBookPage(p => p + 1)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Berikutnya</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANGGOTA PETUGAS (Lihat, Cari, Daftarkan Anggota Baru, Edit Data - TIDAK BISA HAPUS ANGGOTA) */}
          {subPage === 'anggota_petugas' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Daftar Anggota Perpustakaan</h2>
                  <p className="mut" style={{ fontSize: '13px' }}>Petugas dapat mendaftarkan siswa baru dan memeriksa status keanggotaan.</p>
                </div>
                <button
                  onClick={() => setMemberModal({ isOpen: true, mode: 'add' })}
                  className="btn"
                >
                  + Daftarkan Anggota Baru
                </button>
              </div>

              {/* Pencarian Anggota */}
              <div className="b" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
                <input
                  className="in"
                  placeholder="Cari nama, ID member, atau email anggota..."
                  value={adminMemberSearch}
                  onChange={(e) => { setAdminMemberSearch(e.target.value); setAdminMemberPage(1); }}
                  style={{ flex: 1 }}
                />
              </div>

              <div className="b" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID Barcode</th>
                      <th>Nama Lengkap</th>
                      <th>Kelas / Jabatan</th>
                      <th>Kontak & Alamat</th>
                      <th>Status</th>
                      <th>Aksi Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdminMembers.map(m => (
                      <tr key={m.id}>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3347C4' }}>{m.memberCode}</span></td>
                        <td><b>{m.name}</b></td>
                        <td>{m.className}</td>
                        <td className="mut" style={{ fontSize: '12px' }}>{m.email} · {m.phone}</td>
                        <td><span className={`tag ${m.status === 'active' ? 'ok' : 'bad'}`}>{m.status.toUpperCase()}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => setMemberModal({ isOpen: true, mode: 'edit', memberData: m })}
                              className="btn2"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            >
                              Edit Data
                            </button>
                            <button
                              onClick={() => setMemberCardModal({ isOpen: true, member: m })}
                              className="btn2"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            >
                              🖨️ Kartu
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Halaman Denda */}
          {subPage === 'denda' && (
            <div className="b" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Denda & Sanksi Keterlambatan</h2>
              <table>
                <thead><tr><th>Anggota</th><th>Buku</th><th>Nominal</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>
                  {fines.map(f => (
                    <tr key={f.id}>
                      <td>{f.memberName} ({f.memberCode})</td>
                      <td>{f.bookTitle}</td>
                      <td><b>Rp {f.amount.toLocaleString()}</b></td>
                      <td><span className={`tag ${f.status === 'lunas' ? 'ok' : 'bad'}`}>{f.status}</span></td>
                      <td>
                        {f.status === 'belum_dibayar' && (
                          <button onClick={() => { setFines(fines.map(item => item.id === f.id ? { ...item, status: 'lunas' } : item)); showToast('Denda lunas dicatat.'); }} className="btn" style={{ minHeight: '30px', fontSize: '12px' }}>
                            Tandai Lunas
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub Halaman Laporan */}
          {subPage === 'laporan' && (
            <div className="b" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Laporan Sirkulasi</h2>
              <button
                onClick={() => {
                  const csv = "Kode,Barcode Eksemplar,Anggota,Buku,Tgl Pinjam,Jatuh Tempo,Status\n" + loans.map(l => `${l.loanCode},${l.copyCode},${l.memberName},"${l.bookTitle}",${l.borrowedAt},${l.dueDate},${l.status}`).join("\n");
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `laporan_sirkulasi_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  showToast('✅ Laporan CSV berhasil diunduh!');
                }}
                className="btn"
              >
                📥 Unduh Laporan CSV
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ========================================================
  // 3. DASHBOARD ADMINISTRATOR
  // ========================================================
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh', background: '#F6F7F9' }}>
      
      {/* SIDEBAR ADMIN DENGAN 8 MENU RESMI */}
      <aside style={{ width: '250px', background: '#fff', borderRight: '1px solid #E3E6EC', padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="logo" style={{ marginBottom: '20px' }}>Librava</div>
          
          <nav className="nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* 1. Dashboard */}
            <button
              onClick={() => setSubPage('dashboard')}
              className={subPage === 'dashboard' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </button>

            {/* 2. Sirkulasi */}
            <button
              onClick={() => setSubPage('sirkulasi')}
              className={subPage === 'sirkulasi' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h14l-4-4M20 16H6l4 4"></path>
              </svg>
              <span>Sirkulasi</span>
            </button>

            {/* 3. Inventaris */}
            <button
              onClick={() => setSubPage('inventaris')}
              className={subPage === 'inventaris' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Inventaris</span>
            </button>

            {/* 4. Anggota */}
            <button
              onClick={() => setSubPage('anggota')}
              className={subPage === 'anggota' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Anggota</span>
            </button>

            {/* 5. Reservasi */}
            <button
              onClick={() => setSubPage('reservasi')}
              className={subPage === 'reservasi' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Reservasi</span>
            </button>

            {/* 6. Laporan */}
            <button
              onClick={() => setSubPage('laporan')}
              className={subPage === 'laporan' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path>
              </svg>
              <span>Laporan</span>
            </button>

            {/* 7. Pengaturan */}
            <button
              onClick={() => setSubPage('pengaturan')}
              className={subPage === 'pengaturan' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Pengaturan</span>
            </button>

            {/* 8. Profil Saya */}
            <button
              onClick={() => setSubPage('profil')}
              className={subPage === 'profil' ? 'on' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profil Saya</span>
            </button>
          </nav>
        </div>

        <div style={{ borderTop: '1px solid #E3E6EC', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3347C4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              IR
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>{currentUser.name.replace(' (Administrator)', '')}</p>
              <p className="mut" style={{ fontSize: '11px' }}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn2" style={{ width: '100%', minHeight: '34px', fontSize: '12px' }}>
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* WORKSPACE ADMIN */}
      <main style={{ flex: 1, minWidth: '320px', padding: '28px 36px', overflowY: 'auto' }}>
        
        {/* HEADER ATAS DENGAN TOMBOL "LIHAT TAMPILAN WEB (MEMBER)" */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>
              {subPage === 'dashboard' && 'Dashboard Admin Perpustakaan'}
              {subPage === 'sirkulasi' && 'Sirkulasi & Transaksi Barcode'}
              {subPage === 'inventaris' && 'Inventaris Katalog & Eksemplar'}
              {subPage === 'anggota' && 'Manajemen Anggota Perpustakaan'}
              {subPage === 'reservasi' && 'Manajemen Reservasi & Antrean Buku'}
              {subPage === 'laporan' && 'Pusat Laporan & Analitik Perpustakaan'}
              {subPage === 'pengaturan' && 'Konfigurasi Sistem & Aturan'}
              {subPage === 'profil' && 'Profil Pengguna Administrator'}
            </h1>
            <p className="mut" style={{ marginTop: '4px', fontSize: '13px' }}>
              {subPage === 'dashboard' && 'Ringkasan statistik dan aktivitas terbaru perpustakaan Librava.'}
              {subPage === 'sirkulasi' && 'Pengelolaan peminjaman, pengembalian, perpanjangan, dan denda sirkulasi.'}
              {subPage === 'inventaris' && 'Pengelolaan data buku, eksemplar fisik, barcode unik, dan cetak label stiker.'}
              {subPage === 'anggota' && 'Pengelolaan data member, status aktif/suspend, barcode kartu, dan cetak kartu anggota.'}
              {subPage === 'reservasi' && 'Pengelolaan permintaan reservasi buku dari siswa & member.'}
              {subPage === 'laporan' && 'Laporan lengkap peminjaman, keterlambatan, inventaris, dan ekspor CSV.'}
              {subPage === 'pengaturan' && 'Konfigurasi aturan peminjaman, tarif denda, manajemen akun & hak akses.'}
              {subPage === 'profil' && 'Informasi akun administrator, pengaturan profil, dan perubahan password.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {renderNotificationBell()}
            <button
              onClick={() => setCurrentRoute('beranda')}
              className="btn2"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#E9ECFB', color: '#2536A0', border: '1px solid #D5DCF8', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}
            >
              <span>🌐</span> Lihat Tampilan Web (Member)
            </button>
          </div>
        </div>

        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#1E293B', color: '#fff', padding: '12px 20px', borderRadius: '8px', zIndex: 99999 }}>
            {toast}
          </div>
        )}

        {/* 1. DASHBOARD — RINGKASAN STATISTIK DAN AKTIVITAS TERBARU */}
        {subPage === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div className="b st"><p>Total Judul Buku</p><p>{books.length}</p></div>
              <div className="b st"><p>Total Eksemplar Fisik</p><p>{books.reduce((acc, b) => acc + b.totalCopies, 0)}</p></div>
              <div className="b st"><p>Anggota Aktif</p><p>{members.filter(m => m.status === 'active').length}</p></div>
              <div className="b st"><p>Pinjaman Berjalan</p><p>{loans.filter(l => l.status === 'active').length}</p></div>
              <div className="b st"><p>Buku Terlambat</p><p style={{ color: '#9B1C1C' }}>{loans.filter(l => l.status === 'overdue').length}</p></div>
              <div className="b st"><p>Antrean Reservasi</p><p style={{ color: '#3347C4' }}>{reservations.filter(r => r.status === 'menunggu').length}</p></div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '24px' }}>
              <section className="b" style={{ flex: 2, minWidth: '320px', overflowX: 'auto' }}>
                <h2 style={{ fontSize: '16px', padding: '18px 18px 6px', fontWeight: 700 }}>Aktivitas Perpustakaan Terbaru</h2>
                <table>
                  <thead>
                    <tr><th>Pelaku</th><th>Aktivitas</th><th>Waktu</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Admin (Ibu Ratna)</td><td>Update pengaturan aturan sirkulasi sekolah</td><td>Hari ini, 08.10</td><td><span className="tag ok">Selesai</span></td></tr>
                    <tr><td>Petugas (Pak Joko)</td><td>Scan peminjaman LIB-B04-C01 ke Rani Maharani</td><td>Hari ini, 07.45</td><td><span className="tag ok">Aktif</span></td></tr>
                    <tr><td>Admin (Ibu Ratna)</td><td>Pendaftaran anggota baru Budi Santoso (MBR-A002)</td><td>1 Nov, 11.05</td><td><span className="tag ok">Aktif</span></td></tr>
                    <tr><td>Siswa (Rani)</td><td>Mengajukan reservasi buku Bumi Manusia</td><td>30 Okt, 13.20</td><td><span className="tag warn">Menunggu</span></td></tr>
                  </tbody>
                </table>
              </section>

              <section className="b" style={{ flex: 1, minWidth: '260px', padding: '18px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Pintasan Cepat Admin</h2>
                <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
                  <button onClick={() => setSubPage('sirkulasi')} className="btn" style={{ justifyContent: 'center' }}>🔄 Buka Sirkulasi Barcode</button>
                  <button onClick={() => setSubPage('inventaris')} className="btn2" style={{ justifyContent: 'center' }}>📚 Kelola Inventaris & Buku</button>
                  <button onClick={() => setSubPage('anggota')} className="btn2" style={{ justifyContent: 'center' }}>👥 Kelola Anggota & Kartu</button>
                  <button onClick={() => setSubPage('laporan')} className="btn2" style={{ justifyContent: 'center' }}>📊 Ekspor Laporan Sirkulasi</button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* 2. SIRKULASI — PENGELOLAAN PEMINJAMAN, PENGEMBALIAN, PERPANJANGAN, DAN DENDA (FITUR 7: LIVE STATUS & NOTIFIKASI) */}
        {subPage === 'sirkulasi' && renderCirculationBarcodeSection(true)}

        {/* 3. INVENTARIS — PENGELOLAAN DATA BUKU, EKSEMPLAR, BARCODE, DAN CETAK LABEL BUKU */}
        {subPage === 'inventaris' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Inventaris Buku & Eksemplar Fisik</h2>
                <p className="mut" style={{ fontSize: '13px' }}>Katalog induk bibliografi, nomor panggil, rak buku, dan cetak barcode/label stiker.</p>
              </div>
              <button
                onClick={() => setBookModal({ isOpen: true, mode: 'add' })}
                className="btn"
              >
                + Tambah Judul Buku Baru
              </button>
            </div>

            {/* Filter, Kategori & Pencarian */}
            <div className="b" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                className="in"
                placeholder="Cari judul, ISBN, atau penulis..."
                value={adminBookSearch}
                onChange={(e) => { setAdminBookSearch(e.target.value); setAdminBookPage(1); }}
                style={{ flex: 1, minWidth: '220px' }}
              />
              <select
                className="in"
                value={adminBookCategory}
                onChange={(e) => { setAdminBookCategory(e.target.value); setAdminBookPage(1); }}
                style={{ width: '180px' }}
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Fiksi">Fiksi</option>
                <option value="Pelajaran">Pelajaran</option>
                <option value="Sains">Sains</option>
                <option value="Sejarah">Sejarah</option>
              </select>
            </div>

            {/* Tabel Buku */}
            <div className="b" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Judul & Penulis</th>
                    <th>ISBN</th>
                    <th>Kategori</th>
                    <th>No. Panggil / Lokasi</th>
                    <th>Ketersediaan Eksemplar</th>
                    <th>Aksi Inventaris</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdminBooks.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ width: '42px', height: '60px', borderRadius: '4px', overflow: 'hidden' }}>
                          <BookCover book={b} width="42px" height="60px" borderRadius="4px" />
                        </div>
                      </td>
                      <td>
                        <b>{b.title}</b>
                        <p className="mut" style={{ fontSize: '12px' }}>{b.author} ({b.year}) · {b.publisher}</p>
                      </td>
                      <td className="mut" style={{ fontSize: '12px' }}>{b.isbn}</td>
                      <td><span className="tag ok" style={{ background: '#F1F3F7', color: '#1B1F2A' }}>{b.category}</span></td>
                      <td><b>{b.callNumber}</b><br /><span className="mut" style={{ fontSize: '11px' }}>{b.shelfLocation}</span></td>
                      <td>
                        <b>{b.availableCopies}</b> / {b.totalCopies} tersedia
                        <br />
                        <span className="mut" style={{ fontSize: '11px' }}>{b.copies.length} eksemplar fisik</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setBookModal({ isOpen: true, mode: 'edit', bookData: b })}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            title="Edit Informasi Buku"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setCopyManageModal({ isOpen: true, book: b })}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px', color: '#2536A0', fontWeight: 600 }}
                            title="Kelola Eksemplar & Barcode Fisik"
                          >
                            Eksemplar ({b.copies.length})
                          </button>
                          <button
                            onClick={() => openLabelModalForBook(b)}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            title="Cetak & Unduh Label Stiker Buku PDF"
                          >
                            🏷️ Cetak Label
                          </button>
                          <button
                            onClick={() => handleDeleteBook(b.id, b.title)}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px', color: '#DC2626' }}
                            title="Hapus Buku"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedAdminBooks.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>Buku tidak ditemukan.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Buku */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #EEF0F4' }}>
                <span className="mut" style={{ fontSize: '12px' }}>Halaman {adminBookPage} dari {totalAdminBookPages} ({filteredAdminBooks.length} judul buku)</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button disabled={adminBookPage <= 1} onClick={() => setAdminBookPage(p => p - 1)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Sebelumnya</button>
                  <button disabled={adminBookPage >= totalAdminBookPages} onClick={() => setAdminBookPage(p => p + 1)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Berikutnya</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ANGGOTA — PENGELOLAAN DATA MEMBER, STATUS, BARCODE MEMBER, DAN KARTU ANGGOTA */}
        {subPage === 'anggota' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Manajemen Anggota Perpustakaan</h2>
                <p className="mut" style={{ fontSize: '13px' }}>Pengelolaan profil siswa & member, status keanggotaan aktif/suspend, dan kartu barcode.</p>
              </div>
              <button
                onClick={() => setMemberModal({ isOpen: true, mode: 'add' })}
                className="btn"
              >
                + Tambah Anggota Baru
              </button>
            </div>

            {/* Filter & Pencarian Anggota */}
            <div className="b" style={{ padding: '14px 20px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                className="in"
                placeholder="Cari nama, ID member, atau email..."
                value={adminMemberSearch}
                onChange={(e) => { setAdminMemberSearch(e.target.value); setAdminMemberPage(1); }}
                style={{ flex: 1, minWidth: '220px' }}
              />
              <select
                className="in"
                value={adminMemberStatus}
                onChange={(e) => { setAdminMemberStatus(e.target.value); setAdminMemberPage(1); }}
                style={{ width: '180px' }}
              >
                <option value="Semua">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="suspended">Disuspend</option>
              </select>
            </div>

            <div className="b" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Barcode ID</th>
                    <th>Nama Lengkap</th>
                    <th>Kelas / Peran</th>
                    <th>Kontak & Alamat</th>
                    <th>Tgl Bergabung</th>
                    <th>Status Akun</th>
                    <th>Aksi Anggota</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdminMembers.map(m => (
                    <tr key={m.id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3347C4' }}>{m.memberCode}</span></td>
                      <td><b>{m.name}</b></td>
                      <td>{m.className}</td>
                      <td>
                        <span style={{ fontSize: '13px' }}>{m.email}</span><br />
                        <span className="mut" style={{ fontSize: '12px' }}>{m.phone} · {m.address}</span>
                      </td>
                      <td className="mut" style={{ fontSize: '12px' }}>{m.joinedAt}</td>
                      <td>
                        <button
                          onClick={() => handleToggleMemberStatus(m.id, m.status)}
                          className={`tag ${m.status === 'active' ? 'ok' : 'bad'}`}
                          style={{ border: 0, cursor: 'pointer' }}
                          title="Klik untuk mengubah status (Aktif / Suspend)"
                        >
                          {m.status.toUpperCase()}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setMemberModal({ isOpen: true, mode: 'edit', memberData: m })}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            title="Edit Data Anggota"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setMemberCardModal({ isOpen: true, member: m })}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            title="Cetak Kartu Member Ber-barcode"
                          >
                            🖨️ Kartu
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id, m.memberCode, m.name)}
                            className="btn2"
                            style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px', color: '#DC2626' }}
                            title="Hapus Anggota"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedAdminMembers.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>Anggota tidak ditemukan.</td></tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Anggota */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #EEF0F4' }}>
                <span className="mut" style={{ fontSize: '12px' }}>Halaman {adminMemberPage} dari {totalAdminMemberPages} ({filteredAdminMembers.length} anggota)</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button disabled={adminMemberPage <= 1} onClick={() => setAdminMemberPage(p => p - 1)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Sebelumnya</button>
                  <button disabled={adminMemberPage >= totalAdminMemberPages} onClick={() => setAdminMemberPage(p => p + 1)} className="btn2" style={{ minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Berikutnya</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. RESERVASI — PENGELOLAAN PERMINTAAN RESERVASI BUKU DARI MEMBER */}
        {subPage === 'reservasi' && (
          <div>
            <div className="b" style={{ overflowX: 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF0F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Antrean Reservasi Buku Masuk</h3>
                  <p className="mut" style={{ fontSize: '12px', margin: '2px 0 0' }}>Kelola daftar pemesanan buku siswa saat stok sedang dipinjam.</p>
                </div>
                <span style={{ background: '#E0E7FF', color: '#3730A3', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '99px' }}>
                  {reservations.length} total permohonan
                </span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>ID Reservasi</th>
                    <th>Pemohon</th>
                    <th>Judul Buku</th>
                    <th>Kategori</th>
                    <th>Waktu Pengajuan</th>
                    <th>Status Reservasi</th>
                    <th>Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.id.toUpperCase()}</td>
                      <td><b>{r.memberName}</b><br /><span className="mut" style={{ fontSize: '11px' }}>{r.memberCode}</span></td>
                      <td><b>{r.bookTitle}</b></td>
                      <td><span className="tag ok" style={{ background: '#F1F3F7', color: '#1B1F2A' }}>{r.bookCategory || 'Pustaka'}</span></td>
                      <td className="mut" style={{ fontSize: '12px' }}>{r.reservedAt}</td>
                      <td>
                        <span className={`tag ${r.status === 'siap_diambil' ? 'ok' : r.status === 'dibatalkan' ? 'bad' : 'warn'}`}>
                          {r.status === 'siap_diambil' ? 'Siap Diambil di Rak' : r.status === 'dibatalkan' ? 'Dibatalkan' : 'Menunggu Stok'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status === 'menunggu' && (
                            <button
                              onClick={() => {
                                setReservations(reservations.map(res => res.id === r.id ? { ...res, status: 'siap_diambil' } : res));
                                addNotification({
                                  recipientRole: 'member',
                                  recipientCode: r.memberCode,
                                  title: 'Buku Reservasi Siap Diambil!',
                                  message: `Buku "${r.bookTitle}" telah siap diambil di meja sirkulasi perpustakaan.`,
                                  type: 'reservation'
                                });
                                showToast(`✅ Reservasi "${r.bookTitle}" ditandai siap diambil!`);
                              }}
                              className="btn"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px' }}
                            >
                              Tandai Siap
                            </button>
                          )}
                          {r.status !== 'dibatalkan' && (
                            <button
                              onClick={() => {
                                setReservations(reservations.map(res => res.id === r.id ? { ...res, status: 'dibatalkan' } : res));
                                showToast(`Reservasi buku "${r.bookTitle}" dibatalkan.`);
                              }}
                              className="btn2"
                              style={{ minHeight: '30px', padding: '0 8px', fontSize: '12px', color: '#DC2626' }}
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>Belum ada reservasi aktif.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. LAPORAN — LAPORAN LENGKAP SIRKULASI, INVENTARIS, KETERLAMBATAN, DENDA */}
        {subPage === 'laporan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div className="b" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748B', margin: '0 0 6px' }}>Total Sirkulasi Buku</h4>
                <p style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px', color: '#1E293B' }}>{loans.length} Transaksi</p>
                <button
                  onClick={() => {
                    const csv = "ID,Kode Transaksi,Barcode Eksemplar,Nama Anggota,ID Anggota,Judul Buku,Tgl Pinjam,Jatuh Tempo,Status\n" +
                      loans.map(l => `${l.id},${l.loanCode},${l.copyCode},"${l.memberName}",${l.memberCode},"${l.bookTitle}",${l.borrowedAt},${l.dueDate},${l.status}`).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `laporan_sirkulasi_librava_${Date.now()}.csv`;
                    a.click();
                    showToast('📥 Berkas CSV Laporan Sirkulasi berhasil diunduh!');
                  }}
                  className="btn"
                  style={{ width: '100%', minHeight: '34px', fontSize: '12px' }}
                >
                  📥 Ekspor CSV Sirkulasi
                </button>
              </div>

              <div className="b" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748B', margin: '0 0 6px' }}>Laporan Data Inventaris</h4>
                <p style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px', color: '#1E293B' }}>{books.length} Judul Buku</p>
                <button
                  onClick={() => {
                    const csv = "ID,Judul,Penulis,ISBN,Penerbit,Tahun,Kategori,No Panggil,Lokasi Rak,Total Eksemplar,Tersedia\n" +
                      books.map(b => `${b.id},"${b.title}","${b.author}",${b.isbn},"${b.publisher}",${b.year},${b.category},"${b.callNumber}","${b.shelfLocation}",${b.totalCopies},${b.availableCopies}`).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `laporan_inventaris_buku_${Date.now()}.csv`;
                    a.click();
                    showToast('📥 Berkas CSV Inventaris Buku berhasil diunduh!');
                  }}
                  className="btn2"
                  style={{ width: '100%', minHeight: '34px', fontSize: '12px' }}
                >
                  📥 Ekspor CSV Inventaris
                </button>
              </div>

              <div className="b" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', color: '#64748B', margin: '0 0 6px' }}>Total Kas Denda Masuk</h4>
                <p style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 10px', color: '#166534' }}>
                  Rp {fines.filter(f => f.status === 'lunas').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    const csv = "ID,ID Member,Nama Member,Judul Buku,Hari Terlambat,Nominal,Status\n" +
                      fines.map(f => `${f.id},${f.memberCode},"${f.memberName}","${f.bookTitle}",${f.daysOverdue},${f.amount},${f.status}`).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `laporan_denda_${Date.now()}.csv`;
                    a.click();
                    showToast('📥 Berkas CSV Laporan Denda berhasil diunduh!');
                  }}
                  className="btn2"
                  style={{ width: '100%', minHeight: '34px', fontSize: '12px' }}
                >
                  📥 Ekspor CSV Denda
                </button>
              </div>
            </div>

            {/* Rekap Keterlambatan Pengembalian */}
            <div className="b" style={{ overflowX: 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF0F4' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Rekap Keterlambatan Sirkulasi Belum Diselesaikan</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID Pinjaman</th>
                    <th>Barcode</th>
                    <th>Nama Anggota</th>
                    <th>Buku</th>
                    <th>Batas Jatuh Tempo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.filter(l => l.status === 'overdue').map(l => (
                    <tr key={l.id}>
                      <td style={{ fontFamily: 'monospace' }}>{l.loanCode}</td>
                      <td><code>{l.copyCode}</code></td>
                      <td><b>{l.memberName}</b> ({l.memberCode})</td>
                      <td>{l.bookTitle}</td>
                      <td style={{ color: '#DC2626', fontWeight: 700 }}>{l.dueDate}</td>
                      <td><span className="tag bad">TERLAMBAT</span></td>
                    </tr>
                  ))}
                  {loans.filter(l => l.status === 'overdue').length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#16A34A' }}>Tidak ada pinjaman yang terlambat saat ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. PENGATURAN — KONFIGURASI SISTEM PERPUSTAKAAN, ATURAN PEMINJAMAN, DENDA, PENGGUNA & AUDIT LOG */}
        {subPage === 'pengaturan' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Form Aturan Peminjaman & Denda */}
              <div className="b" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Aturan Peminjaman & Denda Sekolah</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label>Batas Maksimal Buku per Siswa</label>
                    <input className="in" defaultValue="3 Buku" />
                  </div>
                  <div>
                    <label>Lama Waktu Peminjaman Standar</label>
                    <input className="in" defaultValue="7 Hari Kalender" />
                  </div>
                  <div>
                    <label>Tarif Denda Keterlambatan per Hari</label>
                    <input className="in" defaultValue="Rp 1.000 / hari / buku" />
                  </div>
                  <div>
                    <label>Format Barcode Standar</label>
                    <input className="in" defaultValue="Code 128 (Otomatis Kompatibel Scanner USB & HP)" disabled />
                  </div>
                  <button onClick={() => showToast('✅ Pengaturan aturan perpustakaan berhasil diperbarui!')} className="btn" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                    Simpan Perubahan Aturan
                  </button>
                </div>
              </div>

              {/* Pengguna & Peran Sistem (RBAC) */}
              <div className="b" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Pengelolaan Pengguna & Hak Akses (RBAC)</h3>
                <p className="mut" style={{ fontSize: '12px', marginBottom: '12px' }}>Daftar akun berwenang pada sistem perpustakaan sekolah.</p>
                <table>
                  <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td>Ibu Ratna</td><td>admin@sekolah.sch.id</td><td><b style={{ color: '#3347C4' }}>Administrator</b></td><td><span className="tag ok">Aktif</span></td></tr>
                    <tr><td>Pak Joko</td><td>joko@petugas.sch.id</td><td><b style={{ color: '#0284C7' }}>Petugas</b></td><td><span className="tag ok">Aktif</span></td></tr>
                    <tr><td>Rani Maharani</td><td>rani@siswa.sch.id</td><td><b>Member (Siswa)</b></td><td><span className="tag ok">Aktif</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Log Terintegrasi di Pengaturan */}
            <div className="b" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Rekaman Audit Log Keamanan Sistem</h3>
                <span className="mut" style={{ fontSize: '12px' }}>Pencatatan otomatis seluruh aksi penting</span>
              </div>
              <table>
                <thead><tr><th>Waktu</th><th>Pelaku</th><th>Modul</th><th>Keterangan Aktivitas</th></tr></thead>
                <tbody>
                  <tr><td>02/11/2026 09:15</td><td>ADM01 (Admin)</td><td>Pengaturan</td><td>Update tarif denda menjadi Rp 1.000/hari</td></tr>
                  <tr><td>02/11/2026 08:30</td><td>P01 (Petugas)</td><td>Sirkulasi</td><td>Scan barcode eksemplar LIB-B04-C01 ke MBR-A001</td></tr>
                  <tr><td>01/11/2026 15:20</td><td>P01 (Petugas)</td><td>Denda Kasir</td><td>Menerima pembayaran denda Rp 2.000 dari MBR-A003</td></tr>
                  <tr><td>01/11/2026 11:05</td><td>ADM01 (Admin)</td><td>Anggota</td><td>Pendaftaran anggota baru Budi Santoso (MBR-A002)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. PROFIL SAYA — INFORMASI AKUN ADMIN, PENGATURAN PROFIL, DAN PERUBAHAN PASSWORD */}
        {subPage === 'profil' && (
          <div style={{ maxWidth: '840px' }}>
            <div className="b" style={{ padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#3347C4', color: '#fff', fontSize: '28px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(51, 71, 196, 0.35)' }}>
                  IR
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Ibu Ratna, S.Pd., M.Pust.</h2>
                  <p className="mut" style={{ fontSize: '13px', margin: '4px 0 0' }}>Kepala Unit Perpustakaan & Administrator Sistem Librava</p>
                  <span className="tag ok" style={{ marginTop: '6px', display: 'inline-block' }}>Akses Penuh (Super Admin)</span>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); showToast('✅ Data profil Administrator berhasil diperbarui!'); }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #EEF0F4', paddingBottom: '8px' }}>
                  Informasi Data Diri
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label>Nama Lengkap</label>
                    <input className="in" defaultValue="Ibu Ratna, S.Pd., M.Pust." required />
                  </div>
                  <div>
                    <label>Email Dinas / Akun</label>
                    <input className="in" defaultValue="admin@sekolah.sch.id" required />
                  </div>
                  <div>
                    <label>ID Administrator (Barcode)</label>
                    <input className="in" defaultValue="ADM01" disabled />
                  </div>
                  <div>
                    <label>Nomor Telepon / WhatsApp</label>
                    <input className="in" defaultValue="+62 812-9988-7711" required />
                  </div>
                </div>
                <button type="submit" className="btn">
                  Simpan Perubahan Profil
                </button>
              </form>
            </div>

            {/* Ganti Password */}
            <div className="b" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #EEF0F4', paddingBottom: '8px' }}>
                Perbarui Kata Sandi Akun
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); showToast('✅ Kata sandi akun berhasil diganti!'); }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label>Kata Sandi Sekarang</label>
                    <input type="password" placeholder="••••••••" className="in" required />
                  </div>
                  <div>
                    <label>Kata Sandi Baru</label>
                    <input type="password" placeholder="••••••••" className="in" required />
                  </div>
                  <div>
                    <label>Konfirmasi Kata Sandi Baru</label>
                    <input type="password" placeholder="••••••••" className="in" required />
                  </div>
                </div>
                <button type="submit" className="btn2" style={{ fontWeight: 600 }}>
                  Perbarui Kata Sandi
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          MODAL FORM TAMBAH / EDIT BUKU
          ======================================================== */}
      {bookModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}>
          <div className="b" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {bookModal.mode === 'add' ? 'Tambah Judul Buku Baru' : 'Edit Informasi Buku'}
              </h3>
              <button onClick={() => setBookModal({ isOpen: false, mode: 'add' })} style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveBook}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label>Judul Buku</label>
                  <input required name="title" className="in" defaultValue={bookModal.bookData?.title || ''} placeholder="Contoh: Laskar Pelangi" />
                </div>
                <div>
                  <label>Nama Penulis</label>
                  <input required name="author" className="in" defaultValue={bookModal.bookData?.author || ''} placeholder="Contoh: Andrea Hirata" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label>Nomor ISBN</label>
                  <input required name="isbn" className="in" defaultValue={bookModal.bookData?.isbn || ''} placeholder="978-602-..." />
                </div>
                <div>
                  <label>Penerbit</label>
                  <input required name="publisher" className="in" defaultValue={bookModal.bookData?.publisher || ''} placeholder="Bentang Pustaka" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label>Tahun Terbit</label>
                  <input required type="number" name="year" className="in" defaultValue={bookModal.bookData?.year || 2024} />
                </div>
                <div>
                  <label>Kategori</label>
                  <select name="category" className="in" defaultValue={bookModal.bookData?.category || 'Fiksi'}>
                    <option value="Fiksi">Fiksi</option>
                    <option value="Pelajaran">Pelajaran</option>
                    <option value="Sains">Sains</option>
                    <option value="Sejarah">Sejarah</option>
                  </select>
                </div>
                <div>
                  <label>No. Panggil</label>
                  <input required name="callNumber" className="in" defaultValue={bookModal.bookData?.callNumber || '813 HIR l'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label>Lokasi Rak Buku</label>
                  <input required name="shelfLocation" className="in" defaultValue={bookModal.bookData?.shelfLocation || 'Rak F-01'} />
                </div>
                {bookModal.mode === 'add' && (
                  <div>
                    <label>Jumlah Eksemplar Awal</label>
                    <input required type="number" min="1" max="50" name="totalCopies" className="in" defaultValue="3" />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label>URL Cover Buku (Opsional / Gambar Sampul)</label>
                <input
                  name="coverImage"
                  className="in"
                  defaultValue={bookModal.bookData?.coverImage || ''}
                  placeholder="https://covers.openlibrary.org/b/id/... atau URL gambar cover"
                />
                <span className="mut" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  💡 Masukkan tautan gambar web (JPG, PNG) untuk menampilkan sampul buku asli. Jika dikosongkan, kartu grafis elegan akan otomatis digunakan.
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Sinopsis / Deskripsi Buku</label>
                <textarea required name="description" className="in" style={{ height: '80px', padding: '10px 12px' }} defaultValue={bookModal.bookData?.description || ''} placeholder="Tuliskan ringkasan buku..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setBookModal({ isOpen: false, mode: 'add' })} className="btn2">Batal</button>
                <button type="submit" className="btn">Simpan Buku</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL FORM TAMBAH / EDIT ANGGOTA MEMBER
          ======================================================== */}
      {memberModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}>
          <div className="b" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {memberModal.mode === 'add' ? 'Daftarkan Anggota Baru' : 'Edit Data Anggota'}
              </h3>
              <button onClick={() => setMemberModal({ isOpen: false, mode: 'add' })} style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveMember}>
              <div style={{ marginBottom: '14px' }}>
                <label>Nama Lengkap</label>
                <input required name="name" className="in" defaultValue={memberModal.memberData?.name || ''} placeholder="Nama siswa / guru" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label>Email Sekolah</label>
                  <input required type="email" name="email" className="in" defaultValue={memberModal.memberData?.email || ''} placeholder="nama@siswa.sch.id" />
                </div>
                <div>
                  <label>Kelas / Jabatan</label>
                  <input required name="className" className="in" defaultValue={memberModal.memberData?.className || ''} placeholder="Contoh: XII IPA 2" />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label>Nomor Telepon / WhatsApp</label>
                <input required name="phone" className="in" defaultValue={memberModal.memberData?.phone || ''} placeholder="08123456789" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Alamat Rumah</label>
                <input name="address" className="in" defaultValue={memberModal.memberData?.address || ''} placeholder="Jl. Raya No. 12..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setMemberModal({ isOpen: false, mode: 'add' })} className="btn2">Batal</button>
                <button type="submit" className="btn">Simpan Anggota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DETAIL & KELOLA EKSEMPLAR
          ======================================================== */}
      {copyManageModal.isOpen && copyManageModal.book && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}>
          <div className="b" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Kelola Eksemplar Fisik</h3>
                <p className="mut" style={{ fontSize: '13px' }}>Buku: <b>{copyManageModal.book.title}</b></p>
              </div>
              <button onClick={() => setCopyManageModal({ isOpen: false })} style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px' }}>Total: <b>{copyManageModal.book.copies.length} eksemplar</b></span>
              <button
                onClick={() => {
                  handleAddCopy(copyManageModal.book!.id);
                  // Refresh book in modal
                  const updated = books.find(b => b.id === copyManageModal.book!.id);
                  if (updated) setCopyManageModal({ isOpen: true, book: updated });
                }}
                className="btn"
                style={{ minHeight: '32px', fontSize: '12px' }}
              >
                + Tambah 1 Eksemplar
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Barcode Eksemplar</th>
                    <th>Status</th>
                    <th>Aksi Label</th>
                  </tr>
                </thead>
                <tbody>
                  {copyManageModal.book.copies.map((c, i) => (
                    <tr key={c.copyCode}>
                      <td>{i + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3347C4' }}>{c.copyCode}</span>
                        <div style={{ marginTop: '2px' }}>
                          <BarcodeItem value={c.copyCode} width={1.0} height={24} fontSize={9} />
                        </div>
                      </td>
                      <td>
                        <span className={`tag ${c.status === 'tersedia' ? 'ok' : 'bad'}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openLabelModalForBook(copyManageModal.book!, c.copyCode)}
                            className="btn2"
                            style={{ minHeight: '28px', padding: '0 8px', fontSize: '11px' }}
                          >
                            🏷️ Label
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                handleDeleteCopy(copyManageModal.book!.id, c.copyCode);
                                const updated = books.find(b => b.id === copyManageModal.book!.id);
                                if (updated) setCopyManageModal({ isOpen: true, book: updated });
                              }}
                              className="btn2"
                              style={{ minHeight: '28px', padding: '0 8px', fontSize: '11px', color: '#DC2626' }}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setCopyManageModal({ isOpen: false })} className="btn2">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL SCANNER BARCODE
          ======================================================== */}
      <BarcodeScannerModal
        isOpen={scannerConfig.isOpen}
        onClose={() => setScannerConfig({ isOpen: false, targetField: null, title: '' })}
        onScanSuccess={handleScanDecoded}
        title={scannerConfig.title}
      />

      {/* ========================================================
          MODAL CETAK LABEL BUKU PDF (FITUR 5)
          ======================================================== */}
      <LabelPreviewModal
        isOpen={labelModal.isOpen}
        onClose={() => setLabelModal({ isOpen: false, labels: [], title: '' })}
        labels={labelModal.labels}
        title={labelModal.title}
      />

      {/* ========================================================
          MODAL CETAK KARTU MEMBER DIGITAL
          ======================================================== */}
      {memberCardModal.isOpen && memberCardModal.member && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}>
          <div className="b" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Kartu Anggota Perpustakaan</h3>
              <button onClick={() => setMemberCardModal({ isOpen: false })} style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', color: '#fff', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85 }}>PERPUSTAKAAN SEKOLAH</span>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{memberCardModal.member.name}</h2>
                  <p style={{ fontSize: '12px', opacity: 0.9 }}>Kelas: {memberCardModal.member.className}</p>
                </div>
                <span style={{ fontWeight: 800, fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px' }}>LIBRAVA</span>
              </div>

              <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginTop: '16px', textAlign: 'center' }}>
                <BarcodeItem value={memberCardModal.member.memberCode} width={1.6} height={44} fontSize={12} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { window.print(); showToast('Perintah cetak kartu dikirim ke printer.'); }} className="btn" style={{ flex: 1 }}>
                🖨️ Cetak Kartu
              </button>
              <button onClick={() => setMemberCardModal({ isOpen: false })} className="btn2">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DIALOG PEMINJAMAN BUKU CEPAT (QUICK BORROW)
          ======================================================== */}
      {quickBorrowModal.isOpen && quickBorrowModal.book && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}>
          <div className="b" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>⚡</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Peminjaman Buku Cepat</h3>
                  <p className="mut" style={{ fontSize: '12px', margin: 0 }}>Proses peminjaman instan langsung ke akun member.</p>
                </div>
              </div>
              <button onClick={() => setQuickBorrowModal({ isOpen: false })} style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* INFORMASI BUKU */}
            <div style={{ background: '#FAFBFD', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '72px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                <BookCover book={quickBorrowModal.book} width="50px" height="72px" borderRadius="6px" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {quickBorrowModal.book.title}
                </h4>
                <p className="mut" style={{ fontSize: '12px', margin: 0 }}>
                  {quickBorrowModal.book.author} · Rak {quickBorrowModal.book.shelfLocation}
                </p>
                <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="tag ok" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {quickBorrowModal.book.availableCopies} Eksemplar Tersedia
                  </span>
                  {quickBorrowModal.copyCode && (
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#3347C4' }}>
                      Barcode: {quickBorrowModal.copyCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORM PEMILIHAN / VERIFIKASI MEMBER */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const selectedMemberCode = (form.elements.namedItem('memberCode') as HTMLInputElement | HTMLSelectElement)?.value;
              const selectedCopy = (form.elements.namedItem('copyCode') as HTMLSelectElement)?.value || quickBorrowModal.copyCode;
              
              const success = executeDirectQuickBorrow(quickBorrowModal.book!, selectedCopy, selectedMemberCode);
              if (success) {
                setQuickBorrowModal({ isOpen: false });
              }
            }}>
              {/* Jika yang login adalah Member */}
              {currentUser.role === 'member' ? (
                <div style={{ marginBottom: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px' }}>
                  <span className="mut" style={{ fontSize: '11px', color: '#1E40AF', display: 'block', marginBottom: '2px' }}>Peminjam (Akun Anda Saat Ini):</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#1E3A8A' }}>
                    {currentUser.name} ({currentUser.code || 'MBR-A001'})
                  </p>
                  <input type="hidden" name="memberCode" value={currentUser.code || 'MBR-A001'} />
                </div>
              ) : (
                /* Jika yang memproses adalah Petugas / Admin / Tamu */
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Pilih Member Peminjam:
                  </label>
                  <select name="memberCode" className="in" required style={{ minHeight: '40px' }}>
                    {members.filter(m => m.status === 'active').map(m => (
                      <option key={m.id} value={m.memberCode}>
                        {m.name} ({m.memberCode}) - {m.className}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pemilihan Eksemplar Tersedia jika ada lebih dari 1 */}
              {!quickBorrowModal.copyCode && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Pilih Barcode Eksemplar Fisik:
                  </label>
                  <select name="copyCode" className="in" style={{ minHeight: '40px' }}>
                    {quickBorrowModal.book.copies.filter(c => c.status === 'tersedia').map((c, i) => (
                      <option key={c.copyCode} value={c.copyCode}>
                        Eksemplar #{i + 1} - Barcode: {c.copyCode}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', marginBottom: '20px', fontSize: '12px', color: '#64748B' }}>
                <p style={{ margin: 0 }}>⏱️ <b>Durasi:</b> 7 Hari kalender (Jatuh tempo otomatis dihitung 7 hari dari sekarang).</p>
                <p style={{ margin: '3px 0 0' }}>🔔 Notifikasi otomatis akan langsung dikirimkan ke akun member & petugas.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setQuickBorrowModal({ isOpen: false })} className="btn2">
                  Batal
                </button>
                <button type="submit" className="btn" style={{ background: '#2563EB', fontWeight: 700 }}>
                  ⚡ Proses Pinjam Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
