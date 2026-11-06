const c = String.raw;
const WORLDS = [
{ id: 'desa', name: 'Desa Echo', biome: 'desa', blurb: 'Tempat semua petualang mulai: tag PHP, echo, dan angka.', lessons: [
{ id: 'halo', title: 'Halo, PHP!', steps: [
  { say: 'Halo, petualang! Aku Kancil, pemandumu di dunia PHP. Tenang, kita mulai dari nol banget.' },
  { say: 'PHP adalah bahasa untuk bikin website dinamis. Semua kode PHP ditulis setelah tanda pembuka <?php.' },
  { say: 'Perintah pertama yang wajib kamu kenal: echo. Gunanya menampilkan teks ke layar. Teks ditulis di dalam tanda kutip.', code: c`<?php
echo "Halo, Dunia!";` },
  { say: 'Lihat titik koma ; di akhir? Itu WAJIB di setiap perintah. Lupa titik koma = error paling sering untuk pemula!' },
  { say: 'Mau pindah baris? Pakai \n di dalam tanda kutip ganda.', code: c`<?php
echo "Baris pertama\n";
echo "Baris kedua";` },
  { say: 'Klik tombol "Coba di Editor" pada contoh, lalu tekan Jalankan. Setelah itu kita latihan!' }
], ex: [
  { t: 'Tampilkan tulisan <b>Halo, Dunia!</b> dengan echo.', s: c`<?php
// tulis kodemu di bawah ini
`, a: c`<?php
echo "Halo, Dunia!";`, h: 'Tulis: echo "Halo, Dunia!"; — jangan lupa tanda kutip dan titik koma.', need: [['echo', 'Gunakan perintah echo ya.']] },
  { t: 'Tampilkan dua baris:<br><code>Aku belajar PHP</code><br><code>Hari ini semangat!</code>', s: c`<?php
`, a: c`<?php
echo "Aku belajar PHP\n";
echo "Hari ini semangat!";`, h: 'Pakai \n di akhir kalimat pertama supaya kalimat kedua turun ke baris baru.' },
  { t: 'Kode di bawah error. Perbaiki supaya tampil:<br><code>Selamat pagi</code><br><code>Ayo ngoding</code>', s: c`<?php
echo "Selamat pagi\n"
echo "Ayo ngoding";`, a: c`<?php
echo "Selamat pagi\n";
echo "Ayo ngoding";`, h: 'Cek akhir baris 2. Ada yang kurang di sana?' }
]},
{ id: 'angka', title: 'Komentar & Angka', steps: [
  { say: 'Komentar adalah catatan yang diabaikan PHP. Pakai // untuk satu baris, atau /* ... */ untuk banyak baris.', code: c`<?php
// ini komentar, tidak ditampilkan
echo "Komentar tidak muncul"; /* ini juga komentar */` },
  { say: 'Angka ditulis tanpa tanda kutip. PHP bisa langsung menghitung: + tambah, - kurang, * kali, / bagi.', code: c`<?php
echo 7 + 3;
echo "\n";
echo 20 / 4;` },
  { say: 'Ada juga % (sisa bagi) dan ** (pangkat). Contoh: 10 % 3 hasilnya 1, dan 2 ** 3 hasilnya 8.', code: c`<?php
echo 10 % 3, "\n";
echo 2 ** 3;` },
  { say: 'Tips: echo bisa menerima beberapa nilai dipisah koma. Urutan hitung sama seperti matematika: kurung dulu, lalu kali/bagi, lalu tambah/kurang.' }
], ex: [
  { t: 'Hitung dan tampilkan hasil <b>25 dikali 4</b> (biarkan PHP yang menghitung).', s: c`<?php
`, a: c`<?php
echo 25 * 4;`, h: 'Operator kali di PHP adalah tanda bintang *.', need: [['\\*', 'Gunakan operator * supaya PHP yang menghitung.']] },
  { t: 'Tampilkan hasil dari <b>(15 + 5) dikali 2</b>.', s: c`<?php
`, a: c`<?php
echo (15 + 5) * 2;`, h: 'Tanpa kurung, PHP mengalikan dulu. Pakai kurung ( ) di sekitar 15 + 5.', need: [['\\(\\s*15\\s*\\+\\s*5\\s*\\)', 'Pakai tanda kurung: (15 + 5).']] },
  { t: 'Tampilkan sisa bagi <b>17 dibagi 5</b>, lalu di baris berikutnya <b>2 pangkat 8</b>.', s: c`<?php
`, a: c`<?php
echo 17 % 5, "\n";
echo 2 ** 8;`, h: 'Sisa bagi pakai %, pangkat pakai **. Jangan lupa "\n" di antaranya.', need: [['%', 'Gunakan operator % untuk sisa bagi.'], ['\\*\\*', 'Gunakan operator ** untuk pangkat.']] }
]}
]},
{ id: 'hutan', name: 'Hutan Variabel', biome: 'hutan', blurb: 'Menyimpan data di variabel, mengenal tipe data dan string.', lessons: [
{ id: 'variabel', title: 'Variabel', steps: [
  { say: 'Variabel itu seperti kotak berlabel untuk menyimpan data. Di PHP, nama variabel selalu diawali tanda dolar $.', code: c`<?php
$nama = "Sari";
$umur = 19;
echo $nama;` },
  { say: 'Tanda = artinya "isi dengan", bukan "sama dengan". Jadi $umur = 19 berarti kotak $umur diisi 19.' },
  { say: 'Di dalam tanda kutip GANDA, variabel otomatis diganti isinya. Di kutip tunggal tidak!', code: c`<?php
$nama = "Sari";
echo "Halo $nama\n";
echo 'Halo $nama';` },
  { say: 'Variabel bisa dipakai untuk menghitung, lalu hasilnya disimpan ke variabel lain.', code: c`<?php
$harga = 12000;
$jumlah = 3;
$total = $harga * $jumlah;
echo "Total bayar: $total";` },
  { say: 'Aturan nama: diawali huruf atau _, tidak boleh spasi, dan huruf besar-kecil dibedakan ($Nama beda dengan $nama).' }
], ex: [
  { t: 'Buat variabel <code>$nama</code> berisi <code>"Sari"</code> dan <code>$kota</code> berisi <code>"Bandung"</code>. Tampilkan: <code>Sari tinggal di Bandung</code>', s: c`<?php
`, a: c`<?php
$nama = "Sari";
$kota = "Bandung";
echo "$nama tinggal di $kota";`, h: 'Buat dua variabel dulu, lalu echo "$nama tinggal di $kota";', need: [['\\$nama\\s*=', 'Buat variabel $nama dulu.'], ['\\$kota\\s*=', 'Buat variabel $kota dulu.'], ['echo[^;]*\\$nama', 'Tampilkan pakai variabel $nama, jangan ditulis langsung.']] },
  { t: 'Persegi panjang punya <code>$panjang = 8</code> dan <code>$lebar = 5</code>. Simpan hasil kali keduanya ke <code>$luas</code>, lalu tampilkan <code>Luas: 40</code>', s: c`<?php
$panjang = 8;
$lebar = 5;
`, a: c`<?php
$panjang = 8;
$lebar = 5;
$luas = $panjang * $lebar;
echo "Luas: $luas";`, h: '$luas = $panjang * $lebar; lalu echo "Luas: $luas";', need: [['\\$luas\\s*=\\s*\\$panjang\\s*\\*\\s*\\$lebar|\\$luas\\s*=\\s*\\$lebar\\s*\\*\\s*\\$panjang', 'Hitung $luas dari $panjang * $lebar.']], vary: [{ panjang: '12' }, { lebar: '3' }] },
  { t: 'Tukar isi <code>$a</code> dan <code>$b</code> supaya tampil <code>a = 20, b = 10</code>. Jangan ubah dua baris pertama!', s: c`<?php
$a = 10;
$b = 20;
// tukar di sini

echo "a = $a, b = $b";`, a: c`<?php
$a = 10;
$b = 20;
$temp = $a;
$a = $b;
$b = $temp;
echo "a = $a, b = $b";`, h: 'Pakai variabel bantuan: $temp = $a; lalu $a = $b; lalu $b = $temp;', need: [['\\$a\\s*=\\s*\\$|\\[\\s*\\$a\\s*,\\s*\\$b\\s*\\]\\s*=', 'Tukar nilainya pakai variabel, bukan menulis angka langsung.']], vary: [{ a: '3', b: '7' }] }
]},
{ id: 'tipe', title: 'Tipe Data', steps: [
  { say: 'Setiap nilai punya tipe. Yang utama: string (teks), int (bilangan bulat), float (desimal), bool (true/false), dan null (kosong).', code: c`<?php
$teks = "PHP";     // string
$umur = 20;        // int
$ipk = 3.75;       // float
$lulus = true;     // bool
$kosong = null;    // null` },
  { say: 'Mau tahu tipe dan isi sebuah variabel? Pakai var_dump(). Ini senjata utama saat mencari bug!', code: c`<?php
var_dump(20);
var_dump("PHP");
var_dump(3.75);
var_dump(true);` },
  { say: 'gettype() mengembalikan nama tipenya sebagai teks. Catatan: float disebut "double" oleh gettype.', code: c`<?php
echo gettype(3.5);` },
  { say: 'Kamu bisa mengubah tipe dengan casting: (int), (float), (string), (bool). Berguna saat data dari form masih berupa teks.', code: c`<?php
$teks = "42";
$angka = (int) $teks;
var_dump($angka + 8);` }
], ex: [
  { t: 'Gunakan <code>var_dump</code> untuk menampilkan angka <code>42</code> lalu teks <code>"PHP"</code>.', s: c`<?php
`, a: c`<?php
var_dump(42);
var_dump("PHP");`, h: 'Dua baris: var_dump(42); dan var_dump("PHP");', need: [['var_dump', 'Gunakan var_dump().']] },
  { t: 'Variabel <code>$x = 3.5</code>. Tampilkan tipe datanya dengan <code>gettype()</code>.', s: c`<?php
$x = 3.5;
`, a: c`<?php
$x = 3.5;
echo gettype($x);`, h: 'echo gettype($x);', need: [['gettype\\s*\\(\\s*\\$x', 'Panggil gettype($x).']] },
  { t: '<code>$teks = "25"</code> masih string. Ubah jadi int dengan casting ke <code>$angka</code>, lalu <code>var_dump($angka + 5)</code>.', s: c`<?php
$teks = "25";
`, a: c`<?php
$teks = "25";
$angka = (int) $teks;
var_dump($angka + 5);`, h: '$angka = (int) $teks;', need: [['\\(int\\)|intval', 'Ubah tipenya pakai (int) atau intval().']] }
]},
{ id: 'string', title: 'Olah String', steps: [
  { say: 'Untuk menggabung string, pakai titik . (namanya concatenation).', code: c`<?php
$depan = "Budi";
$belakang = "Santoso";
echo $depan . " " . $belakang;` },
  { say: 'PHP punya banyak fungsi string bawaan. strlen() menghitung panjang, strtoupper() jadi huruf besar, strtolower() jadi huruf kecil.', code: c`<?php
$kata = "Gunadarma";
echo strlen($kata), "\n";
echo strtoupper($kata), "\n";
echo strtolower($kata);` },
  { say: 'Ada juga ucfirst() untuk huruf pertama kapital, str_repeat() untuk mengulang, dan strrev() untuk membalik.', code: c`<?php
echo ucfirst("kancil"), "\n";
echo str_repeat("ha", 3), "\n";
echo strrev("PHP seru");` },
  { say: 'Operator .= menambahkan teks ke variabel yang sudah ada. Praktis untuk menyusun kalimat sedikit demi sedikit.', code: c`<?php
$pesan = "Halo";
$pesan .= ", apa kabar?";
echo $pesan;` }
], ex: [
  { t: 'Gabungkan <code>$depan</code> dan <code>$belakang</code> dengan spasi memakai operator titik, hasilnya <code>Budi Santoso</code>.', s: c`<?php
$depan = "Budi";
$belakang = "Santoso";
`, a: c`<?php
$depan = "Budi";
$belakang = "Santoso";
echo $depan . " " . $belakang;`, h: 'echo $depan . " " . $belakang;', need: [['\\$depan\\s*\\.', 'Gabungkan memakai operator titik (.)']], vary: [{ depan: '"Rina"' }] },
  { t: 'Hitung panjang kata <code>"Universitas"</code> dengan strlen dan tampilkan <code>Panjang: 11</code>.', s: c`<?php
$kata = "Universitas";
`, a: c`<?php
$kata = "Universitas";
echo "Panjang: " . strlen($kata);`, h: 'echo "Panjang: " . strlen($kata);', need: [['strlen', 'Gunakan strlen().']], vary: [{ kata: '"Gunadarma"' }] },
  { t: 'Dari <code>$kata = "php"</code>, tampilkan <code>PHP!!!</code> memakai strtoupper dan str_repeat.', s: c`<?php
$kata = "php";
`, a: c`<?php
$kata = "php";
echo strtoupper($kata) . str_repeat("!", 3);`, h: 'strtoupper($kata) . str_repeat("!", 3)', need: [['strtoupper', 'Gunakan strtoupper().'], ['str_repeat', 'Gunakan str_repeat() untuk tanda serunya.']] }
]}
]},
{ id: 'sungai', name: 'Sungai Logika', biome: 'sungai', blurb: 'Membuat keputusan dengan if, else, switch, dan match.', lessons: [
{ id: 'ifelse', title: 'If & Else', steps: [
  { say: 'Program sering harus memilih. Untuk itu ada if: kalau kondisinya benar (true), blok di dalam { } dijalankan.', code: c`<?php
$nilai = 85;
if ($nilai >= 70) {
    echo "Lulus!";
}` },
  { say: 'Operator pembanding: == sama, != tidak sama, > lebih besar, < lebih kecil, >= dan <=. Ingat: = itu mengisi, == itu membandingkan!' },
  { say: 'else dijalankan kalau kondisi if salah.', code: c`<?php
$uang = 5000;
if ($uang >= 10000) {
    echo "Beli bakso";
} else {
    echo "Beli cilok saja";
}` },
  { say: 'Banyak pilihan? Pakai elseif. PHP mengecek dari atas, dan berhenti di kondisi pertama yang benar.', code: c`<?php
$jam = 14;
if ($jam < 11) {
    echo "Selamat pagi";
} elseif ($jam < 15) {
    echo "Selamat siang";
} elseif ($jam < 18) {
    echo "Selamat sore";
} else {
    echo "Selamat malam";
}` },
  { say: 'Di latihan bagian ini, aku akan mengetes kodemu dengan nilai lain juga. Jadi jangan cuma echo jawabannya ya, hehe.' }
], ex: [
  { t: 'Jika <code>$nilai</code> 70 ke atas tampilkan <code>Lulus</code>, selain itu <code>Remedial</code>.', s: c`<?php
$nilai = 75;
`, a: c`<?php
$nilai = 75;
if ($nilai >= 70) {
    echo "Lulus";
} else {
    echo "Remedial";
}`, h: 'if ($nilai >= 70) { ... } else { ... }', need: [['if\\s*\\(', 'Gunakan if.'], ['else', 'Jangan lupa else untuk kondisi sebaliknya.']], vary: [{ nilai: '50' }, { nilai: '70' }] },
  { t: 'Cek apakah <code>$angka</code> genap atau ganjil. Contoh output: <code>7 adalah ganjil</code>', s: c`<?php
$angka = 7;
`, a: c`<?php
$angka = 7;
if ($angka % 2 == 0) {
    echo "$angka adalah genap";
} else {
    echo "$angka adalah ganjil";
}`, h: 'Bilangan genap kalau sisa bagi 2-nya 0: $angka % 2 == 0', need: [['%\\s*2', 'Gunakan % 2 untuk cek genap/ganjil.']], vary: [{ angka: '10' }, { angka: '0' }, { angka: '13' }] },
  { t: 'Tentukan grade dari <code>$nilai</code>: 85+ = A, 75+ = B, 65+ = C, 50+ = D, sisanya E. Tampilkan hurufnya saja.', s: c`<?php
$nilai = 82;
`, a: c`<?php
$nilai = 82;
if ($nilai >= 85) {
    echo "A";
} elseif ($nilai >= 75) {
    echo "B";
} elseif ($nilai >= 65) {
    echo "C";
} elseif ($nilai >= 50) {
    echo "D";
} else {
    echo "E";
}`, h: 'Mulai dari nilai paling tinggi: if (>= 85) lalu elseif (>= 75) dan seterusnya.', need: [['elseif|else\\s+if', 'Gunakan elseif untuk banyak pilihan.']], vary: [{ nilai: '95' }, { nilai: '65' }, { nilai: '40' }, { nilai: '50' }] }
]},
{ id: 'logika', title: 'Logika, Switch & Match', steps: [
  { say: 'Gabungkan kondisi dengan && (dan), || (atau), dan ! (bukan). && benar kalau DUA-DUANYA benar, || benar kalau SALAH SATU benar.', code: c`<?php
$umur = 20;
$punyaKTP = true;
if ($umur >= 17 && $punyaKTP) {
    echo "Boleh ikut pemilu";
}` },
  { say: 'Kalau membandingkan satu variabel dengan banyak nilai pasti, switch lebih rapi. Jangan lupa break di setiap case!', code: c`<?php
$menu = 2;
switch ($menu) {
    case 1:
        echo "Nasi goreng";
        break;
    case 2:
        echo "Mie ayam";
        break;
    default:
        echo "Menu tidak ada";
}` },
  { say: 'PHP 8 punya match: lebih ringkas, langsung menghasilkan nilai, dan tidak butuh break.', code: c`<?php
$kode = "JKT";
$kota = match ($kode) {
    "JKT" => "Jakarta",
    "BDG" => "Bandung",
    default => "Tidak dikenal",
};
echo $kota;` },
  { say: 'Ada juga operator ternary: kondisi ? nilaiJikaBenar : nilaiJikaSalah. Cocok untuk pilihan singkat.', code: c`<?php
$stok = 0;
echo $stok > 0 ? "Tersedia" : "Habis";` }
], ex: [
  { t: 'Tampilkan <code>Boleh menyetir</code> jika <code>$umur</code> minimal 17 <b>dan</b> <code>$punyaSIM</code> true. Selain itu <code>Belum boleh</code>.', s: c`<?php
$umur = 20;
$punyaSIM = true;
`, a: c`<?php
$umur = 20;
$punyaSIM = true;
if ($umur >= 17 && $punyaSIM) {
    echo "Boleh menyetir";
} else {
    echo "Belum boleh";
}`, h: 'if ($umur >= 17 && $punyaSIM) { ... }', need: [['&&|\\band\\b', 'Gabungkan dua kondisi dengan &&.']], vary: [{ umur: '15' }, { punyaSIM: 'false' }, { umur: '17' }] },
  { t: 'Pakai <b>switch</b>: ubah <code>$hari</code> (1-7) jadi nama hari: 1 Senin, 2 Selasa, 3 Rabu, 4 Kamis, 5 Jumat, 6 Sabtu, 7 Minggu. Selain itu <code>Tidak valid</code>.', s: c`<?php
$hari = 3;
`, a: c`<?php
$hari = 3;
switch ($hari) {
    case 1: echo "Senin"; break;
    case 2: echo "Selasa"; break;
    case 3: echo "Rabu"; break;
    case 4: echo "Kamis"; break;
    case 5: echo "Jumat"; break;
    case 6: echo "Sabtu"; break;
    case 7: echo "Minggu"; break;
    default: echo "Tidak valid";
}`, h: 'switch ($hari) { case 1: echo "Senin"; break; ... default: ... }', need: [['switch', 'Gunakan switch.'], ['default', 'Tambahkan default untuk nilai yang tidak valid.']], vary: [{ hari: '7' }, { hari: '1' }, { hari: '9' }] },
  { t: 'Pakai <b>match</b>: <code>$kode</code> "ID" → <code>Indonesia</code>, "MY" → <code>Malaysia</code>, "SG" → <code>Singapura</code>, lainnya <code>Tidak dikenal</code>.', s: c`<?php
$kode = "ID";
`, a: c`<?php
$kode = "ID";
echo match ($kode) {
    "ID" => "Indonesia",
    "MY" => "Malaysia",
    "SG" => "Singapura",
    default => "Tidak dikenal",
};`, h: 'echo match ($kode) { "ID" => "Indonesia", ..., default => "Tidak dikenal" };', need: [['match\\s*\\(', 'Gunakan match.']], vary: [{ kode: '"SG"' }, { kode: '"JP"' }] }
]}
]},
{ id: 'gua', name: 'Gua Perulangan', biome: 'gua', blurb: 'Mengulang perintah dengan for, while, dan loop bersarang.', lessons: [
{ id: 'for', title: 'Perulangan For', steps: [
  { say: 'Bayangkan disuruh menulis angka 1 sampai 100. Capek kan? Perulangan (loop) mengerjakannya untukmu.' },
  { say: 'for punya 3 bagian: mulai dari mana; sampai kapan; lalu langkahnya. $i++ artinya tambah 1.', code: c`<?php
for ($i = 1; $i <= 5; $i++) {
    echo "Putaran ke-$i\n";
}` },
  { say: 'Langkahnya bisa diubah. Misalnya $i += 2 untuk lompat dua-dua, atau $i-- untuk mundur.', code: c`<?php
for ($i = 10; $i >= 0; $i -= 2) {
    echo $i . " ";
}` },
  { say: 'Pola penting: variabel "penampung" di luar loop untuk menjumlah.', code: c`<?php
$total = 0;
for ($i = 1; $i <= 10; $i++) {
    $total += $i;
}
echo "Jumlah 1-10: $total";` }
], ex: [
  { t: 'Tampilkan angka <b>1 sampai 10</b>, masing-masing di baris sendiri, memakai <b>for</b>.', s: c`<?php
`, a: c`<?php
for ($i = 1; $i <= 10; $i++) {
    echo "$i\n";
}`, h: 'for ($i = 1; $i <= 10; $i++) { echo "$i\n"; }', need: [['for\\s*\\(', 'Gunakan perulangan for.']] },
  { t: 'Tampilkan kelipatan 3 dari <b>3 sampai 30</b> dalam satu baris, dipisah spasi: <code>3 6 9 ... 30</code>', s: c`<?php
`, a: c`<?php
for ($i = 3; $i <= 30; $i += 3) {
    echo $i . " ";
}`, h: 'Mulai $i = 3, lalu tambah 3 setiap putaran: $i += 3', need: [['for\\s*\\(', 'Gunakan perulangan for.']] },
  { t: 'Hitung jumlah semua angka dari 1 sampai <code>$n</code> pakai for. Untuk $n = 100 tampil <code>Total: 5050</code>', s: c`<?php
$n = 100;
$total = 0;
`, a: c`<?php
$n = 100;
$total = 0;
for ($i = 1; $i <= $n; $i++) {
    $total += $i;
}
echo "Total: $total";`, h: 'Di dalam loop: $total += $i; — lalu echo setelah loop selesai.', need: [['for\\s*\\(', 'Gunakan perulangan for.']], vary: [{ n: '10' }, { n: '7' }] }
]},
{ id: 'while', title: 'While & Do-While', steps: [
  { say: 'while mengulang selama kondisinya masih benar. Cocok kalau kamu belum tahu harus berapa kali mengulang.', code: c`<?php
$energi = 3;
while ($energi > 0) {
    echo "Lari! Energi: $energi\n";
    $energi--;
}
echo "Capek, istirahat dulu.";` },
  { say: 'HATI-HATI: kalau nilai di dalam loop tidak pernah berubah, loop tidak akan berhenti (infinite loop). Di sini programnya akan aku hentikan otomatis.' },
  { say: 'do-while mirip while, tapi isinya dijalankan minimal sekali, karena kondisinya dicek di akhir.', code: c`<?php
$x = 10;
do {
    echo "Dijalankan sekali walau x = $x";
} while ($x < 5);` },
  { say: 'Contoh nyata: menabung sampai target tercapai.', code: c`<?php
$tabungan = 0;
$bulan = 0;
while ($tabungan < 500000) {
    $tabungan += 120000;
    $bulan++;
}
echo "Target tercapai dalam $bulan bulan";` }
], ex: [
  { t: 'Pakai <b>while</b> untuk hitung mundur dari <code>$hitung</code> ke 1 (satu angka per baris), lalu tampilkan <code>Meluncur!</code>', s: c`<?php
$hitung = 5;
`, a: c`<?php
$hitung = 5;
while ($hitung >= 1) {
    echo "$hitung\n";
    $hitung--;
}
echo "Meluncur!";`, h: 'while ($hitung >= 1) { echo "$hitung\n"; $hitung--; }', need: [['while\\s*\\(', 'Gunakan while.']], vary: [{ hitung: '3' }] },
  { t: 'Saldo awal 0. Tiap bulan menabung <code>$setoran</code>. Pakai while untuk cari berapa bulan sampai saldo minimal 1.000.000. Tampilkan <code>Butuh 7 bulan</code>.', s: c`<?php
$setoran = 150000;
$saldo = 0;
$bulan = 0;
`, a: c`<?php
$setoran = 150000;
$saldo = 0;
$bulan = 0;
while ($saldo < 1000000) {
    $saldo += $setoran;
    $bulan++;
}
echo "Butuh $bulan bulan";`, h: 'Selama $saldo < 1000000: tambah setoran ke saldo dan tambah $bulan 1.', need: [['while\\s*\\(', 'Gunakan while.']], vary: [{ setoran: '250000' }, { setoran: '100000' }] },
  { t: 'Hitung jumlah digit <code>$angka</code> pakai while (bagi 10 terus pakai intdiv sampai 0). Untuk 98765 tampil <code>Jumlah digit: 5</code>', s: c`<?php
$angka = 98765;
$digit = 0;
`, a: c`<?php
$angka = 98765;
$digit = 0;
do {
    $angka = intdiv($angka, 10);
    $digit++;
} while ($angka > 0);
echo "Jumlah digit: $digit";`, h: 'Setiap putaran: $angka = intdiv($angka, 10); $digit++; sampai $angka jadi 0.', need: [['while', 'Gunakan while atau do-while.']], vary: [{ angka: '7' }, { angka: '1000' }] }
]},
{ id: 'nested', title: 'Loop Bersarang', steps: [
  { say: 'Loop bisa ada di dalam loop. Loop dalam selesai dulu semua, baru loop luar maju satu langkah.', code: c`<?php
for ($baris = 1; $baris <= 3; $baris++) {
    for ($kolom = 1; $kolom <= 4; $kolom++) {
        echo "# ";
    }
    echo "\n";
}` },
  { say: 'break menghentikan loop saat itu juga. continue melewati sisa putaran ini dan lanjut ke putaran berikutnya.', code: c`<?php
for ($i = 1; $i <= 10; $i++) {
    if ($i == 3) continue; // lewati 3
    if ($i == 7) break;    // berhenti di 7
    echo $i . " ";
}` },
  { say: 'Pola segitiga sering ditanya di ujian! Loop dalam berjalan sampai nilai loop luar.', code: c`<?php
for ($i = 1; $i <= 4; $i++) {
    echo str_repeat("*", $i) . "\n";
}` }
], ex: [
  { t: 'Buat segitiga bintang setinggi <code>$tinggi</code> memakai <b>dua for bersarang</b> (tanpa str_repeat):<pre>*\n**\n***\n****\n*****</pre>', s: c`<?php
$tinggi = 5;
`, a: c`<?php
$tinggi = 5;
for ($i = 1; $i <= $tinggi; $i++) {
    for ($j = 1; $j <= $i; $j++) {
        echo "*";
    }
    echo "\n";
}`, h: 'Loop luar $i 1..$tinggi; loop dalam $j 1..$i mencetak "*"; setelah loop dalam echo "\n".', need: [['for[\\s\\S]*for', 'Gunakan dua for bersarang.'], ['^(?![\\s\\S]*str_repeat)', 'Coba tanpa str_repeat ya, pakai loop dalam.']], vary: [{ tinggi: '3' }] },
  { t: 'Buat tabel perkalian <code>$n</code> dari 1 sampai 10. Contoh baris: <code>3 x 1 = 3</code>', s: c`<?php
$n = 3;
`, a: c`<?php
$n = 3;
for ($i = 1; $i <= 10; $i++) {
    echo "$n x $i = " . ($n * $i) . "\n";
}`, h: 'echo "$n x $i = " . ($n * $i) . "\n";', need: [['for\\s*\\(', 'Gunakan for.']], vary: [{ n: '7' }] },
  { t: 'Tampilkan 1 sampai 20 dipisah spasi, tapi <b>lewati kelipatan 4</b> dengan <code>continue</code>.', s: c`<?php
`, a: c`<?php
for ($i = 1; $i <= 20; $i++) {
    if ($i % 4 == 0) {
        continue;
    }
    echo $i . " ";
}`, h: 'if ($i % 4 == 0) continue;', need: [['continue', 'Gunakan continue.']] }
]}
]},
{ id: 'pasar', name: 'Pasar Array', biome: 'pasar', blurb: 'Menyimpan banyak data sekaligus dengan array.', lessons: [
{ id: 'array', title: 'Array Dasar', steps: [
  { say: 'Array = satu variabel yang menyimpan banyak nilai. Tulis dengan kurung siku [ ].', code: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
echo $buah[0];` },
  { say: 'PENTING: indeks array mulai dari 0, bukan 1! Jadi elemen kedua adalah $buah[1].' },
  { say: 'Tambah elemen di akhir dengan $array[] = nilai. count() menghitung jumlah elemen.', code: c`<?php
$buah = ["Apel", "Jeruk"];
$buah[] = "Durian";
echo count($buah);` },
  { say: 'echo tidak bisa menampilkan array langsung. Pakai print_r() untuk melihat isinya.', code: c`<?php
$nilai = [80, 95, 70];
print_r($nilai);` },
  { say: 'Untuk memproses tiap elemen, pakai foreach. Ini pasangan terbaik array!', code: c`<?php
$teman = ["Andi", "Bela", "Caca"];
foreach ($teman as $nama) {
    echo "Halo, $nama!\n";
}` }
], ex: [
  { t: 'Tampilkan elemen <b>kedua</b> dari array <code>$buah</code> (hasilnya <code>Jeruk</code>).', s: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
`, a: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
echo $buah[1];`, h: 'Indeks mulai dari 0, jadi elemen kedua = $buah[1].', need: [['\\$buah\\s*\\[\\s*1\\s*\\]', 'Ambil elemennya dari array, misalnya $buah[...].']] },
  { t: 'Tambahkan <code>"Pisang"</code> ke <code>$buah</code> dengan <code>[]</code>, lalu tampilkan <code>Jumlah buah: 4</code> pakai count.', s: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
`, a: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
$buah[] = "Pisang";
echo "Jumlah buah: " . count($buah);`, h: '$buah[] = "Pisang"; lalu echo "Jumlah buah: " . count($buah);', need: [['\\$buah\\s*\\[\\s*\\]\\s*=', 'Tambahkan pakai $buah[] = ...'], ['count\\s*\\(', 'Gunakan count().']] },
  { t: 'Pakai foreach untuk menampilkan daftar bernomor:<pre>1. Apel\n2. Jeruk\n3. Mangga</pre>', s: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
`, a: c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
$no = 1;
foreach ($buah as $b) {
    echo "$no. $b\n";
    $no++;
}`, h: 'Pakai variabel $no = 1 di luar foreach, lalu $no++ di dalamnya. Atau foreach ($buah as $i => $b) dan tampilkan $i + 1.', need: [['foreach', 'Gunakan foreach.']] }
]},
{ id: 'assoc', title: 'Array Asosiatif', steps: [
  { say: 'Array asosiatif memakai kunci (key) berupa teks, bukan nomor. Formatnya "kunci" => nilai.', code: c`<?php
$mhs = [
    "nama" => "Rina",
    "npm" => "12345678",
    "ipk" => 3.6,
];
echo $mhs["nama"];` },
  { say: 'foreach bisa mengambil kunci dan nilainya sekaligus: foreach ($array as $kunci => $nilai).', code: c`<?php
$stok = ["pensil" => 12, "buku" => 5];
foreach ($stok as $barang => $jumlah) {
    echo "$barang: $jumlah\n";
}` },
  { say: 'Mengubah atau menambah data juga lewat kuncinya.', code: c`<?php
$stok = ["pensil" => 12];
$stok["pensil"] = 10;   // ubah
$stok["penghapus"] = 4; // tambah
print_r($stok);` },
  { say: 'Cek apakah kunci ada dengan isset() atau array_key_exists(). Ini mencegah warning "Undefined array key".' }
], ex: [
  { t: 'Dari <code>$mhs</code>, tampilkan <code>Rina - Sistem Informasi</code> (ambil dari key nama dan jurusan).', s: c`<?php
$mhs = [
    "nama" => "Rina",
    "npm" => "12345678",
    "jurusan" => "Sistem Informasi",
];
`, a: c`<?php
$mhs = [
    "nama" => "Rina",
    "npm" => "12345678",
    "jurusan" => "Sistem Informasi",
];
echo $mhs["nama"] . " - " . $mhs["jurusan"];`, h: 'echo $mhs["nama"] . " - " . $mhs["jurusan"];', need: [['\\$mhs\\s*\\[\\s*["\']nama', 'Ambil dari $mhs["nama"].'], ['\\$mhs\\s*\\[\\s*["\']jurusan', 'Ambil dari $mhs["jurusan"].']] },
  { t: 'Pakai foreach dengan key dan value untuk menampilkan tiap data <code>$mhs</code> seperti <code>nama: Rina</code> (satu per baris).', s: c`<?php
$mhs = ["nama" => "Rina", "npm" => "12345678", "jurusan" => "Sistem Informasi"];
`, a: c`<?php
$mhs = ["nama" => "Rina", "npm" => "12345678", "jurusan" => "Sistem Informasi"];
foreach ($mhs as $key => $value) {
    echo "$key: $value\n";
}`, h: 'foreach ($mhs as $key => $value) { echo "$key: $value\n"; }', need: [['foreach[^)]*=>', 'Gunakan foreach ($mhs as $key => $value).']] },
  { t: 'Hitung total belanja dari <code>$belanja</code> (nama barang => harga) pakai foreach. Tampilkan <code>Total: 23000</code>', s: c`<?php
$belanja = ["Buku" => 15000, "Pulpen" => 3000, "Penggaris" => 5000];
$total = 0;
`, a: c`<?php
$belanja = ["Buku" => 15000, "Pulpen" => 3000, "Penggaris" => 5000];
$total = 0;
foreach ($belanja as $barang => $harga) {
    $total += $harga;
}
echo "Total: $total";`, h: 'Di dalam foreach: $total += $harga;', need: [['foreach', 'Gunakan foreach.']], vary: [{ belanja: '["Tas" => 120000, "Topi" => 45000]' }] }
]},
{ id: 'multi', title: 'Array Multidimensi', steps: [
  { say: 'Array bisa berisi array lain. Ini cara menyimpan data seperti tabel: tiap baris adalah satu array.', code: c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 92],
];
echo $kelas[1]["nama"];` },
  { say: 'Untuk menelusurinya, foreach biasanya mengambil satu baris, lalu kamu akses kolomnya dengan kunci.', code: c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 92],
];
foreach ($kelas as $siswa) {
    echo $siswa["nama"] . " dapat " . $siswa["nilai"] . "\n";
}` },
  { say: 'Ini bentuk data yang paling sering kamu temui nanti saat mengambil data dari database!' }
], ex: [
  { t: 'Tampilkan tiap baris <code>$data</code> dengan format <code>Andi: 80</code> (satu per baris).', s: c`<?php
$data = [
    ["Andi", 80],
    ["Budi", 90],
    ["Citra", 85],
];
`, a: c`<?php
$data = [
    ["Andi", 80],
    ["Budi", 90],
    ["Citra", 85],
];
foreach ($data as $baris) {
    echo $baris[0] . ": " . $baris[1] . "\n";
}`, h: 'Tiap $baris adalah array: nama di $baris[0], nilai di $baris[1].', need: [['foreach', 'Gunakan foreach.']] },
  { t: 'Hitung rata-rata nilai semua mahasiswa di <code>$kelas</code>. Tampilkan <code>Rata-rata: 85</code>', s: c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 90],
    ["nama" => "Caca", "nilai" => 85],
];
`, a: c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 90],
    ["nama" => "Caca", "nilai" => 85],
];
$total = 0;
foreach ($kelas as $mhs) {
    $total += $mhs["nilai"];
}
echo "Rata-rata: " . ($total / count($kelas));`, h: 'Jumlahkan $mhs["nilai"] di foreach, lalu bagi dengan count($kelas).', need: [['foreach|array_column|array_sum', 'Hitung dari datanya, jangan ditulis langsung.']], vary: [{ kelas: '[["nama" => "X", "nilai" => 70], ["nama" => "Y", "nilai" => 90]]' }] },
  { t: 'Tampilkan hanya nama mahasiswa yang nilainya <b>di atas 80</b>, satu per baris.', s: c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 78],
    ["nama" => "Bela", "nilai" => 91],
    ["nama" => "Caca", "nilai" => 85],
    ["nama" => "Dodi", "nilai" => 60],
];
`, a: c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 78],
    ["nama" => "Bela", "nilai" => 91],
    ["nama" => "Caca", "nilai" => 85],
    ["nama" => "Dodi", "nilai" => 60],
];
foreach ($kelas as $mhs) {
    if ($mhs["nilai"] > 80) {
        echo $mhs["nama"] . "\n";
    }
}`, h: 'Gabungkan foreach dengan if ($mhs["nilai"] > 80).', need: [['if|array_filter', 'Pakai if untuk menyaring.']], vary: [{ kelas: '[["nama" => "Eko", "nilai" => 81], ["nama" => "Fani", "nilai" => 80]]' }] }
]}
]},
{ id: 'menara', name: 'Menara Fungsi', biome: 'menara', blurb: 'Fungsi bawaan PHP dan membuat fungsi sendiri.', lessons: [
{ id: 'bawaan', title: 'Fungsi Bawaan', steps: [
  { say: 'PHP punya ribuan fungsi siap pakai. Kamu sudah kenal strlen dan count. Sekarang kenalan dengan yang lain.' },
  { say: 'explode() memecah string jadi array. implode() menggabung array jadi string.', code: c`<?php
