/* Pengaturan permainan. Aman diubah oleh panitia booth. */
window.SHB_CONFIG = {
  lessonSec: 25,                     // waktu dasar tiap pelajaran (detik); bisa diganti di panel admin
  lessonOptions: [20, 25, 30, 40],
  /* Pengali waktu per pelajaran. Contoh 25 detik: makan 25, memanjat 25, cari makan 31, sarang 28, pulau 38. */
  lessonFactor: { feed: 1, climb: 1, forage: 1.25, nest: 1.1, island: 1.5 },

  goodPoints: 10,                    // aksi benar
  badPenalty: 5,                     // aksi salah (skor tidak pernah di bawah nol)
  smallPenalty: 2,                   // salah urutan saat menganyam sarang
  idlePenalty: 3,                    // mencatat saat Bakti tidak sedang beraksi
  temptPass: 15,                     // berhasil menahan diri
  temptFail: 10,                     // memberi makan / menyentuh Bakti
  timeBonusPerSec: 2,                // bonus per detik tersisa saat pelajaran selesai lebih cepat
  rulesVersion: 1,

  /* Angka program (publik). Ganti/kosongkan (null) sesuai keputusan tim komunikasi.
     Nilai bawaan dari halaman Pelestarian Orangutan di situs BCA. */
  releasedCount: 49,
  releasedSince: 2012,
  programUrl: 'https://www.bca.co.id/id/tentang-bca/CSR/Bakti-BCA/bakti-lingkungan/pelestarian-orangutan',

  feed: { perCategory: 2, speed: 200, speedUp: 70, gap: 215, goodRatio: 0.6 },
  climb: { steps: 8, gap: 170, subtleFrom: 4 },
  forage: { rainAt: 7, rainMax: 11, hintAfter: 7 },
  nest: { weave: 6, bed: 5 },
  island: { actSec: 3.6, idleSec: [1.2, 2.0], temptSec: 4.2, temptAt: [0.32, 0.7] },

  adminPin: '1234',                  // PIN panel admin (ganti sebelum pameran!)
  idleTimeoutSec: 45,                // kembali ke layar awal jika tidak disentuh
  introAutoSec: 7,                   // kartu cara main otomatis mulai
  boardAutoReturnSec: 30,
  attractFactSec: 7,
  nameMaxLen: 12,
  spamMisses: 5,                     // anti ketuk asal-asalan
  spamWindowSec: 1.6,
  spamLockSec: 1.2,
  tolMouse: 6,                       // toleransi klik (satuan panggung)
  tolTouch: 18                       // toleransi sentuh
};
