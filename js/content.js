/* SEMUA teks yang tampil di game ada di sini supaya mudah direvisi tim komunikasi.
   ATURAN: tidak boleh ada angka (digit) di file ini. Angka permainan (skor, waktu, nomor pelajaran)
   dan angka program (jumlah orang utan yang dilepasliarkan) diisi otomatis lewat placeholder
   {n}, {m}, {s}, {y} dari js/config.js. Periksa dengan: node tools/check-no-digits.mjs */
window.SHB_CONTENT = {
  title: 'Sekolah Hutan Bakti · Bakti BCA',
  titleLines: ['Sekolah Hutan', 'Bakti'],
  tagline: 'Bantu bayi orang utan belajar hidup di hutan, sampai siap pulang ke alam.',
  edition: 'EKSPEDISI HUTAN KALIMANTAN',
  habitatKicker: 'PUSAT REHABILITASI ORANG UTAN',
  habitatName: 'Samboja Lestari · Kalimantan Timur',
  hintTouch: 'Asuh. Latih. Lepaskan ke hutan.',

  ui: {
    start: 'Mulai Main',
    playMenu: 'Menu utama',
    leaveConfirm: 'Kembali ke menu utama? Sesi ini akan dihentikan dan skornya tidak disimpan.',
    didYouKnow: 'Tahukah kamu?',
    topToday: 'Pengasuh terbaik hari ini',
    noScores: 'Belum ada skor hari ini. Jadilah yang pertama!',
    boardButton: 'Papan Skor',
    programButton: 'Kenali Program ↗',
    minutes: '{s} menit',
    lessonsMeta: '{n} pelajaran',

    briefKicker: 'Misi Pengasuh',
    briefTitle: 'Kamu pengasuh di Sekolah Hutan!',
    briefText: 'Bakti, bayi orang utan, kehilangan induknya. Di alam, anak orang utan belajar dari induknya selama bertahun-tahun. Sekarang kamulah yang membantunya belajar, sampai Bakti siap kembali ke hutan.',
    briefNote: 'Ketuk atau klik untuk membantu Bakti. Setiap pelajaran punya waktu sendiri. Selesai lebih cepat = bonus poin.',
    go: 'Ayo Mulai!',

    score: 'Skor',
    time: 'Waktu',
    lessonOf: 'Pelajaran {n} dari {m}',
    ready: 'Siap!',
    introTime: '◷ Waktu {s} detik',
    lessonDone: 'Pelajaran selesai!',
    lessonTimeUp: 'Waktu habis!',
    lessonPoints: 'Poin pelajaran ini',
    timeBonus: 'Bonus waktu',
    next: 'Lanjut ke pelajaran berikutnya',
    toRelease: 'Menuju hari pelepasliaran',
    calm: 'Pelan-pelan, amati baik-baik!',
    skipCutscene: 'Lewati',

    resultKicker: 'Rapor Kelulusan Bakti',
    resultTitles: ['Kerja bagus, pengasuh!', 'Hebat, Bakti makin mandiri!', 'Luar biasa, pengasuh teladan!'],
    resultUnit: 'total poin',
    stars: 'Bintang rapor',
    mistakes: 'Salah langkah',
    rankToday: 'Peringkat hari ini',
    namePrompt: 'Tulis nama panggilanmu',
    save: 'Simpan Skor',
    skip: 'Lewati',
    defaultName: 'Pengasuh',
    space: 'Spasi',
    del: 'Hapus',
    actionKicker: 'Yang bisa kamu lakukan',

    boardTitle: 'Papan Skor',
    today: 'Hari Ini',
    allTime: 'Sepanjang Pameran',
    again: 'Main Lagi',
    home: 'Beranda',
    empty: 'Belum ada skor.',

    adminTitle: 'Panel Admin',
    adminPin: 'Masukkan PIN admin',
    adminWrong: 'PIN salah',
    adminDuration: 'Waktu per pelajaran',
    adminSeconds: '{s} detik',
    adminSound: 'Suara',
    adminOn: 'Nyala',
    adminOff: 'Mati',
    adminExport: 'Unduh skor (CSV untuk Excel)',
    adminBackup: 'Simpan cadangan',
    adminImport: 'Muat cadangan',
    adminBackupDone: 'Cadangan tersimpan di folder Downloads. Salin ke PC lain, lalu pilih Muat cadangan.',
    adminImported: 'Berhasil: {added} skor baru ditambahkan, {skipped} sudah ada.',
    adminImportFail: 'File cadangan tidak bisa dibaca. Pastikan memilih file cadangan game ini.',
    adminResetToday: 'Hapus skor hari ini',
    adminResetAll: 'Hapus semua skor',
    adminConfirm: 'Yakin? Tindakan ini tidak bisa dibatalkan.',
    adminClose: 'Tutup',
    adminDone: 'Selesai'
  },

  /* Lima pelajaran mengikuti tahapan rehabilitasi yang disederhanakan. */
  lessons: [
    { id: 'feed', stage: 'Tahap Bayi · Nursery', title: 'Makanan Bakti', short: 'Makan',
      how: [
        { icon: 'ara', ok: true, text: 'Ketuk makanan hutan: buah, daun, kulit kayu, rayap, dan madu.' },
        { icon: 'biskuit', ok: false, text: 'Jangan ketuk makanan manusia. Orang utan bukan hewan peliharaan!' }
      ],
      objective: 'Menu sehat {n}/{m}', done: 'Bakti kenyang!' },
    { id: 'climb', stage: 'Sekolah Hutan · Memanjat', title: 'Pilih Dahan Kuat', short: 'Memanjat',
      how: [
        { icon: 'branchGood', ok: true, text: 'Ketuk dahan yang kuat: kokoh dan berdaun hijau.' },
        { icon: 'branchBad', ok: false, text: 'Hindari dahan lapuk: pucat, retak, dan berjamur.' }
      ],
      objective: 'Ketinggian {n}/{m}', done: 'Sampai di kanopi!' },
    { id: 'forage', stage: 'Sekolah Hutan · Mencari Makan', title: 'Jelajah Kanopi', short: 'Cari makan',
      how: [
        { icon: 'rambutan', ok: true, text: 'Temukan makanan yang tersembunyi di antara dedaunan.' },
        { icon: 'ranting', ok: true, text: 'Pilih alat yang tepat. Orang utan pandai memakai alat!' }
      ],
      objective: 'Temuan {n}/{m}', done: 'Kenyang dan makin pintar!' },
    { id: 'nest', stage: 'Sekolah Hutan · Membuat Sarang', title: 'Sarang Sebelum Gelap', short: 'Sarang',
      how: [
        { icon: 'nest', ok: true, text: 'Pilih tempat tidur yang tinggi dengan dahan hidup yang kuat.' },
        { icon: 'daun', ok: true, text: 'Ketuk dahan dan daun yang bersinar untuk menganyam sarang.' }
      ],
      objective: 'Sarang {n}/{m}', done: 'Selamat tidur, Bakti!' },
    { id: 'island', stage: 'Ujian Akhir · Pulau Pra-Pelepasliaran', title: 'Amati, Jangan Bantu', short: 'Ujian pulau',
      how: [
        { icon: 'notebook', ok: true, text: 'Amati Bakti. Saat ia beraksi, ketuk perilakunya di buku catatan.' },
        { icon: 'pisang', ok: false, text: 'Tahan diri: jangan beri makan dan jangan sentuh Bakti.' }
      ],
      objective: 'Catatan {n}/{m}', done: 'Bakti lulus ujian!' }
  ],

  /* Pelajaran Makan */
  foodCats: {
    buah: 'Buah hutan',
    daun: 'Daun & bunga',
    kulit: 'Kulit & umbut',
    serangga: 'Rayap & madu'
  },
  goodFood: {
    ara: { name: 'Buah ara', cat: 'buah' },
    rambutan: { name: 'Rambutan hutan', cat: 'buah' },
    durian: { name: 'Durian hutan', cat: 'buah' },
    daun: { name: 'Daun muda', cat: 'daun' },
    bunga: { name: 'Bunga hutan', cat: 'daun' },
    kulit: { name: 'Kulit kayu', cat: 'kulit' },
    rotan: { name: 'Umbut rotan', cat: 'kulit' },
    rayap: { name: 'Rayap', cat: 'serangga' },
    madu: { name: 'Madu hutan', cat: 'serangga' }
  },
  badFood: {
    biskuit: { name: 'Biskuit', text: 'Itu makanan manusia. Bakti harus mengenal makanan hutan supaya kelak bisa mencari makan sendiri.' },
    permen: { name: 'Permen', text: 'Gula membuat Bakti terbiasa dengan makanan manusia. Di hutan tidak ada permen!' },
    soda: { name: 'Minuman bersoda', text: 'Minuman manis tidak baik untuk orang utan. Di hutan, Bakti minum air dari lubang pohon.' },
    mi: { name: 'Mi instan', text: 'Orang utan bukan hewan peliharaan. Makanan manusia membuatnya bergantung pada manusia.' },
    keripik: { name: 'Keripik', text: 'Garam dan minyak tidak cocok untuk perut orang utan.' }
  },
  feedFull: 'Sudah cukup! Cari jenis lain',

  /* Pelajaran Memanjat */
  rotten: { title: 'Krak! Dahan lapuk', text: 'Dahan yang pucat, retak, atau berjamur bisa patah. Orang utan menguji dahan dulu sebelum berpindah.' },
  climbGood: 'Dahan kuat',

  /* Pelajaran Cari Makan */
  forageFound: 'Ketemu',
  forageItems: {
    ara: 'Buah ara',
    rambutan: 'Rambutan hutan',
    durian: 'Durian hutan',
    daun: 'Daun muda'
  },
  /* Pilihan alat diacak urutannya setiap kali muncul. ok: true = jawaban benar. */
  toolTasks: {
    rayap: {
      label: 'Sarang rayap',
      prompt: 'Rayap bersembunyi di lubang kecil di batang. Ranting mana yang paling pas untuk Bakti?',
      options: [
        { id: 'rantingPanjang', label: 'Panjang & tipis', ok: true },
        { id: 'rantingTebal', label: 'Dahan tebal', text: 'Terlalu tebal, tidak muat masuk ke lubang kecil.' },
        { id: 'rantingPendek', label: 'Ranting pendek', text: 'Terlalu pendek, tidak sampai ke dalam lubang.' },
        { id: 'rantingDaun', label: 'Masih berdaun', text: 'Cabang dan daunnya menghalangi. Orang utan biasanya mengupasnya dulu.' }
      ],
      right: 'Tepat! Orang utan memilih ranting yang panjang dan tipis, lalu memasukkannya ke lubang untuk mengambil rayap.'
    },
    air: {
      label: 'Air di lubang pohon',
      prompt: 'Bakti haus. Ada air di lubang pohon. Bakti sebaiknya pakai apa?',
      options: [
        { id: 'daunLebar', label: 'Daun lebar', ok: true },
        { id: 'rantingPanjang', label: 'Ranting', text: 'Ranting tidak bisa menyerap air.' },
        { id: 'batu', label: 'Batu', text: 'Batu tidak bisa menyerap air. Coba benda lembut yang bisa diremas.' }
      ],
      right: 'Pintar! Orang utan meremas daun menjadi spons untuk minum air dari lubang pohon.'
    }
  },
  toolKicker: 'Pilih alat',
  rain: { start: 'Hujan turun!', hint: 'Cari daun lebar untuk payung Bakti.', got: 'Daun jadi payung', text: 'Orang utan memakai daun lebar sebagai payung saat hujan.' },

  /* Pelajaran Sarang */
  nestSpots: {
    low: { title: 'Terlalu rendah', text: 'Sarang dekat tanah mudah dijangkau pemangsa. Orang utan tidur tinggi di atas pohon.' },
    dead: { title: 'Dahan mati', text: 'Dahan kering bisa patah saat Bakti tidur. Cari pohon hidup yang kuat.' },
    good: 'Tempat yang pas!'
  },
  nestPhase: { choose: 'Pilih tempat tidur', weave: 'Anyam dahan yang bersinar', bed: 'Alasi dengan daun', sleep: 'Selamat tidur!' },
  nestWrong: 'Ikuti dahan yang bersinar.',
  nestDark: 'Hari sudah gelap. Bakti tidur seadanya malam ini.',

  /* Ujian Pulau */
  notebookTitle: 'Buku Catatan',
  behaviors: {
    memanjat: { name: 'Memanjat tinggi', text: 'Orang utan menghabiskan sebagian besar hidupnya di atas pohon.' },
    makan: { name: 'Makan buah hutan', text: 'Bakti mencari makanannya sendiri.' },
    alat: { name: 'Memakai alat', text: 'Bakti memakai ranting untuk mengambil rayap.' },
    sarang: { name: 'Membuat sarang', text: 'Bakti membangun sarangnya sendiri.' },
    menjauh: { name: 'Menjauhi manusia', text: 'Orang utan yang siap dilepas menjaga jarak dari manusia.' }
  },
  recorded: 'Tercatat',
  idleTap: { title: 'Belum ada perilaku baru', text: 'Bakti sedang santai. Tunggu sampai ia beraksi, lalu pilih perilakunya di buku catatan.' },
  wrongPick: { title: 'Bukan itu', text: 'Amati lagi apa yang sedang Bakti lakukan, lalu pilih yang sesuai di buku catatan.' },
  waitAct: 'Tunggu Bakti beraksi',
  pickHint: 'Pilih perilakunya di buku catatan',
  actCue: 'Bakti sedang beraksi! Apa yang ia lakukan?',
  already: 'Sudah tercatat',
  temptPrompt: 'Bakti mendekat ke tepi pulau…',
  temptations: [
    { id: 'pisang', button: 'Beri pisang', icon: 'pisang',
      fail: { title: 'Jangan diberi makan!', text: 'Di pulau ini Bakti harus mandiri. Kalau terus diberi makan manusia, ia tidak siap hidup di hutan.' },
      pass: 'Hebat, kamu menahan diri! Bakti kembali mencari makan sendiri.' },
    { id: 'elus', button: 'Elus Bakti', icon: 'hand',
      fail: { title: 'Jaga jarak!', text: 'Sentuhan manusia bisa menularkan penyakit dan membuat Bakti jinak. Orang utan liar harus menjauhi manusia.' },
      pass: 'Tepat! Menjaga jarak membantu Bakti tetap liar.' }
  ],
  temptPassTitle: 'Tahan diri',

  /* Hari pelepasliaran */
  release: {
    kicker: 'Hari Pelepasliaran',
    title: 'Bakti kembali ke hutan!',
    countLine: 'Bersama Bakti BCA, {n} orang utan sudah kembali ke hutan sejak {y}. Hari ini, Bakti menyusul mereka!',
    fallbackLine: 'Bakti BCA mendukung rehabilitasi dan pelepasliaran orang utan ke hutan Kalimantan Timur.',
    tapHint: 'Ketuk untuk melihat rapor ›',
    seedLine: 'Biji dari buah yang Bakti makan tersebar dan tumbuh menjadi pohon baru. Orang utan adalah petani hutan.'
  },

  /* Materi edukasi (tanpa angka). */
  facts: [
    { id: 'nama', title: 'Orang Hutan', text: 'Nama orang utan berasal dari bahasa Melayu: “orang” dan “hutan”. Kera besar ini hanya hidup di Pulau Kalimantan dan Sumatra.' },
    { id: 'kritis', title: 'Terancam Punah', text: 'Orang utan kalimantan berstatus kritis (Critically Endangered) dan dilindungi undang-undang di Indonesia.' },
    { id: 'induk', title: 'Masa Kecil Terpanjang', text: 'Anak orang utan tinggal bersama induknya bertahun-tahun. Dari induknya ia belajar memanjat, mencari makan, dan membuat sarang.' },
    { id: 'yatim', title: 'Mengapa Ada Bayi Yatim?', text: 'Bayi orang utan bisa kehilangan induk karena hutan rusak, perburuan, atau perdagangan satwa ilegal. Merawat mereka butuh waktu bertahun-tahun.' },
    { id: 'peliharaan', title: 'Bukan Hewan Peliharaan', text: 'Orang utan adalah satwa liar yang dilindungi. Memeliharanya melanggar hukum dan membuatnya sulit hidup di alam.' },
    { id: 'makanan', title: 'Menu Hutan', text: 'Makanan utama orang utan adalah buah, misalnya buah ara. Mereka juga makan daun muda, bunga, kulit kayu, rayap, dan madu.' },
    { id: 'lengan', title: 'Pemanjat Ulung', text: 'Lengan orang utan panjang dan kuat. Rentang lengan orang utan dewasa bisa jauh melebihi tinggi badannya.' },
    { id: 'ekor', title: 'Tanpa Ekor', text: 'Orang utan termasuk kera besar, jadi tidak berekor. Tangan dan kakinya sama-sama bisa menggenggam dahan.' },
    { id: 'alat', title: 'Pandai Memakai Alat', text: 'Orang utan memilih ranting yang panjang dan tipis untuk mengambil serangga dan madu, serta memakai daun lebar sebagai payung saat hujan.' },
    { id: 'sarang', title: 'Sarang Baru Setiap Hari', text: 'Setiap sore orang utan membuat sarang baru di pohon dari dahan yang dibengkokkan dan dianyam, lalu dialasi daun.' },
    { id: 'petani', title: 'Petani Hutan', text: 'Orang utan menebar biji dari buah yang dimakannya. Biji itu tumbuh menjadi pohon baru, sehingga hutan tetap lestari.' },
    { id: 'pulau', title: 'Pulau Latihan', text: 'Sebelum dilepas, orang utan berlatih di pulau yang dikelilingi air. Orang utan tidak bisa berenang, jadi mereka tetap di pulau.' },
    { id: 'sekolah', title: 'Sekolah Hutan Sungguhan', text: 'Di pusat rehabilitasi, pengasuh mengajak anak orang utan ke hutan setiap hari untuk belajar keterampilan bertahan hidup.' },
    { id: 'samboja', title: 'Samboja Lestari', text: 'Sejak tahun dua ribu dua belas, Bakti BCA mendukung Yayasan BOS (BOSF) dan BKSDA Kalimantan Timur melestarikan orang utan di Samboja Lestari.' },
    { id: 'pulauBCA', title: 'Pulau yang Diperbaiki', text: 'Bakti BCA membantu memperbaiki empat pulau buatan di Samboja Lestari: dua pulau pra-pelepasliaran dan dua pulau suaka.' },
    { id: 'suaka', title: 'Tidak Semua Bisa Dilepas', text: 'Orang utan yang sakit atau terlalu lama dipelihara manusia mungkin tidak bisa kembali ke alam. Mereka dirawat di pulau suaka.' },
    { id: 'edukasi', title: 'Belajar Bersama', text: 'Lewat Orangutan Goes to School dan Student Goes to Nature, Bakti BCA mengajak pelajar mengenal orang utan dan hutannya.' },
    { id: 'jarak', title: 'Jaga Jarak', text: 'Orang utan bisa tertular penyakit manusia. Karena itu pengasuh memakai masker, dan orang utan yang akan dilepas harus menjauhi manusia.' },
    { id: 'hutan', title: 'Lindungi Rumahnya', text: 'Menjaga hutan jauh lebih mudah daripada menyelamatkan orang utan yang kehilangan rumah.' },
    { id: 'kehje', title: 'Kembali ke Alam', text: 'Orang utan yang lulus rehabilitasi dilepasliarkan ke hutan yang aman dan dijaga, misalnya Hutan Kehje Sewen di Kalimantan Timur.' }
  ],
  /* Fakta yang ditampilkan di kartu rapor setelah tiap pelajaran. */
  lessonFacts: {
    feed: ['makanan', 'peliharaan'],
    climb: ['lengan', 'ekor'],
    forage: ['alat', 'petani'],
    nest: ['sarang', 'induk'],
    island: ['pulau', 'pulauBCA', 'jarak']
  },

  program: {
    kicker: 'Bakti BCA · Bakti Lingkungan',
    title: 'Dari sekolah hutan, pulang ke rumah.',
    lead: 'Sejak tahun dua ribu dua belas, Bakti BCA bersama Yayasan BOS (BOSF) dan BKSDA Kalimantan Timur mendukung rehabilitasi dan pelepasliaran orang utan di Samboja Lestari.',
    countLine: '{n} orang utan telah dilepasliarkan dengan dukungan Bakti BCA.',
    cards: [
      { title: 'Pulau pra-pelepasliaran', text: 'Bakti BCA membantu memperbaiki empat pulau buatan: tempat latihan terakhir sebelum dilepas, dan tempat tinggal orang utan yang tidak bisa kembali ke alam.' },
      { title: 'Belajar sejak sekolah', text: 'Orangutan Goes to School dan Student Goes to Nature mengajak pelajar mengenal orang utan dan menjaga hutannya.' }
    ],
    source: 'Sumber: halaman Pelestarian Orangutan di situs BCA; pemberitaan perbaikan empat pulau buatan BOSF di Samboja. Bakti adalah tokoh rekaan dan tahapan rehabilitasi disederhanakan untuk permainan.',
    sourceButton: 'Buka halaman BCA ↗',
    close: 'Kembali'
  },

  actions: [
    'Jangan memelihara atau membeli satwa liar.',
    'Laporkan perdagangan satwa liar kepada petugas.',
    'Hemat kertas dan ikut menanam pohon di sekitarmu.',
    'Ceritakan tentang orang utan kepada teman dan keluargamu!'
  ],

  /* Nama yang tidak pantas diganti otomatis menjadi nama bawaan. */
  blockedWords: ['anjing', 'anjir', 'babi', 'bangsat', 'kontol', 'memek', 'ngentot', 'entot', 'goblok', 'tolol', 'bego', 'jancok', 'jancuk', 'asu', 'tai', 'kampret', 'bajingan', 'pepek', 'fuck', 'shit', 'bitch', 'dick']
};