$csv = "nasi,ayam,sambal";
$isi = explode(",", $csv);
print_r($isi);
echo implode(" + ", $isi);` },
  { say: 'sort() mengurutkan kecil ke besar, rsort() sebaliknya. array_sum(), max(), min() langsung menghitung.', code: c`<?php
$angka = [7, 2, 9, 4];
sort($angka);
echo implode(", ", $angka), "\n";
echo "Jumlah: " . array_sum($angka) . "\n";
echo "Terbesar: " . max($angka);` },
  { say: 'str_replace() mengganti kata, in_array() mengecek isi array, ucwords() mengkapitalkan tiap kata.', code: c`<?php
echo str_replace("kopi", "teh", "saya suka kopi"), "\n";
var_dump(in_array("teh", ["kopi", "teh"]));
echo ucwords("belajar php itu seru");` }
], ex: [
  { t: 'Ubah <code>$kalimat</code> supaya setiap kata diawali huruf besar: <code>Saya Suka Belajar Php</code>', s: c`<?php
$kalimat = "saya suka belajar php";
`, a: c`<?php
$kalimat = "saya suka belajar php";
echo ucwords($kalimat);`, h: 'Ada fungsi bawaan yang namanya mirip "uppercase words".', need: [['ucwords', 'Gunakan ucwords().']], vary: [{ kalimat: '"halo dunia"' }] },
  { t: 'Urutkan <code>$angka</code> dari kecil ke besar, lalu tampilkan dengan pemisah koma-spasi: <code>1, 3, 5, 9</code>', s: c`<?php
