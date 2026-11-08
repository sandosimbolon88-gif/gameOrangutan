# Rencana Game "Sekolah Hutan Bakti" — Bakti BCA × Pelestarian Orang Utan

> Status: **V1 selesai dibangun** (lihat README.md untuk cara menjalankan).
> Game kedua dari seri ini, "Pohon Baktiku" (penanaman pohon), menyusul.

## 0. Keputusan yang dipakai di V1

Beberapa pertanyaan di diskusi konsep belum dijawab, jadi V1 memakai default berikut. Semuanya mudah diganti.

| Topik | Keputusan V1 | Alasan |
| --- | --- | --- |
| Format | Sama dengan *Jejak Si Macan Tutul*: web statis 16:9, layar sentuh + mouse, satu file HTML offline, papan skor lokal, panel admin ber-PIN | Supaya seri game seragam dan panitia booth tidak perlu belajar alat baru |
| Durasi | ±3 menit (lima pelajaran, bawaan 25 detik/pelajaran dengan pengali per pelajaran) | Setara durasi macan tutul |
| Pemain utama | Pelajar SD–SMP dan pengunjung umum booth | Cocok untuk Orangutan Goes to School dan Student Goes to Nature |
| Tokoh | Bakti, bayi orang utan (tokoh rekaan) | Nama selaras dengan Bakti BCA |
| Gaya gambar | Kartun vektor yang digambar dengan kode; anatomi tetap sesuai alam (rambut jingga panjang menjuntai, lengan jauh lebih panjang dari kaki, lingkar mata/moncong pucat khas anak orang utan, tanpa ekor) | Tanpa masalah lisensi, ringan, bisa diganti ilustrator |
| Logo | Tanpa logo resmi; "bakti BCA" hanya teks identitas | Sama dengan game macan tutul |
| Angka program | `releasedCount: 49` di `js/config.js` (angka publik situs BCA) | Lihat §4 — perlu keputusan tim |
| Bahasa | Bahasa Indonesia | — |

## 1. Konsep

Pemain menjadi pengasuh di sekolah hutan. Bakti kehilangan induknya; pemain membantunya melewati tahapan rehabilitasi sampai siap dilepasliarkan.

**Pesan utama:** anak orang utan belajar dari induknya bertahun-tahun. Kalau induknya hilang, manusia harus menggantikan sekolah itu dan butuh waktu lama. Menjaga hutan jauh lebih mudah daripada menyelamatkan orang utan.

**Pesan pendukung per pelajaran:**
1. Orang utan bukan hewan peliharaan; makanannya beragam dari hutan.
2. Orang utan menguji dahan sebelum berpindah.
3. Orang utan pandai memakai alat (ranting, daun spons, daun payung).
4. Orang utan membuat sarang baru setiap sore, tinggi dan kuat.
5. Sebelum dilepas, orang utan harus mandiri dan menjauhi manusia — membantu berarti tidak ikut campur.
6. (Penutup) Orang utan menebar biji: petani hutan. Ini jembatan ke game penanaman pohon.

## 2. Alur layar

```
[Beranda] → [Misi pengasuh] → [Cara main → Pelajaran → Rapor] × 5 → [Hari pelepasliaran] → [Rapor kelulusan + nama] → [Papan skor]
     ↑                                                                                                                   ↓
     └──────────────────────────────────────── (diam 45 detik / Beranda) ←──────────────────────────────────────────────┘
```

- **Cara main**: dua kartu bergambar (✓ lakukan, ✕ hindari) + waktu pelajaran. Mulai otomatis setelah 7 detik.
- **Rapor per pelajaran**: bintang, poin, bonus waktu, dan satu fakta yang relevan. Pemain menekan Lanjut.
- **Hari pelepasliaran**: animasi ±11 detik lalu kartu penutup; bisa dilewati.

## 3. Mekanik (ringkas)

Detail angka ada di README dan `js/config.js`.

| Pelajaran | Interaksi | Selesai jika | Kesalahan |
| --- | --- | --- | --- |
| Makanan Bakti | Ketuk makanan yang lewat | Empat menu sehat masing-masing terisi dua | Mengetuk makanan manusia |
| Pilih Dahan Kuat | Ketuk satu dari dua dahan di tingkat berikutnya | Delapan tingkat | Dahan lapuk (patah) |
| Jelajah Kanopi | Cari & ketuk; pilih ranting yang pas (empat pilihan) atau alat untuk minum; cari payung saat hujan | Enam temuan + payung | Alat salah; hujan terlewat (tanpa potongan poin) |
| Sarang Sebelum Gelap | Pilih tempat → anyam dahan bersinar → daun alas | Bakti tidur | Tempat salah; salah urutan |
| Amati, Jangan Bantu | Saat Bakti beraksi, pilih perilakunya di buku catatan; tahan dua godaan | Lima perilaku tercatat + dua godaan selesai | Perilaku salah; mencatat saat santai; menekan godaan |

## 4. Perlu keputusan tim

1. **Angka resmi orang utan yang dilepasliarkan.** Situs BCA menyebut 49; dashboard internal program memuat angka yang berbeda (tidak dicantumkan di repo publik ini). V1 memakai 49 karena publik. Ganti `releasedCount` atau isi `null` untuk kalimat tanpa angka.
2. **Penyebutan Hutan Kehje Sewen** sebagai contoh lokasi pelepasliaran (kartu fakta "Kembali ke Alam"). Mohon dicek ke BOSF apakah masih relevan untuk dukungan Bakti BCA.
3. **Kartu Flazz BCA Bakti Edition** (bayi orang utan bernama Bakti) belum disebut di game. Bisa ditambahkan sebagai kartu fakta bila tim brand setuju.
4. **Perangkat booth dan durasi**: bila booth ramai, panitia bisa memilih 20 detik/pelajaran (±2,5 menit).
5. **Ilustrasi final**: bila ada ilustrator, pose Bakti dan latar bisa diganti tanpa mengubah logika (lihat `tools/gallery.html`).

## 5. Sambungan ke game penanaman pohon (rencana)

- Penutup game ini sudah menampilkan biji yang jatuh dan tumbuh menjadi bibit.
- Usulan: menamatkan Sekolah Hutan memberi "biji dari Bakti" (kode/QR) yang bisa ditanam di game Pohon Baktiku, di lokasi Samboja Lestari, yang juga menjadi salah satu lokasi penanaman pohon Bakti BCA di lahan kritis.
- Keputusan kontribusi 1:1 nyata atau gabungan/simbolis tetap dibahas saat merancang game pohon.

## 6. Sumber

Lihat bagian Sumber di README. Materi kualitatif saja; tidak ada data mentah internal di repo.
