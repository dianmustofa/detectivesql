export interface Level {
  id: number;
  title: string;
  brief: string;
  question: string;
  hint: string;
  targetCount: number;
  validator: (data: unknown[]) => boolean;
}

export interface Case {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  icon: string;
  description: string;
  seedSql: string[];
  levels: Level[];
}

export const CASES_DATA: Case[] = [
  {
    id: "museum-heist",
    title: "Pencurian Lukisan Museum",
    category: "Penyelidikan Umum",
    difficulty: "Pemula",
    icon: "🎨",
    description:
      "Lukisan langka bernilai jutaan dolar hilang dari Museum Jakarta. Lacak log CCTV dan data pengunjung untuk menemukan pelakunya.",
    seedSql: [
      `CREATE TABLE pengunjung (id INT, nama VARCHAR(50), jam_masuk VARCHAR(10), jam_keluar VARCHAR(10), pekerjaan VARCHAR(50));`,
      `INSERT INTO pengunjung VALUES 
        (1, 'Budi Santoso', '09:00', '11:30', 'PNS'),
        (2, 'Siti Rahma', '10:15', '12:00', 'Arsitek'),
        (3, 'Hendrik Wijaya', '14:00', '16:30', 'Pengusaha'),
        (4, 'Rian Ardiansyah', '19:30', '21:15', 'Fotografer'),
        (5, 'Dewi Lestari', '20:00', '22:00', 'Desainer Graphics');`,
      `CREATE TABLE log_cctv (id INT, lokasi VARCHAR(50), waktu VARCHAR(10), plat_nomor VARCHAR(15), terdeteksi VARCHAR(50));`,
      `INSERT INTO log_cctv VALUES 
        (101, 'Pintu Timur', '21:05', 'B 1234 CD', 'Orang berpakaian hitam'),
        (102, 'Pintu Barat', '21:10', 'B 8888 A', 'Mobil Sedan Hitam'),
        (103, 'Ruang Galeri Utama', '21:12', NULL, 'Kamera Buram / Mati'),
        (104, 'Parkir Belakang', '21:18', 'B 9999 XYZ', 'Seseorang membawa bingkai');`,
    ],
    levels: [
      {
        id: 1,
        title: "Level 1: Memeriksa Pengunjung",
        brief:
          "Mulai penyelidikan dengan melihat seluruh daftar pengunjung museum yang tercatat hari ini.",
        question: "Tampilkan SEMUA kolom dan baris dari tabel 'pengunjung'.",
        hint: "Gunakan perintah SELECT * FROM pengunjung;",
        targetCount: 5,
        validator: (res: unknown[]) =>
          Array.isArray(res) &&
          res.length === 5 &&
          res[0] !== null &&
          typeof res[0] === "object" &&
          "nama" in (res[0] as Record<string, unknown>),
      },
      {
        id: 2,
        title: "Level 2: Pengunjung Malam Hari",
        brief:
          "Kejadian diperkirakan terjadi setelah jam 19:00 malam. Saring pengunjung yang masuk di atas jam tersebut.",
        question:
          "Tampilkan pengunjung yang 'jam_masuk' nya di atas jam '19:00'.",
        hint: "Gunakan klausa WHERE jam_masuk > '19:00'",
        targetCount: 2,
        validator: (res: unknown[]) =>
          Array.isArray(res) &&
          res.length === 2 &&
          res.every(
            (r) =>
              r &&
              typeof r === "object" &&
              "jam_masuk" in r &&
              String((r as Record<string, unknown>).jam_masuk) > "19:00"
          ),
      },
      {
        id: 3,
        title: "Level 3: Lacak Mobil Mencurigakan",
        brief:
          "Kamera parkir belakang mencatat mobil dengan plat nomor diawali huruf 'B 9999'.",
        question:
          "Tampilkan data dari 'log_cctv' yang plat_nomor nya mengandung 'B 9999'.",
        hint: "Gunakan WHERE plat_nomor LIKE 'B 9999%'",
        targetCount: 1,
        validator: (res: unknown[]) => {
          if (!Array.isArray(res) || res.length !== 1) return false;

          const item = res[0];
          if (typeof item !== "object" || item === null) return false;

          const row = item as Record<string, unknown>;
          return (
            typeof row.plat_nomor === "string" &&
            row.plat_nomor.includes("B 9999")
          );
        },
      },
    ],
  },
  {
    id: "cyber-bank",
    title: "Peretasan Bank Cyber",
    category: "Keuangan & Cyber",
    difficulty: "Menengah",
    icon: "🏦",
    description:
      "Sistem perbankan mengalami kebocoran dana otomatis. Analisis transaksi mencurigakan dan akun penadah.",
    seedSql: [
      `CREATE TABLE transaksi (id INT, akun_asal VARCHAR(20), akun_tujuan VARCHAR(20), nominal INT, lokasi VARCHAR(50));`,
      `INSERT INTO transaksi VALUES 
        (1, 'ACC-001', 'ACC-999', 50000, 'Jakarta'),
        (2, 'ACC-002', 'ACC-999', 75000, 'Bandung'),
        (3, 'ACC-003', 'ACC-888', 12000, 'Surabaya'),
        (4, 'ACC-004', 'ACC-999', 120000, 'Jakarta');`,
    ],
    levels: [
      {
        id: 4,
        title: "Level 4: Total Transaksi Penadah",
        brief: "Hitung total dana yang ditransfer ke akun penadah 'ACC-999'.",
        question:
          "Tampilkan total nominal (SUM) transaksi yang dikirim ke 'akun_tujuan' = 'ACC-999'.",
        hint: "SELECT SUM(nominal) FROM transaksi WHERE akun_tujuan = 'ACC-999';",
        targetCount: 1,
        validator: (res: unknown[]) => {
          if (
            !Array.isArray(res) ||
            res.length === 0 ||
            !res[0] ||
            typeof res[0] !== "object"
          ) {
            return false;
          }
          const row = res[0] as Record<string, unknown>;
          const val = Object.values(row)[0];
          return val === 245000 || row.total === 245000;
        },
      },
    ],
  },
];