$angka = [5, 3, 9, 1];
`, a: c`<?php
$angka = [5, 3, 9, 1];
sort($angka);
echo implode(", ", $angka);`, h: 'sort($angka); lalu echo implode(", ", $angka);', need: [['sort\\s*\\(', 'Gunakan sort().'], ['implode|join', 'Gunakan implode() untuk menggabungkan.']], vary: [{ angka: '[42, 8, 15, 4, 23, 16]' }] },
  { t: 'Pecah <code>$warna</code> dengan explode, lalu tampilkan <code>Ada 3 warna, yang kedua: kuning</code>', s: c`<?php
$warna = "merah,kuning,hijau";
`, a: c`<?php
$warna = "merah,kuning,hijau";
$daftar = explode(",", $warna);
echo "Ada " . count($daftar) . " warna, yang kedua: " . $daftar[1];`, h: '$daftar = explode(",", $warna); lalu pakai count($daftar) dan $daftar[1].', need: [['explode', 'Gunakan explode().']], vary: [{ warna: '"biru,ungu,oranye,hitam"' }] }
]},
{ id: 'fungsi', title: 'Membuat Fungsi', steps: [
  { say: 'Fungsi = kumpulan kode yang diberi nama, bisa dipanggil berulang kali. Ditulis dengan kata kunci function.', code: c`<?php
function salam() {
    echo "Selamat datang!\n";
}
salam();
salam();` },
  { say: 'Fungsi bisa menerima input lewat parameter.', code: c`<?php
function sapa($nama) {
    echo "Halo, $nama!\n";
}
sapa("Dewi");
sapa("Eko");` },
  { say: 'return mengembalikan hasil supaya bisa disimpan atau diolah lagi. Bedanya dengan echo: echo menampilkan, return mengembalikan nilai.', code: c`<?php
function kuadrat($x) {
    return $x * $x;
}
$hasil = kuadrat(6);
echo $hasil + 1;` },
  { say: 'Fungsi juga bisa mengembalikan true/false. Biasanya diberi nama awalan is atau cek.', code: c`<?php
function isDewasa($umur) {
    return $umur >= 17;
}
echo isDewasa(20) ? "Dewasa" : "Belum";` }
], ex: [
  { t: 'Buat fungsi <code>sapa($nama)</code> yang <b>mengembalikan</b> (return) <code>"Halo, $nama!"</code>. Lalu tampilkan <code>sapa("Dewi")</code>.', s: c`<?php
// buat fungsi sapa di sini

echo sapa("Dewi");`, a: c`<?php
function sapa($nama) {
    return "Halo, $nama!";
}

echo sapa("Dewi");`, h: 'function sapa($nama) { return "Halo, $nama!"; }', need: [['function\\s+sapa', 'Buat fungsi bernama sapa.'], ['return', 'Gunakan return, bukan echo, di dalam fungsi.']] },
  { t: 'Buat fungsi <code>luasLingkaran($r)</code> yang mengembalikan <code>3.14 * r * r</code> dibulatkan 2 desimal (round). <code>echo luasLingkaran(7);</code> harus tampil <code>153.86</code>', s: c`<?php

echo luasLingkaran(7);`, a: c`<?php
function luasLingkaran($r) {
    return round(3.14 * $r * $r, 2);
}
echo luasLingkaran(7);`, h: 'return round(3.14 * $r * $r, 2);', need: [['function\\s+luasLingkaran', 'Buat fungsi bernama luasLingkaran.'], ['return', 'Gunakan return.']] },
  { t: 'Buat fungsi <code>isPrima($n)</code> yang mengembalikan true jika bilangan prima. Lalu tampilkan semua bilangan prima 1–20 dipisah spasi.', s: c`<?php
function isPrima($n) {
    // tulis di sini
}

for ($i = 1; $i <= 20; $i++) {
    if (isPrima($i)) {
        echo $i . " ";
    }
}`, a: c`<?php
function isPrima($n) {
    if ($n < 2) {
        return false;
    }
    for ($d = 2; $d * $d <= $n; $d++) {
        if ($n % $d == 0) {
            return false;
        }
    }
    return true;
}

for ($i = 1; $i <= 20; $i++) {
    if (isPrima($i)) {
        echo $i . " ";
    }
}`, h: 'Angka < 2 bukan prima. Coba bagi $n dengan 2, 3, 4, ... — kalau ada yang sisa baginya 0, bukan prima.', need: [['function\\s+isPrima', 'Buat fungsi isPrima.'], ['return\\s+true', 'Fungsi harus return true untuk bilangan prima.']] }
]},
{ id: 'lanjut', title: 'Default, Rekursi & Arrow', steps: [
  { say: 'Parameter bisa diberi nilai default. Kalau tidak diisi saat dipanggil, nilai default yang dipakai.', code: c`<?php
function pesan($menu, $level = "sedang") {
    return "$menu pedas $level";
}
echo pesan("Seblak"), "\n";
echo pesan("Seblak", "gila");` },
  { say: 'Rekursi = fungsi yang memanggil dirinya sendiri. Wajib ada kondisi berhenti (base case), kalau tidak dia jalan selamanya.', code: c`<?php
function hitungMundur($n) {
    if ($n == 0) {
        echo "Selesai!";
        return;
    }
    echo "$n ";
    hitungMundur($n - 1);
}
hitungMundur(5);` },
  { say: 'Arrow function fn($x) => ... adalah fungsi mini satu baris. Sering dipakai bersama array_map (ubah tiap elemen) dan array_filter (saring elemen).', code: c`<?php
$harga = [10000, 25000, 40000];
$diskon = array_map(fn($h) => $h * 0.9, $harga);
print_r($diskon);
$mahal = array_filter($harga, fn($h) => $h > 20000);
print_r($mahal);` }
], ex: [
  { t: 'Buat fungsi <code>diskon($harga, $persen = 10)</code> yang mengembalikan harga setelah diskon. Tampilkan <code>diskon(50000)</code> lalu <code>diskon(50000, 25)</code> di baris berbeda:<pre>45000\n37500</pre>', s: c`<?php

echo diskon(50000), "\n";
echo diskon(50000, 25);`, a: c`<?php
function diskon($harga, $persen = 10) {
    return $harga - ($harga * $persen / 100);
}
echo diskon(50000), "\n";
echo diskon(50000, 25);`, h: 'return $harga - ($harga * $persen / 100);', need: [['\\$persen\\s*=\\s*10', 'Beri nilai default: $persen = 10.']] },
  { t: 'Buat fungsi <b>rekursif</b> <code>faktorial($n)</code>. Faktorial 6 = 6×5×4×3×2×1. <code>echo faktorial(6);</code> → <code>720</code>', s: c`<?php

echo faktorial(6);`, a: c`<?php
function faktorial($n) {
    if ($n <= 1) {
        return 1;
    }
    return $n * faktorial($n - 1);
}
echo faktorial(6);`, h: 'Base case: jika $n <= 1 return 1. Selain itu return $n * faktorial($n - 1);', need: [['function\\s+faktorial[\\s\\S]*faktorial\\s*\\([\\s\\S]*faktorial\\s*\\(', 'faktorial() harus memanggil dirinya sendiri (rekursif).']] },
  { t: 'Pakai <code>array_filter</code> dengan arrow function untuk mengambil bilangan genap dari <code>$angka</code>, lalu tampilkan dipisah spasi: <code>2 4 6 8 10</code>', s: c`<?php
$angka = range(1, 10);
`, a: c`<?php
$angka = range(1, 10);
$genap = array_filter($angka, fn($x) => $x % 2 == 0);
echo implode(" ", $genap);`, h: '$genap = array_filter($angka, fn($x) => $x % 2 == 0);', need: [['array_filter', 'Gunakan array_filter().'], ['fn\\s*\\(|function\\s*\\(', 'Gunakan arrow function fn($x) => ...']] }
]}
]},
{ id: 'kastil', name: 'Kastil OOP', biome: 'kastil', blurb: 'Class, object, enkapsulasi, pewarisan, dan exception.', lessons: [
{ id: 'class', title: 'Class & Object', steps: [
  { say: 'Selamat datang di kastil! OOP (Object Oriented Programming) adalah cara menyusun kode berdasarkan "benda".' },
  { say: 'Class itu cetakan, object itu hasil cetakannya. Class Mobil adalah desainnya; mobil Toyota merahmu adalah object-nya.', code: c`<?php
class Mobil {
    public $merk;
    public $warna;

    public function klakson() {
        return "Tin tin!";
    }
}

$mobilku = new Mobil();
$mobilku->merk = "Toyota";
echo $mobilku->merk . ": " . $mobilku->klakson();` },
  { say: 'Di dalam method, $this artinya "object ini". Dipakai untuk mengakses property milik object itu sendiri.' },
  { say: '__construct() adalah method spesial yang otomatis jalan saat object dibuat dengan new. Cocok untuk mengisi data awal.', code: c`<?php
class Kucing {
    public $nama;

    public function __construct($nama) {
        $this->nama = $nama;
    }

    public function meong() {
        return "{$this->nama} bilang meong!";
    }
}

$k = new Kucing("Oyen");
echo $k->meong();` }
], ex: [
  { t: 'Lengkapi method <code>info()</code> agar mengembalikan <code>Mobil Toyota warna Merah</code> memakai <code>$this</code>.', s: c`<?php
class Mobil {
    public $merk;
    public $warna;

    public function info() {
        // return di sini
    }
}

$m = new Mobil();
$m->merk = "Toyota";
$m->warna = "Merah";
echo $m->info();`, a: c`<?php
class Mobil {
    public $merk;
    public $warna;

    public function info() {
        return "Mobil $this->merk warna $this->warna";
    }
}

$m = new Mobil();
$m->merk = "Toyota";
$m->warna = "Merah";
echo $m->info();`, h: 'return "Mobil " . $this->merk . " warna " . $this->warna;', need: [['\\$this->', 'Gunakan $this->merk dan $this->warna.']] },
  { t: 'Buat class <code>Mahasiswa</code> dengan constructor <code>($nama, $npm)</code> dan method <code>perkenalan()</code> yang mengembalikan <code>Halo, saya Rina (NPM 12345678)</code>.', s: c`<?php
// buat class Mahasiswa

$mhs = new Mahasiswa("Rina", "12345678");
echo $mhs->perkenalan();`, a: c`<?php
class Mahasiswa {
    public $nama;
    public $npm;

    public function __construct($nama, $npm) {
        $this->nama = $nama;
        $this->npm = $npm;
    }

    public function perkenalan() {
        return "Halo, saya {$this->nama} (NPM {$this->npm})";
    }
}

$mhs = new Mahasiswa("Rina", "12345678");
echo $mhs->perkenalan();`, h: 'Di __construct isi $this->nama = $nama; dan $this->npm = $npm;', need: [['class\\s+Mahasiswa', 'Buat class Mahasiswa.'], ['__construct', 'Gunakan constructor __construct.']] },
  { t: 'Class <code>Lampu</code> punya property <b>private</b> <code>$nyala = false</code>. Buat method <code>nyalakan()</code> dan <code>status()</code> (mengembalikan "Lampu nyala"/"Lampu mati"). Output:<pre>Lampu mati\nLampu nyala</pre>', s: c`<?php
class Lampu {
    // property dan method di sini
}

$l = new Lampu();
echo $l->status(), "\n";
$l->nyalakan();
echo $l->status();`, a: c`<?php
class Lampu {
    private $nyala = false;

    public function nyalakan() {
        $this->nyala = true;
    }

    public function status() {
        return $this->nyala ? "Lampu nyala" : "Lampu mati";
    }
}

$l = new Lampu();
echo $l->status(), "\n";
$l->nyalakan();
echo $l->status();`, h: 'private $nyala = false; nyalakan() mengubah $this->nyala = true;', need: [['private\\s+\\$nyala', 'Property $nyala harus private.']] }
]},
{ id: 'enkap', title: 'Enkapsulasi & Static', steps: [
  { say: 'public bisa diakses dari mana saja. private hanya dari dalam class itu. Gunanya melindungi data dari perubahan sembarangan.', code: c`<?php
class Dompet {
    private $isi = 0;

    public function tambah($uang) {
        if ($uang > 0) {
            $this->isi += $uang;
        }
    }

    public function getIsi() {
        return $this->isi;
    }
}
$d = new Dompet();
$d->tambah(20000);
echo $d->getIsi();
// $d->isi = 999999; // ini akan error!` },
  { say: 'Method seperti getIsi() disebut getter. Data diakses lewat method, jadi kamu bisa menambah aturan (validasi).' },
  { say: 'static = milik class, bukan milik object. Diakses dengan NamaClass::$prop atau self::$prop di dalam class.', code: c`<?php
class Tiket {
    public static $terjual = 0;

    public function __construct() {
        self::$terjual++;
    }
}
new Tiket();
new Tiket();
echo "Tiket terjual: " . Tiket::$terjual;` }
], ex: [
  { t: 'Lengkapi class <code>Rekening</code>: <code>setor($n)</code>, <code>tarik($n)</code> (jika saldo kurang, echo <code>Saldo tidak cukup</code> + baris baru dan jangan kurangi), dan <code>getSaldo()</code>.', s: c`<?php
class Rekening {
    private $saldo = 0;

    // buat method setor, tarik, getSaldo
}

$r = new Rekening();
$r->setor(100000);
$r->tarik(30000);
$r->tarik(500000);
echo "Saldo: " . $r->getSaldo();`, a: c`<?php
class Rekening {
    private $saldo = 0;

    public function setor($n) {
        $this->saldo += $n;
    }

    public function tarik($n) {
        if ($n > $this->saldo) {
            echo "Saldo tidak cukup\n";
            return;
        }
        $this->saldo -= $n;
    }

    public function getSaldo() {
        return $this->saldo;
    }
}

$r = new Rekening();
$r->setor(100000);
$r->tarik(30000);
$r->tarik(500000);
echo "Saldo: " . $r->getSaldo();`, h: 'Di tarik(): if ($n > $this->saldo) { echo "Saldo tidak cukup\n"; return; }', need: [['private\\s+\\$saldo', 'Biarkan $saldo tetap private.']] },
  { t: 'Buat class <code>Pengunjung</code> dengan property <b>static</b> <code>$jumlah</code> yang bertambah setiap object dibuat. Setelah 3 object: <code>Total pengunjung: 3</code>', s: c`<?php
class Pengunjung {
    // static property + constructor
}

new Pengunjung();
new Pengunjung();
new Pengunjung();
echo "Total pengunjung: " . Pengunjung::$jumlah;`, a: c`<?php
class Pengunjung {
    public static $jumlah = 0;

    public function __construct() {
        self::$jumlah++;
    }
}

new Pengunjung();
new Pengunjung();
new Pengunjung();
echo "Total pengunjung: " . Pengunjung::$jumlah;`, h: 'public static $jumlah = 0; dan di __construct: self::$jumlah++;', need: [['static\\s+\\$jumlah', 'Buat property static $jumlah.']] }
]},
{ id: 'waris', title: 'Pewarisan & Exception', steps: [
  { say: 'Pewarisan (inheritance): class anak mewarisi semua isi class induk lewat extends. Anak bisa menimpa (override) method induk.', code: c`<?php
class Hewan {
    protected $nama;
    public function __construct($nama) {
        $this->nama = $nama;
    }
    public function suara() {
        return "...";
    }
    public function bicara() {
        return "{$this->nama}: " . $this->suara();
    }
}
class Bebek extends Hewan {
    public function suara() {
        return "Kwek!";
    }
}
$b = new Bebek("Donal");
echo $b->bicara();` },
  { say: 'protected mirip private, tapi masih bisa diakses class anak. parent:: dipakai untuk memanggil method milik induk.', code: c`<?php
class Pegawai {
    public function __construct(protected $nama) {}
}
class Dosen extends Pegawai {
    public function __construct($nama, private $matkul) {
        parent::__construct($nama);
    }
    public function info() {
        return "{$this->nama} mengajar {$this->matkul}";
    }
}
echo (new Dosen("Pak Budi", "Basis Data"))->info();` },
  { say: 'Exception untuk menangani error dengan rapi. throw melempar error, try...catch menangkapnya supaya program tidak mati.', code: c`<?php
function cekUmur($umur) {
    if ($umur < 0) {
        throw new Exception("Umur tidak boleh negatif");
    }
    return "Umur valid";
}
try {
    echo cekUmur(-5);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}` }
], ex: [
  { t: 'Buat class <code>Kucing</code> dan <code>Anjing</code> yang <b>extends</b> <code>Hewan</code>, masing-masing override <code>suara()</code> jadi <code>Meong</code> dan <code>Guk guk</code>. Output:<pre>Oyen berkata Meong\nBlacky berkata Guk guk</pre>', s: c`<?php
class Hewan {
    protected $nama;
    public function __construct($nama) {
        $this->nama = $nama;
    }
    public function suara() {
        return "...";
    }
    public function perkenalan() {
        return "{$this->nama} berkata " . $this->suara();
    }
}

// buat class Kucing dan Anjing

echo (new Kucing("Oyen"))->perkenalan(), "\n";
echo (new Anjing("Blacky"))->perkenalan();`, a: c`<?php
class Hewan {
    protected $nama;
    public function __construct($nama) {
        $this->nama = $nama;
    }
    public function suara() {
        return "...";
    }
    public function perkenalan() {
        return "{$this->nama} berkata " . $this->suara();
    }
}

class Kucing extends Hewan {
    public function suara() {
        return "Meong";
    }
}

class Anjing extends Hewan {
    public function suara() {
        return "Guk guk";
    }
}

echo (new Kucing("Oyen"))->perkenalan(), "\n";
echo (new Anjing("Blacky"))->perkenalan();`, h: 'class Kucing extends Hewan { public function suara() { return "Meong"; } }', need: [['extends\\s+Hewan[\\s\\S]*extends\\s+Hewan', 'Kedua class harus extends Hewan.']] },
  { t: 'Class <code>Manajer</code> extends <code>Karyawan</code>, punya tambahan <code>$tunjangan</code>. Constructor-nya memanggil <code>parent::__construct</code>. Method <code>totalGaji()</code> = gaji + tunjangan. Output: <code>Total gaji Sari: 12000000</code>', s: c`<?php
class Karyawan {
    protected $nama;
    protected $gaji;
    public function __construct($nama, $gaji) {
        $this->nama = $nama;
        $this->gaji = $gaji;
    }
}

// buat class Manajer

$m = new Manajer("Sari", 9000000, 3000000);
echo "Total gaji Sari: " . $m->totalGaji();`, a: c`<?php
class Karyawan {
    protected $nama;
    protected $gaji;
    public function __construct($nama, $gaji) {
        $this->nama = $nama;
        $this->gaji = $gaji;
    }
}

class Manajer extends Karyawan {
    private $tunjangan;
    public function __construct($nama, $gaji, $tunjangan) {
        parent::__construct($nama, $gaji);
        $this->tunjangan = $tunjangan;
    }
    public function totalGaji() {
        return $this->gaji + $this->tunjangan;
    }
}

$m = new Manajer("Sari", 9000000, 3000000);
echo "Total gaji Sari: " . $m->totalGaji();`, h: 'Di constructor Manajer: parent::__construct($nama, $gaji); lalu $this->tunjangan = $tunjangan;', need: [['parent::__construct', 'Panggil parent::__construct.']] },
  { t: 'Fungsi <code>bagi($a, $b)</code> harus <b>throw Exception</b> berpesan <code>Tidak bisa dibagi nol</code> jika $b = 0. Tangkap dengan try/catch. Output:<pre>Hasil: 5\nError: Tidak bisa dibagi nol</pre>', s: c`<?php
function bagi($a, $b) {
    // tulis di sini
}

try {
    echo "Hasil: " . bagi(10, 2) . "\n";
    echo "Hasil: " . bagi(10, 0) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}`, a: c`<?php
function bagi($a, $b) {
    if ($b == 0) {
        throw new Exception("Tidak bisa dibagi nol");
    }
    return $a / $b;
}

try {
    echo "Hasil: " . bagi(10, 2) . "\n";
    echo "Hasil: " . bagi(10, 0) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}`, h: 'if ($b == 0) { throw new Exception("Tidak bisa dibagi nol"); } return $a / $b;', need: [['throw\\s+new', 'Gunakan throw new Exception(...).']] }
]}
]},
{ id: 'arena', name: 'Arena Bos', biome: 'arena', blurb: 'Tantangan campuran. Kalahkan semua bos untuk jadi Master PHP!', boss: true, lessons: [
{ id: 'bos1', title: 'Bos: Logika Klasik', steps: [
  { say: 'Ini arena bos! Di sini tidak ada materi baru. Kamu harus menggabungkan semua yang sudah dipelajari.' },
  { say: 'Bacalah soal pelan-pelan, uraikan langkahnya, dan pakai var_dump kalau bingung. Semangat, aku percaya kamu bisa!' }
], ex: [
  { t: '<b>FizzBuzz</b>: untuk 1 sampai <code>$n</code>, tampilkan <code>FizzBuzz</code> jika habis dibagi 3 dan 5, <code>Fizz</code> jika habis dibagi 3, <code>Buzz</code> jika habis dibagi 5, selain itu angkanya. Satu per baris.', s: c`<?php
$n = 15;
`, a: c`<?php
$n = 15;
for ($i = 1; $i <= $n; $i++) {
    if ($i % 15 == 0) {
        echo "FizzBuzz\n";
    } elseif ($i % 3 == 0) {
        echo "Fizz\n";
    } elseif ($i % 5 == 0) {
        echo "Buzz\n";
    } else {
        echo "$i\n";
    }
}`, h: 'Cek kondisi "habis dibagi 3 DAN 5" paling dulu, baru 3, lalu 5.', need: [['for|while', 'Gunakan perulangan.']], vary: [{ n: '20' }] },
  { t: 'Deret <b>Fibonacci</b>: tampilkan <code>$n</code> suku pertama dipisah spasi. Untuk 10: <code>0 1 1 2 3 5 8 13 21 34</code>', s: c`<?php
$n = 10;
`, a: c`<?php
$n = 10;
$a = 0;
$b = 1;
for ($i = 0; $i < $n; $i++) {
    echo $a . " ";
    $c = $a + $b;
    $a = $b;
    $b = $c;
}`, h: 'Simpan dua angka terakhir ($a dan $b). Suku berikutnya = $a + $b.', need: [['for|while', 'Gunakan perulangan.']], vary: [{ n: '15' }, { n: '1' }] },
  { t: '<b>Palindrom</b>: buat fungsi <code>isPalindrom($kata)</code>. Untuk setiap kata di <code>$kata</code> tampilkan <code>katak: palindrom</code> atau <code>makan: bukan</code>.', s: c`<?php
$kata = ["katak", "makan", "level", "kodok", "php"];
`, a: c`<?php
$kata = ["katak", "makan", "level", "kodok", "php"];
function isPalindrom($k) {
    return $k == strrev($k);
}
foreach ($kata as $k) {
    echo $k . ": " . (isPalindrom($k) ? "palindrom" : "bukan") . "\n";
}`, h: 'Kata palindrom sama dengan kebalikannya: $k == strrev($k)', need: [['function\\s+isPalindrom', 'Buat fungsi isPalindrom.']], vary: [{ kata: '["malam", "siang", "kasur rusak", "ada"]' }] }
]},
{ id: 'bos2', title: 'Bos: Olah Teks', steps: [
  { say: 'Bos kedua menguji kemampuan mengolah string dan array. Ingat fungsi-fungsi dari Menara Fungsi!' }
], ex: [
  { t: 'Hitung jumlah huruf vokal (a, i, u, e, o — besar maupun kecil) di <code>$teks</code>. Tampilkan <code>Jumlah vokal: 6</code>', s: c`<?php
$teks = "Sistem Informasi";
`, a: c`<?php
$teks = "Sistem Informasi";
$vokal = 0;
$huruf = str_split(strtolower($teks));
foreach ($huruf as $h) {
    if (in_array($h, ["a", "i", "u", "e", "o"])) {
        $vokal++;
    }
}
echo "Jumlah vokal: $vokal";`, h: 'Ubah ke huruf kecil, pecah per huruf dengan str_split, lalu cek in_array tiap huruf.', need: [['for|while|array_|preg_match_all|substr_count', 'Hitung pakai perulangan atau fungsi, bukan ditulis langsung.']], vary: [{ teks: '"UNIVERSITAS GUNADARMA"' }, { teks: '"PHP"' }] },
  { t: 'Balik <b>urutan kata</b> dalam <code>$kalimat</code>: <code>aku suka belajar php</code> → <code>php belajar suka aku</code>', s: c`<?php
$kalimat = "aku suka belajar php";
`, a: c`<?php
$kalimat = "aku suka belajar php";
echo implode(" ", array_reverse(explode(" ", $kalimat)));`, h: 'explode jadi array kata → array_reverse → implode lagi.', need: [['explode|str_word_count|preg_split', 'Pecah kalimat jadi kata-kata dulu.']], vary: [{ kalimat: '"satu dua tiga"' }] },
  { t: 'Hitung berapa kali tiap kata muncul di <code>$teks</code>, lalu tampilkan urut sesuai kemunculan pertama, format <code>kata: jumlah</code>.', s: c`<?php
$teks = "ayam goreng ayam bakar ikan goreng ayam";
`, a: c`<?php
$teks = "ayam goreng ayam bakar ikan goreng ayam";
$hitung = [];
foreach (explode(" ", $teks) as $kata) {
    if (isset($hitung[$kata])) {
        $hitung[$kata]++;
    } else {
        $hitung[$kata] = 1;
    }
}
foreach ($hitung as $kata => $jml) {
    echo "$kata: $jml\n";
}`, h: 'Pakai array asosiatif $hitung[$kata]. Kalau belum ada isi 1, kalau sudah ada tambah 1. Atau pakai array_count_values.', need: [['explode|str_word_count|preg_split', 'Pecah kalimat jadi kata-kata dulu.']], vary: [{ teks: '"es teh es jeruk es"' }] }
]},
{ id: 'bos3', title: 'Bos: Aplikasi Kasir', steps: [
  { say: 'Bos terakhir! Kita bikin logika aplikasi kasir dan sistem nilai, seperti proyek web sungguhan.' },
  { say: 'Petunjuk: number_format($angka, 0, ",", ".") mengubah 125000 jadi 125.000 — cocok untuk menampilkan Rupiah.', code: c`<?php
echo "Rp " . number_format(1250000, 0, ",", ".");` }
], ex: [
  { t: 'Hitung total <code>$keranjang</code> (harga × qty). Jika total lebih dari 100.000 dapat diskon 10%. Tampilkan:<pre>Subtotal: Rp 135.000\nDiskon: Rp 13.500\nTotal: Rp 121.500</pre>', s: c`<?php
$keranjang = [
    ["nama" => "Kaos", "harga" => 45000, "qty" => 2],
    ["nama" => "Topi", "harga" => 30000, "qty" => 1],
    ["nama" => "Stiker", "harga" => 5000, "qty" => 3],
];
`, a: c`<?php
$keranjang = [
    ["nama" => "Kaos", "harga" => 45000, "qty" => 2],
    ["nama" => "Topi", "harga" => 30000, "qty" => 1],
    ["nama" => "Stiker", "harga" => 5000, "qty" => 3],
];
function rp($n) {
    return "Rp " . number_format($n, 0, ",", ".");
}
$subtotal = 0;
foreach ($keranjang as $item) {
    $subtotal += $item["harga"] * $item["qty"];
}
$diskon = $subtotal > 100000 ? $subtotal * 0.1 : 0;
echo "Subtotal: " . rp($subtotal) . "\n";
echo "Diskon: " . rp($diskon) . "\n";
echo "Total: " . rp($subtotal - $diskon);`, h: 'Jumlahkan harga*qty di foreach. Diskon = subtotal > 100000 ? subtotal * 0.1 : 0. Format dengan number_format.', need: [['foreach|array_', 'Hitung dari data keranjang.'], ['number_format', 'Gunakan number_format untuk format Rupiah.']], vary: [{ keranjang: '[["nama" => "Pulpen", "harga" => 3000, "qty" => 10]]' }] },
  { t: 'Urutkan <code>$mhs</code> berdasarkan nilai tertinggi (pakai <code>usort</code>), lalu tampilkan peringkat: <code>1. Bela (91) - A</code>. Grade: 85+ A, 70+ B, 55+ C, sisanya D.', s: c`<?php
$mhs = [
    ["nama" => "Andi", "nilai" => 72],
    ["nama" => "Bela", "nilai" => 91],
    ["nama" => "Caca", "nilai" => 85],
    ["nama" => "Dodi", "nilai" => 50],
];
`, a: c`<?php
$mhs = [
    ["nama" => "Andi", "nilai" => 72],
    ["nama" => "Bela", "nilai" => 91],
    ["nama" => "Caca", "nilai" => 85],
    ["nama" => "Dodi", "nilai" => 50],
];
function grade($n) {
    if ($n >= 85) return "A";
    if ($n >= 70) return "B";
    if ($n >= 55) return "C";
    return "D";
}
usort($mhs, fn($a, $b) => $b["nilai"] <=> $a["nilai"]);
foreach ($mhs as $i => $m) {
    echo ($i + 1) . ". {$m["nama"]} ({$m["nilai"]}) - " . grade($m["nilai"]) . "\n";
}`, h: 'usort($mhs, fn($a, $b) => $b["nilai"] <=> $a["nilai"]); — operator <=> membandingkan dua nilai.', need: [['usort', 'Gunakan usort().']], vary: [{ mhs: '[["nama" => "Xena", "nilai" => 60], ["nama" => "Yudi", "nilai" => 88]]' }] },
  { t: '<b>Bos Final OOP</b>: buat class <code>Produk</code> (nama, harga) dan class <code>Keranjang</code> dengan method <code>tambah(Produk $p, $qty)</code>, <code>total()</code>, dan <code>jumlahItem()</code>. Output:<pre>Item: 3\nTotal: 85000</pre>', s: c`<?php
// buat class Produk dan Keranjang

$k = new Keranjang();
$k->tambah(new Produk("Buku", 25000), 2);
$k->tambah(new Produk("Pensil", 5000), 3);
$k->tambah(new Produk("Tas", 20000), 1);
echo "Item: " . $k->jumlahItem() . "\n";
echo "Total: " . $k->total();`, a: c`<?php
class Produk {
    public function __construct(public $nama, public $harga) {}
}

class Keranjang {
    private $isi = [];

    public function tambah(Produk $p, $qty) {
        $this->isi[] = ["produk" => $p, "qty" => $qty];
    }

    public function jumlahItem() {
        return count($this->isi);
    }

    public function total() {
        $t = 0;
        foreach ($this->isi as $baris) {
            $t += $baris["produk"]->harga * $baris["qty"];
        }
        return $t;
    }
}

$k = new Keranjang();
$k->tambah(new Produk("Buku", 25000), 2);
$k->tambah(new Produk("Pensil", 5000), 3);
$k->tambah(new Produk("Tas", 20000), 1);
echo "Item: " . $k->jumlahItem() . "\n";
echo "Total: " . $k->total();`, h: 'Keranjang menyimpan array berisi ["produk" => $p, "qty" => $qty]. total() menjumlahkan harga * qty.', need: [['class\\s+Produk', 'Buat class Produk.'], ['class\\s+Keranjang', 'Buat class Keranjang.']] }
]}
]}
];
if (typeof module !== 'undefined') module.exports = WORLDS;
