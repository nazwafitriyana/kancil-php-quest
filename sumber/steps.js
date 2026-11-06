// Materi lengkap per pelajaran. S = Kancil bicara (+ contoh kode + catatan), Q = kuis kecil.
const S = (say, code, note) => ({ say, code, note });
const Q = (q, o, a, why) => ({ say: q, quiz: { o, a, why } });
const STEPS = {
halo: [
  S('Halo, petualang! Aku Kancil, pemandumu di dunia PHP. Tenang, kita mulai dari nol banget. Aku akan jelaskan pelan-pelan, lalu kamu praktik sendiri.'),
  S('PHP adalah bahasa pemrograman untuk membuat website yang "hidup". Contohnya: menampilkan nama user yang login, menghitung total belanja, atau mengambil data mahasiswa dari database.'),
  S('Setiap kode PHP diawali tanda pembuka <?php. Semua yang ditulis setelah tanda itu dibaca PHP sebagai perintah.', c`<?php
// kode PHP dimulai di sini`, 'Tanda <code>&lt;?php</code> selalu ada di baris paling atas. Di semua latihan, tanda ini sudah aku siapkan.'),
  S('PHP juga punya tanda penutup ?>. Fungsinya menandai bagian PHP selesai, supaya setelahnya bisa ditulis HTML biasa.', c`<h1>Daftar Menu</h1>
<p>Menu hari ini: <?php echo "Nasi goreng"; ?></p>
<p>Harga: <?php echo 15000; ?></p>`, 'Di sini <code>?&gt;</code> <b>wajib</b>, karena setelah kode PHP masih ada HTML (<code>&lt;/p&gt;</code>). Klik tombol <b>HTML</b> di kotak Output untuk melihatnya sebagai halaman web.'),
  S('Tapi kalau isi file SELURUHNYA kode PHP, tanda ?> di akhir file boleh tidak ditulis. Malah standar PHP (PSR-12) menyarankan tidak ditulis, karena spasi atau baris kosong yang tidak sengaja ada setelah ?> bisa ikut terkirim ke browser dan menimbulkan error.', c`<?php
echo "Pakai penutup";
?>`, 'Kedua gaya sama-sama benar dan hasilnya sama. Di game ini contoh-contohnya ditulis tanpa <code>?&gt;</code> mengikuti standar tadi, tapi kalau kamu menulis <code>?&gt;</code> di akhir, jawabanmu tetap dinilai benar.'),
  Q('Kapan tanda penutup ?> WAJIB ditulis?', ['Di akhir setiap file PHP', 'Kalau setelah kode PHP masih ada HTML', 'Setiap habis satu echo'], 1, 'Betul! Kalau file isinya PHP semua, ?> di akhir boleh dihilangkan. Kalau setelahnya masih ada HTML, ?> wajib.'),
  S('Perintah pertama yang wajib kamu kenal: echo. Artinya "tampilkan ke layar". Teks yang mau ditampilkan diapit tanda kutip.', c`<?php
echo "Halo, Dunia!";`, 'Bagian-bagiannya:<br><code>echo</code> = perintah tampilkan<br><code>"Halo, Dunia!"</code> = teks yang ditampilkan (di pemrograman disebut <b>string</b>)<br><code>;</code> = tanda bahwa perintah sudah selesai'),
  Q('Coba jawab: tanda apa yang wajib ada di akhir setiap perintah PHP?', ['Titik ( . )', 'Titik koma ( ; )', 'Koma ( , )'], 1, 'Betul, titik koma ; menandakan satu perintah selesai. Mirip titik di akhir kalimat.'),
  S('Teks boleh diapit kutip ganda "..." atau kutip tunggal \'...\'. Untuk teks biasa, hasilnya sama saja.', c`<?php
echo "Pakai kutip ganda";
echo 'Pakai kutip tunggal';`, 'Perhatikan hasilnya: dua kalimat <b>menempel</b> jadi satu baris. Kenapa? Lanjut ke penjelasan berikutnya.'),
  S('echo tidak otomatis pindah baris. Untuk pindah baris, tulis \\n di dalam kutip GANDA. \\n artinya "new line" atau baris baru.', c`<?php
echo "Baris pertama\n";
echo "Baris kedua\n";
echo "Baris ketiga";`, '<code>\\n</code> hanya bekerja di kutip ganda <code>"..."</code>. Di kutip tunggal, <code>\\n</code> akan tampil apa adanya.'),
  Q('Kode <code>echo "A"; echo "B";</code> menampilkan apa?', ['A dan B di baris berbeda', 'AB (menempel)', 'Error'], 1, 'Tepat! Tanpa \\n, hasil echo selalu menempel di baris yang sama.'),
  S('Satu echo juga bisa menampilkan beberapa teks sekaligus, dipisah koma.', c`<?php
echo "Nama: ", "Kancil", "\n";
echo "Hobi: ", "ngoding";`),
  S('Sekarang lihat kalau titik koma lupa ditulis. PHP akan menampilkan "syntax error". Itu normal dan sering terjadi! Baca pesannya: biasanya menunjuk nomor baris yang salah.', c`<?php
echo "Lupa titik koma"
echo "Baris dua";`, 'Error di atas menunjuk baris 3, padahal yang kurang titik koma baris 2. PHP baru sadar ada yang salah saat membaca baris berikutnya. Jadi kalau error, cek juga baris di atasnya.'),
  S('Sudah siap! Di latihan, tulis kode di editor, tekan Jalankan untuk mencoba, lalu Cek Jawaban kalau sudah yakin. Kalau buntu, ada tombol Petunjuk.')
],
komentar: [
  S('Sebelum berhitung, kenalan dulu dengan komentar. Komentar adalah catatan di dalam kode untuk manusia. PHP mengabaikannya, jadi tidak muncul di layar.'),
  S('Komentar satu baris ditulis dengan dua garis miring //. Semua tulisan setelah // di baris itu dianggap catatan.', c`<?php
// ini komentar, tidak akan tampil
echo "Yang tampil hanya ini";`),
  S('Tanda # juga bisa dipakai untuk komentar satu baris. Komentar juga boleh di belakang kode.', c`<?php
# ini juga komentar
echo "Halo"; // komentar di belakang kode`),
  S('Untuk catatan panjang beberapa baris, pakai /* di awal dan */ di akhir.', c`<?php
/*
  Program: Latihan komentar
  Pembuat: Kancil
*/
echo "Program jalan!";`),
  Q('Apa output dari kode <code>// echo "Halo";</code>?', ['Halo', 'Tidak ada output', 'Error'], 1, 'Betul! Karena diawali //, seluruh baris itu jadi komentar dan tidak dijalankan.'),
  S('Trik yang sering dipakai programmer: "mematikan" kode sementara dengan menjadikannya komentar, tanpa menghapusnya.', c`<?php
echo "Baris 1\n";
// echo "Baris 2\n";
echo "Baris 3\n";`, 'Baris 2 tidak tampil karena sudah jadi komentar. Kalau nanti dibutuhkan lagi, tinggal hapus <code>//</code> di depannya.'),
  S('Kenapa komentar penting? Supaya kamu (dan temanmu) paham maksud kode saat dibaca lagi minggu depan. Biasakan menulis komentar singkat, ya!')
],
angka: [
  S('Sekarang kita belajar berhitung dengan PHP. Kabar baik: aturannya mirip matematika di sekolah.'),
  S('Angka ditulis TANPA tanda kutip. echo bisa langsung menampilkannya.', c`<?php
echo 25;
echo "\n";
echo 3.5;`, 'Bilangan desimal memakai <b>titik</b>, bukan koma: tulis <code>3.5</code>, bukan <code>3,5</code>.'),
  S('Operator tambah + dan kurang -. PHP menghitung dulu, baru menampilkan hasilnya.', c`<?php
echo 10 + 5;
echo "\n";
echo 10 - 3;`),
  S('Untuk kali pakai bintang *, untuk bagi pakai garis miring /.', c`<?php
echo 4 * 3, "\n";
echo 20 / 4, "\n";
echo 7 / 2;`, 'Di komputer, tanda kali bukan <code>x</code> tapi <code>*</code>, dan tanda bagi bukan <code>:</code> tapi <code>/</code>.'),
  Q('Operator untuk perkalian di PHP adalah...', ['x', '*', ':'], 1, 'Benar, perkalian memakai tanda bintang *.'),
  S('Urutan hitungnya sama seperti matematika: kali dan bagi dikerjakan dulu, baru tambah dan kurang.', c`<?php
echo 2 + 3 * 4;`, 'PHP menghitung <code>3 * 4 = 12</code> dulu, lalu <code>2 + 12 = 14</code>.'),
  Q('Berapa hasil <code>echo 10 - 2 * 3;</code>?', ['24', '4', '6'], 1, 'Tepat! 2 * 3 = 6 dihitung dulu, lalu 10 - 6 = 4.'),
  S('Kalau mau tambah atau kurang dikerjakan duluan, pakai tanda kurung ( ). Bagian dalam kurung selalu dihitung pertama.', c`<?php
echo (2 + 3) * 4, "\n";
echo 2 + 3 * 4;`, 'Hasilnya beda: dengan kurung 20, tanpa kurung 14.'),
  S('Operator % (modulo) menghasilkan SISA pembagian. Ini akan sering dipakai, misalnya untuk cek bilangan genap atau ganjil.', c`<?php
echo 17 % 5, "\n";
echo 10 % 3, "\n";
echo 8 % 2;`, '17 dibagi 5 = 3, <b>sisa 2</b>. Maka <code>17 % 5</code> hasilnya 2.<br>8 dibagi 2 tidak ada sisa, jadi hasilnya 0.'),
  Q('Berapa hasil <code>17 % 5</code>?', ['3', '2', '3.4'], 1, 'Betul! 17 = 5 × 3 + 2, jadi sisanya 2.'),
  S('Operator ** untuk pangkat. 2 ** 3 artinya 2 × 2 × 2.', c`<?php
echo 2 ** 3, "\n";
echo 10 ** 2, "\n";
echo 5 ** 0;`),
  S('Teks dan hasil hitungan bisa ditampilkan bersama dengan memisahkannya pakai koma.', c`<?php
echo "6 x 7 = ", 6 * 7, "\n";
echo "Sisa 17 bagi 5 = ", 17 % 5;`),
  S('Hati-hati! Kalau hitungannya ditaruh di dalam kutip, PHP tidak menghitung, tapi menampilkannya sebagai teks.', c`<?php
echo "6 * 7", "\n";
echo 6 * 7;`, 'Baris pertama tampil apa adanya karena ada di dalam kutip. Di latihan nanti, biarkan PHP yang menghitung (jangan ditulis hasilnya).'),
  S('Ringkasnya: + tambah, - kurang, * kali, / bagi, % sisa bagi, ** pangkat, dan ( ) untuk mengatur urutan. Ayo latihan!')
],
variabel: [
  S('Variabel itu seperti kotak berlabel untuk menyimpan data. Datanya bisa dipakai berkali-kali tanpa ditulis ulang.'),
  S('Cara membuat variabel: tanda dolar $, lalu nama, lalu =, lalu nilainya, diakhiri titik koma.', c`<?php
$nama = "Sari";
echo $nama;`, 'Bagian-bagiannya:<br><code>$nama</code> = nama kotak (selalu diawali $)<br><code>=</code> = isi dengan<br><code>"Sari"</code> = isi kotaknya'),
  S('Penting: tanda = di PHP artinya "isi dengan", bukan "sama dengan". Jadi $nama = "Sari" dibaca: kotak $nama diisi teks Sari.'),
  Q('Mana penulisan nama variabel yang benar?', ['nama = "Sari";', '$nama = "Sari";', '#nama = "Sari";'], 1, 'Betul! Variabel PHP selalu diawali tanda dolar $.'),
  S('Variabel bisa berisi angka, dan angkanya bisa dihitung.', c`<?php
$harga = 12000;
$jumlah = 3;
echo $harga * $jumlah;`),
  S('Hasil hitungan juga bisa disimpan ke variabel baru, lalu ditampilkan.', c`<?php
$panjang = 6;
$lebar = 4;
$luas = $panjang * $lebar;
echo $luas;`, 'Urutannya: hitung <code>$panjang * $lebar</code> dulu, hasilnya (24) dimasukkan ke kotak <code>$luas</code>.'),
  S('Isi variabel bisa diganti kapan saja. Nilai lama hilang dan diganti nilai baru.', c`<?php
$skor = 10;
echo $skor, "\n";
$skor = 25;
echo $skor, "\n";
$skor = $skor + 5;
echo $skor;`, '<code>$skor = $skor + 5</code> artinya: ambil isi $skor (25), tambah 5, simpan lagi ke $skor. Hasilnya 30.'),
  Q('<code>$a = 5; $a = 8; echo $a;</code> hasilnya?', ['5', '8', '58'], 1, 'Tepat! Isi lama (5) ditimpa isi baru (8).'),
  S('Di dalam kutip GANDA, variabel otomatis diganti dengan isinya. Di kutip tunggal tidak.', c`<?php
$nama = "Sari";
$kota = "Depok";
echo "Halo $nama dari $kota\n";
echo 'Halo $nama';`),
  S('Cara lain menggabung teks dengan variabel: pakai titik (.) atau koma di echo.', c`<?php
$nama = "Budi";
$umur = 19;
echo "Halo " . $nama . "\n";
echo "Umur: ", $umur;`),
  S('Bagaimana menukar isi dua variabel? Bayangkan menukar isi dua gelas: kamu butuh gelas ketiga untuk menampung sementara.', c`<?php
$a = "kopi";
$b = "teh";
$temp = $a;   // simpan kopi di gelas sementara
$a = $b;      // gelas a diisi teh
$b = $temp;   // gelas b diisi kopi
echo "a = $a, b = $b";`, 'Kalau langsung <code>$a = $b; $b = $a;</code>, isi <code>$a</code> yang lama sudah hilang duluan. Makanya perlu <code>$temp</code>.'),
  S('Aturan nama variabel: diawali huruf atau garis bawah, tidak boleh ada spasi, dan huruf besar-kecil dibedakan. $nama dan $Nama itu dua variabel berbeda!', null, 'Boleh: <code>$nama</code>, <code>$nilai_akhir</code>, <code>$totalHarga</code><br>Tidak boleh: <code>$1nama</code>, <code>$nama lengkap</code>')
],
tipe: [
  S('Setiap nilai di PHP punya tipe data. Ada 5 yang paling sering dipakai. Yuk kenalan satu per satu.'),
  S('string = teks, ditulis dalam kutip. int = bilangan bulat. float = bilangan desimal.', c`<?php
$nama = "Rina";   // string
$umur = 20;       // int
$ipk = 3.75;      // float
echo $nama, " ", $umur, " ", $ipk;`),
  S('bool (boolean) hanya punya dua nilai: true (benar) atau false (salah). null artinya kosong, tidak ada nilai.', c`<?php
$sudahLulus = false;  // bool
$catatan = null;      // null`, 'bool akan sangat penting di pelajaran if/else nanti.'),
  S('Untuk melihat tipe sekaligus isi variabel, pakai var_dump(). Ini alat utama programmer untuk mencari bug!', c`<?php
var_dump(20);
var_dump("PHP");
var_dump(3.75);
var_dump(true);
var_dump(null);`, 'Cara baca: <code>string(3) "PHP"</code> artinya tipe string, panjang 3 huruf, isinya PHP.'),
  Q('Hasil <code>var_dump(42);</code> adalah...', ['string(2) "42"', 'int(42)', 'float(42)'], 1, 'Betul, 42 adalah bilangan bulat tanpa kutip, jadi tipenya int.'),
  S('gettype() mengembalikan nama tipenya dalam bentuk teks. Catatan: untuk float, gettype menyebutnya "double".', c`<?php
echo gettype("halo"), "\n";
echo gettype(10), "\n";
echo gettype(3.5);`),
  Q('<code>$x = "25";</code> tipe datanya apa?', ['int', 'string', 'float'], 1, 'Tepat! Karena ditulis di dalam kutip, "25" adalah teks (string), walau isinya angka.'),
  S('Mengubah tipe disebut casting. Tulis tipe tujuan di dalam kurung di depan nilainya: (int), (float), (string), (bool).', c`<?php
$teks = "42";
var_dump($teks);
$angka = (int) $teks;
var_dump($angka);
var_dump($angka + 8);`, 'Ini sering dibutuhkan karena data dari form website selalu datang sebagai string.'),
  S('Cukup teorinya. Sekarang praktik pakai var_dump, gettype, dan casting!')
],
string: [
  S('String adalah teks. PHP punya banyak cara untuk mengolahnya. Kita mulai dari menggabungkan string.'),
  S('Operator titik . menggabungkan dua string jadi satu (namanya concatenation).', c`<?php
$depan = "Budi";
$belakang = "Santoso";
echo $depan . $belakang, "\n";
echo $depan . " " . $belakang;`, 'Baris pertama hasilnya menempel. Supaya ada spasi, gabungkan juga string spasi <code>" "</code> di tengah.'),
  Q('Hasil <code>echo "Ka" . "ncil";</code>?', ['Ka ncil', 'Kancil', 'Ka.ncil'], 1, 'Betul! Titik menggabungkan tanpa menambah spasi.'),
  S('Operator .= menambahkan teks di belakang isi variabel yang sudah ada.', c`<?php
$pesan = "Halo";
$pesan .= ", apa kabar?";
echo $pesan;`, '<code>$pesan .= "x"</code> sama dengan <code>$pesan = $pesan . "x"</code>.'),
  S('Sekarang fungsi bawaan. strlen() menghitung jumlah karakter, termasuk spasi.', c`<?php
echo strlen("Kancil"), "\n";
echo strlen("Ilmu Komputer");`, '"Ilmu Komputer" = 4 huruf + 1 spasi + 8 huruf = 13.'),
  S('strtoupper() mengubah ke HURUF BESAR, strtolower() ke huruf kecil, ucfirst() membuat huruf pertama kapital.', c`<?php
$kata = "gunaDarma";
echo strtoupper($kata), "\n";
echo strtolower($kata), "\n";
echo ucfirst("kancil");`),
  S('str_repeat() mengulang teks sebanyak angka yang diminta. strrev() membalik urutan huruf.', c`<?php
echo str_repeat("ha", 3), "\n";
echo str_repeat("-", 10), "\n";
echo strrev("PHP seru");`),
  Q('<code>str_repeat("ab", 2)</code> hasilnya?', ['ab2', 'abab', 'aabb'], 1, 'Tepat! "ab" diulang 2 kali.'),
  S('Fungsi bisa digabung dengan titik, karena hasil fungsi juga berupa string.', c`<?php
$nama = "rina";
echo "Halo, " . ucfirst($nama) . str_repeat("!", 2);`),
  S('Ringkasan: titik untuk gabung, .= untuk menambah, strlen, strtoupper, strtolower, ucfirst, str_repeat, strrev. Ayo dipraktikkan!')
],
ifelse: [
  S('Program sering harus memilih, misalnya "kalau nilai di atas 70, lulus". Untuk itu ada if. Sebelumnya kita kenalan dengan operator pembanding.'),
  S('Operator pembanding menghasilkan true atau false.', c`<?php
var_dump(5 > 3);
var_dump(5 < 3);
var_dump(7 == 7);
var_dump(7 != 7);`, '<code>&gt;</code> lebih besar, <code>&lt;</code> lebih kecil, <code>&gt;=</code> lebih besar atau sama, <code>&lt;=</code> lebih kecil atau sama, <code>==</code> sama dengan, <code>!=</code> tidak sama.'),
  Q('Untuk MEMBANDINGKAN apakah $a sama dengan 10, tulis...', ['$a = 10', '$a == 10', '$a => 10'], 1, 'Betul! Satu = untuk mengisi, dua == untuk membandingkan. Ini kesalahan pemula paling umum.'),
  S('if menjalankan kode di dalam kurung kurawal { } hanya kalau kondisinya true.', c`<?php
$nilai = 85;
if ($nilai >= 70) {
    echo "Lulus!";
}`, 'Bentuknya: <code>if (kondisi) { kode }</code>. Kode di dalam { } biasanya diberi indentasi 4 spasi supaya rapi.'),
  S('Kalau kondisinya false, isi if dilewati. Untuk menjalankan kode lain saat kondisi false, pakai else.', c`<?php
$uang = 5000;
if ($uang >= 10000) {
    echo "Beli bakso";
} else {
    echo "Beli cilok saja";
}`),
  S('Contoh penting: cek genap atau ganjil pakai % (sisa bagi). Bilangan genap kalau sisa bagi 2-nya 0.', c`<?php
$angka = 6;
if ($angka % 2 == 0) {
    echo "$angka genap";
} else {
    echo "$angka ganjil";
}`),
  Q('<code>if (9 % 2 == 0)</code> bernilai...', ['true', 'false'], 1, 'Tepat! 9 % 2 = 1, dan 1 == 0 itu false. Jadi 9 ganjil.'),
  S('Pilihannya lebih dari dua? Pakai elseif. PHP mengecek dari atas ke bawah dan berhenti di kondisi pertama yang benar.', c`<?php
$jam = 14;
if ($jam < 11) {
    echo "Selamat pagi";
} elseif ($jam < 15) {
    echo "Selamat siang";
} elseif ($jam < 18) {
    echo "Selamat sore";
} else {
    echo "Selamat malam";
}`, 'Untuk jam 14: cek <code>14 &lt; 11</code> salah, lanjut cek <code>14 &lt; 15</code> benar, tampil "Selamat siang", lalu sisanya dilewati.'),
  Q('Dengan kode di atas, kalau $jam = 16, yang tampil?', ['Selamat siang', 'Selamat sore', 'Selamat malam'], 1, 'Betul! 16 < 11 salah, 16 < 15 salah, 16 < 18 benar.'),
  S('Untuk grade nilai, urutkan kondisinya dari nilai tertinggi. Kalau terbalik, nilai 95 bisa tertangkap kondisi ">= 50" duluan!'),
  S('Satu hal lagi: di latihan bagian ini, Kancil mengetes kodemu dengan nilai lain juga. Jadi kodenya harus benar-benar memakai if, bukan menulis jawabannya langsung.')
],
logika: [
  S('Kadang satu keputusan butuh lebih dari satu syarat. Untuk itu ada operator logika: && (dan), || (atau), dan ! (bukan).'),
  S('&& bernilai true hanya kalau KEDUA syarat benar.', c`<?php
$umur = 20;
$punyaKTP = true;
if ($umur >= 17 && $punyaKTP) {
    echo "Boleh ikut pemilu";
} else {
    echo "Belum boleh";
}`),
  S('|| bernilai true kalau SALAH SATU syarat benar. ! membalik nilai: true jadi false, false jadi true.', c`<?php
$hari = "Minggu";
if ($hari == "Sabtu" || $hari == "Minggu") {
    echo "Libur!\n";
}
$hujan = false;
if (!$hujan) {
    echo "Bisa main ke luar";
}`),
  Q('<code>true && false</code> hasilnya?', ['true', 'false'], 1, 'Betul! && butuh keduanya benar.'),
  Q('<code>true || false</code> hasilnya?', ['true', 'false'], 0, 'Tepat! || cukup salah satu benar.'),
  S('Kalau satu variabel dibandingkan dengan banyak nilai pasti, switch lebih rapi daripada elseif berderet.', c`<?php
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
}`, '<code>case</code> = nilai yang dicocokkan. <code>break</code> = berhenti, keluar dari switch. <code>default</code> = dijalankan kalau tidak ada case yang cocok.'),
  S('Kenapa break penting? Tanpa break, PHP akan terus menjalankan case di bawahnya.', c`<?php
$x = 1;
switch ($x) {
    case 1:
        echo "Satu ";
    case 2:
        echo "Dua ";
        break;
    case 3:
        echo "Tiga";
}`, 'Karena case 1 tidak punya break, "Dua" ikut tampil. Biasanya ini bug, jadi jangan lupa break.'),
  S('PHP 8 punya match: lebih ringkas, menghasilkan nilai, dan tidak butuh break.', c`<?php
$kode = "BDG";
$kota = match ($kode) {
    "JKT" => "Jakarta",
    "BDG" => "Bandung",
    default => "Tidak dikenal",
};
echo $kota;`, 'Formatnya <code>nilai => hasil</code>, dipisah koma. Hasil match bisa langsung di-echo: <code>echo match (...) { ... };</code>'),
  S('Terakhir, operator ternary untuk pilihan singkat: kondisi ? nilaiJikaBenar : nilaiJikaSalah.', c`<?php
$stok = 0;
echo $stok > 0 ? "Tersedia" : "Habis";`),
  S('Siap? Latihannya pakai &&, switch, dan match.')
],
for: [
  S('Bayangkan disuruh menampilkan angka 1 sampai 100. Menulis 100 echo pasti capek! Perulangan (loop) mengulang perintah untukmu.'),
  S('for punya 3 bagian di dalam kurung, dipisah titik koma: mulai; syarat lanjut; langkah.', c`<?php
for ($i = 1; $i <= 5; $i++) {
    echo "Putaran ke-$i\n";
}`, '<code>$i = 1</code> → mulai dari 1<br><code>$i &lt;= 5</code> → ulangi selama $i masih ≤ 5<br><code>$i++</code> → setiap selesai satu putaran, $i ditambah 1'),
  S('Urutan jalannya: $i = 1, cek 1 <= 5 (benar) → jalankan isi → $i jadi 2 → cek 2 <= 5 → ... → $i jadi 6 → cek 6 <= 5 (salah) → loop berhenti.'),
  Q('<code>for ($i = 1; $i <= 3; $i++)</code> berjalan berapa kali?', ['2 kali', '3 kali', '4 kali'], 1, 'Betul! $i bernilai 1, 2, 3, lalu berhenti.'),
  S('Mau menampilkan dalam satu baris? Ganti \\n dengan spasi.', c`<?php
for ($i = 1; $i <= 5; $i++) {
    echo $i . " ";
}`),
  S('Langkahnya bisa diubah. $i += 2 artinya tambah 2 setiap putaran. $i-- artinya kurangi 1 (mundur).', c`<?php
for ($i = 2; $i <= 10; $i += 2) {
    echo $i . " ";
}
echo "\n";
for ($i = 5; $i >= 1; $i--) {
    echo $i . " ";
}`),
  Q('Untuk menampilkan 5, 10, 15, 20, langkah yang tepat adalah...', ['$i++', '$i += 5', '$i *= 5'], 1, 'Tepat! Mulai dari 5, tambah 5 setiap putaran.'),
  S('Pola yang sangat penting: menjumlahkan dengan variabel penampung. Buat variabelnya di LUAR loop dengan nilai 0, lalu tambah di dalam loop.', c`<?php
$total = 0;
for ($i = 1; $i <= 4; $i++) {
    $total += $i;
}
echo "Jumlah 1 sampai 4 = $total";`, 'Jalannya: total 0 → +1 = 1 → +2 = 3 → +3 = 6 → +4 = 10.<br><code>$total += $i</code> sama dengan <code>$total = $total + $i</code>.<br>echo ditaruh <b>setelah</b> loop supaya hasilnya tampil sekali saja.'),
  S('Batas loop juga bisa memakai variabel, jadi programnya fleksibel.', c`<?php
$n = 3;
for ($i = 1; $i <= $n; $i++) {
    echo "Halo ke-$i\n";
}`)
],
while: [
  S('Selain for, ada while. while mengulang SELAMA kondisinya masih benar. Cocok kalau kamu belum tahu harus berapa kali mengulang.'),
  S('Bentuknya: while (kondisi) { kode }. Di dalamnya harus ada sesuatu yang mengubah nilai, supaya suatu saat kondisinya jadi false.', c`<?php
$energi = 3;
while ($energi > 0) {
    echo "Lari! Energi: $energi\n";
    $energi--;
}
echo "Capek, istirahat dulu.";`, '<code>$energi--</code> mengurangi energi 1 setiap putaran. Saat energi 0, kondisi <code>0 &gt; 0</code> salah, loop berhenti.'),
  S('HATI-HATI: kalau lupa mengubah nilainya, loop tidak akan pernah berhenti (infinite loop). Di game ini, program seperti itu akan dihentikan otomatis.', c`<?php
$x = 1;
while ($x <= 3) {
    echo $x;
    // lupa $x++ !
}`),
  Q('Apa yang kurang dari kode di atas?', ['Titik koma', '$x++ di dalam loop', 'Kurung kurawal'], 1, 'Betul! Tanpa $x++, nilai $x selalu 1, jadi loop jalan terus.'),
  S('Contoh nyata: berapa bulan menabung sampai target tercapai? Kita tidak tahu jumlah bulannya, jadi pakai while.', c`<?php
$tabungan = 0;
$bulan = 0;
while ($tabungan < 500000) {
    $tabungan += 120000;
    $bulan++;
}
echo "Target tercapai dalam $bulan bulan";`, 'Setiap putaran: tabungan bertambah 120.000 dan bulan bertambah 1. Loop berhenti saat tabungan sudah ≥ 500.000.'),
  S('do-while mirip while, tapi isinya dijalankan dulu, baru kondisinya dicek. Jadi pasti jalan minimal sekali.', c`<?php
$x = 10;
do {
    echo "Jalan sekali walau x = $x";
} while ($x < 5);`),
  S('intdiv() membagi dan membuang angka di belakang koma. intdiv(98765, 10) = 9876. Ini berguna untuk memotong digit terakhir.', c`<?php
echo intdiv(98765, 10), "\n";
echo intdiv(7, 2), "\n";
echo 7 / 2;`),
  S('Contoh: menghitung digit dengan memotong angka terus sampai habis.', c`<?php
$angka = 345;
$digit = 0;
while ($angka > 0) {
    $angka = intdiv($angka, 10);
    $digit++;
}
echo "Jumlah digit: $digit";`, '345 → 34 → 3 → 0. Dipotong 3 kali, jadi 3 digit.'),
  Q('Kapan sebaiknya memakai while dibanding for?', ['Saat jumlah perulangan sudah pasti', 'Saat jumlah perulangan belum diketahui', 'Tidak ada bedanya sama sekali'], 1, 'Tepat! for cocok kalau jumlahnya jelas, while cocok kalau berhenti berdasarkan kondisi.')
],
nested: [
  S('Loop bisa ditaruh di dalam loop lain (loop bersarang). Loop dalam selesai semua dulu, baru loop luar maju satu langkah.'),
  S('Contoh: membuat kotak 3 baris × 4 kolom.', c`<?php
for ($baris = 1; $baris <= 3; $baris++) {
    for ($kolom = 1; $kolom <= 4; $kolom++) {
        echo "# ";
    }
    echo "\n";
}`, 'Loop luar = baris, loop dalam = kolom. Setelah loop dalam selesai, <code>echo "\\n"</code> membuat baris baru.'),
  Q('Kalau loop luar 3 kali dan loop dalam 4 kali, total "#" yang tampil?', ['7', '12', '34'], 1, 'Betul! 3 × 4 = 12.'),
  S('Trik membuat segitiga: batas loop dalam memakai variabel loop luar. Baris ke-1 cetak 1 bintang, baris ke-2 cetak 2 bintang, dst.', c`<?php
for ($i = 1; $i <= 4; $i++) {
    for ($j = 1; $j <= $i; $j++) {
        echo "*";
    }
    echo "\n";
}`, 'Perhatikan <code>$j &lt;= $i</code>. Saat $i = 3, loop dalam jalan 3 kali.'),
  S('Tabel perkalian cukup satu loop, karena salah satu angkanya tetap.', c`<?php
$n = 5;
for ($i = 1; $i <= 3; $i++) {
    echo "$n x $i = " . ($n * $i) . "\n";
}`, 'Hitungan <code>($n * $i)</code> diberi kurung supaya dihitung dulu sebelum digabung dengan teks.'),
  S('break menghentikan loop saat itu juga. continue melewati sisa putaran ini dan langsung ke putaran berikutnya.', c`<?php
for ($i = 1; $i <= 10; $i++) {
    if ($i == 3) {
        continue; // lewati 3
    }
    if ($i == 7) {
        break;    // berhenti di 7
    }
    echo $i . " ";
}`),
  Q('Untuk melewati angka kelipatan 5, kita pakai...', ['break', 'continue', 'stop'], 1, 'Tepat! continue melewati putaran itu saja, loop tetap lanjut.'),
  S('Latihan berikutnya memakai semua ini: loop bersarang, tabel perkalian, dan continue. Semangat!')
],
array: [
  S('Selamat datang di Pasar Array! Bayangkan kamu mau menyimpan nama 30 mahasiswa. Membuat 30 variabel itu repot. Solusinya: array.'),
  S('Array = satu variabel yang menyimpan banyak nilai. Ditulis dengan kurung siku [ ], isinya dipisah koma.', c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
echo $buah[0];`),
  S('Setiap isi array punya nomor urut yang disebut indeks. PENTING: indeks dimulai dari 0, bukan 1!', c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
echo $buah[0], "\n";
echo $buah[1], "\n";
echo $buah[2];`, 'Apel = indeks 0, Jeruk = indeks 1, Mangga = indeks 2.'),
  Q('<code>$warna = ["merah", "hijau", "biru"];</code> Bagaimana mengambil "biru"?', ['$warna[3]', '$warna[2]', '$warna["biru"]'], 1, 'Betul! Indeks mulai dari 0, jadi elemen ketiga ada di indeks 2.'),
  S('Mengubah isi: tulis indeksnya lalu beri nilai baru. Menambah di akhir: pakai [] kosong.', c`<?php
$buah = ["Apel", "Jeruk"];
$buah[0] = "Anggur";  // ubah
$buah[] = "Durian";   // tambah di akhir
print_r($buah);`, '<code>print_r()</code> menampilkan seluruh isi array beserta indeksnya. echo tidak bisa menampilkan array langsung.'),
  S('count() menghitung jumlah isi array.', c`<?php
$buah = ["Apel", "Jeruk", "Mangga"];
echo "Jumlah: " . count($buah);`),
  Q('Kalau sebuah array berisi 5 elemen, indeks terakhirnya...', ['5', '4', '6'], 1, 'Tepat! Karena mulai dari 0, indeks terakhir = jumlah - 1.'),
  S('Untuk memproses semua isi array satu per satu, pakai foreach. Ini pasangan terbaik array.', c`<?php
$teman = ["Andi", "Bela", "Caca"];
foreach ($teman as $nama) {
    echo "Halo, $nama!\n";
}`, 'Dibaca: "untuk setiap isi <code>$teman</code>, simpan sementara di <code>$nama</code>, lalu jalankan isi { }". Loop berhenti sendiri setelah elemen terakhir.'),
  S('Kalau butuh nomor urut, foreach juga bisa mengambil indeksnya: foreach ($array as $indeks => $nilai).', c`<?php
$teman = ["Andi", "Bela", "Caca"];
foreach ($teman as $i => $nama) {
    echo ($i + 1) . ". $nama\n";
}`, 'Indeks dimulai 0, jadi ditambah 1 supaya nomornya mulai dari 1.')
],
assoc: [
  S('Array biasa memakai nomor sebagai indeks. Array asosiatif memakai NAMA (disebut key). Lebih mudah dibaca!'),
  S('Formatnya "key" => nilai.', c`<?php
$mhs = [
    "nama" => "Rina",
    "npm" => "12345678",
    "ipk" => 3.6,
];
echo $mhs["nama"], "\n";
echo $mhs["ipk"];`, 'Bandingkan: <code>$mhs["nama"]</code> jauh lebih jelas daripada <code>$mhs[0]</code>.'),
  Q('Bagaimana mengambil npm dari array di atas?', ['$mhs[npm]', '$mhs["npm"]', '$mhs->npm'], 1, 'Betul! Key ditulis dalam kutip di dalam kurung siku.'),
  S('Mengubah dan menambah data juga lewat key-nya.', c`<?php
$stok = ["pensil" => 12];
$stok["pensil"] = 10;     // ubah
$stok["penghapus"] = 4;   // tambah key baru
print_r($stok);`),
  S('foreach bisa mengambil key DAN nilainya: foreach ($array as $key => $value).', c`<?php
$stok = ["pensil" => 12, "buku" => 5, "spidol" => 8];
foreach ($stok as $barang => $jumlah) {
    echo "$barang: $jumlah\n";
}`),
  S('Menjumlahkan semua nilai: pakai pola variabel penampung seperti di pelajaran for.', c`<?php
$nilai = ["UTS" => 80, "UAS" => 90, "Tugas" => 85];
$total = 0;
foreach ($nilai as $jenis => $angka) {
    $total += $angka;
}
echo "Total: $total";`),
  Q('Di <code>foreach ($stok as $a => $b)</code>, variabel $a berisi...', ['nilainya', 'key-nya', 'jumlah elemen'], 1, 'Tepat! Yang di kiri => adalah key, yang di kanan adalah nilai.'),
  S('Mengambil key yang tidak ada akan memunculkan warning "Undefined array key". Cek dulu dengan isset().', c`<?php
$mhs = ["nama" => "Rina"];
if (isset($mhs["email"])) {
    echo $mhs["email"];
} else {
    echo "Email belum diisi";
}`)
],
multi: [
  S('Array bisa berisi array lain. Ini cara menyimpan data berbentuk tabel, misalnya daftar mahasiswa dengan nama dan nilainya.'),
  S('Bentuk paling sederhana: setiap baris adalah array biasa.', c`<?php
$data = [
    ["Andi", 80],
    ["Bela", 92],
];
echo $data[1][0], " dapat ", $data[1][1];`, '<code>$data[1]</code> = baris kedua <code>["Bela", 92]</code>.<br><code>$data[1][0]</code> = isi pertama dari baris kedua, yaitu "Bela".'),
  Q('Dari array di atas, <code>$data[0][1]</code> berisi?', ['Andi', '80', 'Bela'], 1, 'Betul! Baris 0 kolom 1, yaitu 80.'),
  S('Lebih jelas lagi kalau setiap baris memakai array asosiatif.', c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 92],
];
echo $kelas[0]["nama"];`),
  S('Untuk menelusuri, foreach mengambil satu baris, lalu kamu ambil kolomnya dengan key.', c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 92],
    ["nama" => "Caca", "nilai" => 75],
];
foreach ($kelas as $mhs) {
    echo $mhs["nama"] . " dapat " . $mhs["nilai"] . "\n";
}`),
  S('Menghitung rata-rata: jumlahkan dulu, lalu bagi dengan count().', c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 90],
];
$total = 0;
foreach ($kelas as $mhs) {
    $total += $mhs["nilai"];
}
echo "Rata-rata: " . ($total / count($kelas));`),
  S('Menyaring data: gabungkan foreach dengan if.', c`<?php
$kelas = [
    ["nama" => "Andi", "nilai" => 80],
    ["nama" => "Bela", "nilai" => 92],
    ["nama" => "Caca", "nilai" => 65],
];
foreach ($kelas as $mhs) {
    if ($mhs["nilai"] >= 70) {
        echo $mhs["nama"] . " lulus\n";
    }
}`, 'Bentuk data seperti ini akan kamu temui terus saat mengambil data dari database nanti!')
],
bawaan: [
  S('PHP punya ribuan fungsi siap pakai. Kamu sudah kenal strlen, count, dan strtoupper. Sekarang kenalan dengan fungsi yang paling sering dipakai.'),
  S('Cara kerja fungsi: tulis namanya, beri input di dalam kurung, dan fungsi mengembalikan hasil.', c`<?php
$hasil = strtoupper("halo");
echo $hasil;`, 'Input fungsi disebut <b>argumen</b>. Kalau argumennya lebih dari satu, dipisah koma.'),
  S('ucwords() membuat huruf pertama SETIAP kata jadi kapital (beda dengan ucfirst yang hanya huruf pertama).', c`<?php
echo ucfirst("belajar php itu seru"), "\n";
echo ucwords("belajar php itu seru");`),
  S('explode() memecah string jadi array berdasarkan pemisah. implode() kebalikannya: menggabung array jadi string.', c`<?php
$csv = "nasi,ayam,sambal";
$isi = explode(",", $csv);
print_r($isi);
echo implode(" + ", $isi);`, '<code>explode(pemisah, teks)</code> dan <code>implode(penyambung, array)</code>. Urutan argumennya: pemisah dulu.'),
  Q('<code>explode(" ", "aku suka php")</code> menghasilkan array berisi berapa elemen?', ['1', '3', '12'], 1, 'Betul! Dipecah di setiap spasi: "aku", "suka", "php".'),
  S('sort() mengurutkan array dari kecil ke besar, rsort() dari besar ke kecil. Fungsi ini langsung mengubah array-nya.', c`<?php
$angka = [7, 2, 9, 4];
sort($angka);
echo implode(", ", $angka), "\n";
rsort($angka);
echo implode(", ", $angka);`, 'Jangan tulis <code>$angka = sort($angka)</code>. Cukup <code>sort($angka);</code> saja.'),
  S('array_sum() menjumlahkan semua isi, max() dan min() mencari nilai terbesar dan terkecil.', c`<?php
$nilai = [80, 95, 70];
echo "Jumlah: " . array_sum($nilai) . "\n";
echo "Tertinggi: " . max($nilai) . "\n";
echo "Terendah: " . min($nilai);`),
  S('str_replace() mengganti kata, in_array() mengecek apakah suatu nilai ada di array.', c`<?php
echo str_replace("kopi", "teh", "saya suka kopi"), "\n";
$menu = ["kopi", "teh"];
if (in_array("teh", $menu)) {
    echo "Teh tersedia";
}`),
  Q('Fungsi untuk menggabungkan isi array jadi satu string adalah...', ['explode', 'implode', 'count'], 1, 'Tepat! implode = gabung, explode = pecah.')
],
fungsi: [
  S('Sekarang saatnya membuat fungsi sendiri! Fungsi adalah kumpulan kode yang diberi nama, supaya bisa dipanggil berulang kali.'),
  S('Membuat fungsi pakai kata function, lalu nama, kurung ( ), dan isi di dalam { }. Fungsi tidak jalan sampai dipanggil.', c`<?php
function salam() {
    echo "Selamat datang!\n";
}

salam();
salam();`, 'Bagian atas hanya <b>membuat</b> fungsi. <code>salam();</code> di bawah yang <b>menjalankannya</b>. Dipanggil 2 kali, tampil 2 kali.'),
  S('Fungsi bisa menerima input lewat parameter, yaitu variabel di dalam kurung.', c`<?php
function sapa($nama) {
    echo "Halo, $nama!\n";
}

sapa("Dewi");
sapa("Eko");`, 'Saat <code>sapa("Dewi")</code> dipanggil, parameter <code>$nama</code> otomatis berisi "Dewi".'),
  S('Parameter boleh lebih dari satu, dipisah koma.', c`<?php
function perkenalan($nama, $umur) {
    echo "$nama berumur $umur tahun\n";
}

perkenalan("Rina", 19);`),
  S('return mengembalikan hasil ke pemanggil, supaya hasilnya bisa disimpan atau diolah lagi. Ini beda dengan echo yang hanya menampilkan.', c`<?php
function kuadrat($x) {
    return $x * $x;
}

$hasil = kuadrat(6);
echo $hasil, "\n";
echo kuadrat(3) + 1;`, 'Kode setelah <code>return</code> di dalam fungsi tidak dijalankan lagi, karena fungsi langsung selesai.'),
  Q('Apa bedanya return dengan echo di dalam fungsi?', ['Sama saja', 'return mengembalikan nilai, echo hanya menampilkan', 'echo lebih cepat'], 1, 'Betul! Dengan return, hasil fungsi bisa disimpan ke variabel atau dihitung lagi.'),
  S('round() membulatkan angka. Argumen kedua menentukan jumlah angka di belakang koma.', c`<?php
echo round(3.14159), "\n";
echo round(3.14159, 2), "\n";
echo round(2.567, 1);`),
  S('Fungsi juga bisa mengembalikan true/false. Biasanya diberi nama awalan is atau cek.', c`<?php
function isGenap($n) {
    return $n % 2 == 0;
}

for ($i = 1; $i <= 6; $i++) {
    if (isGenap($i)) {
        echo "$i ";
    }
}`, 'Untuk latihan bilangan prima nanti, idenya mirip: coba bagi $n dengan 2, 3, 4, dst. Kalau ada yang sisa baginya 0, langsung <code>return false</code>. Kalau tidak ada sama sekali, <code>return true</code>.'),
  Q('Bilangan prima adalah bilangan yang...', ['Habis dibagi 2', 'Hanya habis dibagi 1 dan dirinya sendiri', 'Lebih besar dari 10'], 1, 'Tepat! Contohnya 2, 3, 5, 7, 11. Angka 1 bukan bilangan prima.')
],
lanjut: [
  S('Di pelajaran ini ada 3 jurus fungsi tingkat lanjut: parameter default, rekursi, dan arrow function.'),
  S('Parameter default: beri nilai awal di parameter. Kalau saat dipanggil tidak diisi, nilai default yang dipakai.', c`<?php
function pesan($menu, $level = "sedang") {
    return "$menu pedas $level";
}

echo pesan("Seblak"), "\n";
echo pesan("Seblak", "gila");`),
  Q('<code>function f($a, $b = 5)</code>, lalu <code>f(2)</code>. Nilai $b?', ['0', '5', 'Error'], 1, 'Betul! $b tidak diisi, jadi memakai default 5.'),
  S('Rekursi = fungsi yang memanggil dirinya sendiri. Wajib ada kondisi berhenti (base case). Tanpa itu, fungsi berjalan tanpa akhir.', c`<?php
function hitungMundur($n) {
    if ($n == 0) {
        echo "Selesai!";
        return;
    }
    echo "$n ";
    hitungMundur($n - 1);
}

hitungMundur(5);`, 'Base case-nya <code>if ($n == 0)</code>. Setiap panggilan, $n berkurang 1 sampai akhirnya 0.'),
  S('Rekursi juga bisa mengembalikan nilai. Contoh: jumlah 1 sampai n = n + jumlah(n - 1).', c`<?php
function jumlah($n) {
    if ($n == 1) {
        return 1;
    }
    return $n + jumlah($n - 1);
}

echo jumlah(4);`, 'jumlah(4) = 4 + jumlah(3) = 4 + 3 + jumlah(2) = 4 + 3 + 2 + 1 = 10.<br>Faktorial di latihan nanti polanya sama, hanya + diganti ×.'),
  S('range() membuat array berisi deret angka.', c`<?php
$angka = range(1, 5);
echo implode(" ", $angka);`),
  S('Arrow function adalah fungsi mini satu baris: fn($x) => hasil. Biasanya dipakai bersama array_map dan array_filter.', c`<?php
$kali2 = fn($x) => $x * 2;
echo $kali2(7);`),
  S('array_map menjalankan fungsi ke SETIAP elemen. array_filter MENYARING elemen: hanya yang hasilnya true yang disimpan.', c`<?php
$harga = [10000, 25000, 40000];
$diskon = array_map(fn($h) => $h * 0.9, $harga);
echo implode(", ", $diskon), "\n";
$mahal = array_filter($harga, fn($h) => $h > 20000);
echo implode(", ", $mahal);`),
  Q('Untuk mengambil hanya angka ganjil dari array, pakai...', ['array_map', 'array_filter', 'array_sum'], 1, 'Tepat! array_filter menyaring, array_map mengubah.')
],
class: [
  S('Selamat datang di Kastil OOP! OOP (Object Oriented Programming) adalah cara menyusun kode berdasarkan "benda" beserta data dan kemampuannya.'),
  S('Class itu cetakan atau desain. Object itu benda nyata hasil cetakannya. Dari satu class "Mobil", kamu bisa membuat banyak object mobil.'),
  S('Di dalam class ada property (data, berupa variabel) dan method (kemampuan, berupa fungsi).', c`<?php
class Mobil {
    public $merk;     // property
    public $warna;    // property

    public function klakson() {   // method
        return "Tin tin!";
    }
}`, 'Kode ini baru membuat cetakannya, belum ada mobil yang dibuat. Makanya belum ada output.'),
  S('Membuat object pakai new. Mengakses property dan method pakai panah ->.', c`<?php
class Mobil {
    public $merk;
    public function klakson() {
        return "Tin tin!";
    }
}

$mobilku = new Mobil();
$mobilku->merk = "Toyota";
echo $mobilku->merk . ": " . $mobilku->klakson();`, 'Perhatikan: <code>$mobilku->merk</code> tanpa $ di depan merk.'),
  Q('Untuk membuat object dari class Kucing, tulis...', ['$k = Kucing();', '$k = new Kucing();', '$k = class Kucing;'], 1, 'Betul! Kata new membuat object baru.'),
  S('Di dalam method, $this berarti "object ini sendiri". Dipakai untuk mengakses property miliknya.', c`<?php
class Mobil {
    public $merk;
    public $warna;

    public function info() {
        return "Mobil " . $this->merk . " warna " . $this->warna;
    }
}

$m = new Mobil();
$m->merk = "Honda";
$m->warna = "Biru";
echo $m->info();`),
  S('__construct() adalah method spesial yang otomatis jalan saat object dibuat. Gunanya mengisi data awal, jadi tidak perlu mengisi property satu per satu.', c`<?php
class Kucing {
    public $nama;

    public function __construct($nama) {
        $this->nama = $nama;
    }

    public function meong() {
        return $this->nama . " bilang meong!";
    }
}

$k = new Kucing("Oyen");
echo $k->meong();`, '<code>new Kucing("Oyen")</code> langsung memanggil __construct dengan $nama = "Oyen".'),
  S('Property yang ditandai private hanya bisa diakses dari dalam class. Dari luar harus lewat method.', c`<?php
class Pintu {
    private $terbuka = false;

    public function buka() {
        $this->terbuka = true;
    }

    public function status() {
        return $this->terbuka ? "Terbuka" : "Tertutup";
    }
}

$p = new Pintu();
echo $p->status(), "\n";
$p->buka();
echo $p->status();`),
  Q('Di dalam method, untuk mengakses property $nama milik object itu sendiri, tulis...', ['$nama', '$this->nama', 'this.nama'], 1, 'Tepat!')
],
enkap: [
  S('Enkapsulasi = melindungi data di dalam object supaya tidak diubah sembarangan dari luar.'),
  S('public bisa diakses dari mana saja. private hanya dari dalam class itu sendiri. Lihat apa yang terjadi kalau private diakses dari luar.', c`<?php
class Dompet {
    private $isi = 50000;
}

$d = new Dompet();
echo $d->isi;`, 'Error! Ini justru yang kita mau: data penting tidak bisa diutak-atik langsung.'),
  S('Cara yang benar: sediakan method untuk membaca (getter) dan mengubah data. Di dalam method, kamu bisa menambahkan aturan.', c`<?php
class Dompet {
    private $isi = 0;

    public function tambah($uang) {
        if ($uang > 0) {
            $this->isi += $uang;
        }
    }

    public function ambil($uang) {
        if ($uang > $this->isi) {
            echo "Uang tidak cukup\n";
            return;
        }
        $this->isi -= $uang;
    }

    public function getIsi() {
        return $this->isi;
    }
}

$d = new Dompet();
$d->tambah(20000);
$d->ambil(50000);
$d->ambil(5000);
echo $d->getIsi();`, '<code>return;</code> tanpa nilai berarti keluar dari method lebih awal, jadi pengurangan tidak dijalankan.'),
  Q('Mengapa property saldo sebaiknya private?', ['Supaya lebih cepat', 'Supaya tidak bisa diubah sembarangan dari luar', 'Karena wajib'], 1, 'Betul! Semua perubahan saldo harus lewat method yang punya aturan.'),
  S('static berarti milik CLASS, bukan milik masing-masing object. Semua object berbagi satu nilai yang sama.', c`<?php
class Tiket {
    public static $terjual = 0;

    public function __construct() {
        self::$terjual++;
    }
}

new Tiket();
new Tiket();
new Tiket();
echo "Tiket terjual: " . Tiket::$terjual;`, 'Di dalam class, akses dengan <code>self::$terjual</code>. Dari luar, pakai <code>Tiket::$terjual</code>. Tanda $ tetap ditulis.')
],
waris: [
  S('Pewarisan (inheritance): class anak mewarisi semua property dan method class induk dengan kata extends. Tidak perlu menulis ulang!'),
  S('Class anak bisa menimpa (override) method induk dengan menulis method bernama sama.', c`<?php
class Hewan {
    public $nama;

    public function __construct($nama) {
        $this->nama = $nama;
    }

    public function suara() {
        return "...";
    }

    public function bicara() {
        return $this->nama . ": " . $this->suara();
    }
}

class Bebek extends Hewan {
    public function suara() {
        return "Kwek!";
    }
}

$b = new Bebek("Donal");
echo $b->bicara();`, 'Bebek tidak menulis __construct dan bicara(), tapi tetap punya karena mewarisi Hewan. Saat bicara() memanggil suara(), yang dipakai versi Bebek.'),
  Q('Kata kunci untuk mewarisi class lain adalah...', ['inherit', 'extends', 'parent'], 1, 'Betul!'),
  S('protected mirip private, tapi masih bisa diakses class anak. parent:: dipakai untuk memanggil method milik induk, biasanya constructor.', c`<?php
class Pegawai {
    protected $nama;

    public function __construct($nama) {
        $this->nama = $nama;
    }
}

class Dosen extends Pegawai {
    private $matkul;

    public function __construct($nama, $matkul) {
        parent::__construct($nama);
        $this->matkul = $matkul;
    }

    public function info() {
        return $this->nama . " mengajar " . $this->matkul;
    }
}

$d = new Dosen("Pak Budi", "Basis Data");
echo $d->info();`, '<code>parent::__construct($nama)</code> menyuruh constructor Pegawai mengisi $nama, lalu Dosen mengisi $matkul sendiri.'),
  S('Sekarang Exception: cara menangani error dengan rapi. throw melempar error, try...catch menangkapnya supaya program tidak berhenti mendadak.', c`<?php
function cekUmur($umur) {
    if ($umur < 0) {
        throw new Exception("Umur tidak boleh negatif");
    }
    return "Umur valid";
}

try {
    echo cekUmur(20), "\n";
    echo cekUmur(-5), "\n";
    echo "Baris ini tidak dijalankan";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}`, 'Begitu throw terjadi, PHP langsung lompat ke blok catch. <code>$e->getMessage()</code> mengambil pesan errornya.'),
  Q('Method untuk mengambil pesan dari Exception adalah...', ['getError()', 'getMessage()', 'message()'], 1, 'Tepat!')
],
bos1: [
  S('Ini Arena Bos! Tidak ada materi baru di sini. Kamu harus menggabungkan semua yang sudah dipelajari.'),
  S('Tips melawan bos: (1) baca soal pelan-pelan, (2) pecah jadi langkah kecil, (3) jalankan sering-sering, (4) pakai var_dump kalau bingung isi variabel.'),
  S('Ingat pola penting ini: loop + if + % untuk FizzBuzz, dua variabel yang terus digeser untuk Fibonacci, dan strrev untuk palindrom.', c`<?php
// contoh menggeser dua variabel
$a = 1;
$b = 2;
$c = $a + $b;
$a = $b;
$b = $c;
echo "$a $b";`)
],
bos2: [
  S('Bos kedua menguji kemampuan mengolah teks. Kuncinya: ubah teks jadi array dulu, baru diolah.'),
  S('str_split() memecah string per huruf. strtolower() menyamakan huruf besar-kecil sebelum dibandingkan.', c`<?php
$huruf = str_split(strtolower("PHP"));
print_r($huruf);`),
  S('Untuk menghitung kemunculan kata, pakai array asosiatif sebagai penghitung.', c`<?php
$hitung = [];
foreach (["a", "b", "a"] as $x) {
    if (isset($hitung[$x])) {
        $hitung[$x]++;
    } else {
        $hitung[$x] = 1;
    }
}
print_r($hitung);`)
],
bos3: [
  S('Bos terakhir! Kita bikin logika aplikasi kasir dan sistem nilai, seperti proyek web sungguhan.'),
  S('number_format($angka, 0, ",", ".") mengubah 125000 jadi 125.000, cocok untuk Rupiah.', c`<?php
echo "Rp " . number_format(1250000, 0, ",", ".");`),
  S('usort() mengurutkan array dengan aturan buatanmu. Operator <=> membandingkan dua nilai. Tukar posisi $a dan $b untuk urutan terbesar dulu.', c`<?php
$data = [["n" => 70], ["n" => 95], ["n" => 80]];
usort($data, fn($a, $b) => $b["n"] <=> $a["n"]);
foreach ($data as $d) {
    echo $d["n"], " ";
}`),
  S('Untuk bos final OOP: object bisa disimpan di dalam array, dan property-nya diakses dengan ->.', c`<?php
class Barang {
    public function __construct(public $nama, public $harga) {}
}
$daftar = [new Barang("Buku", 5000), new Barang("Pena", 2000)];
foreach ($daftar as $b) {
    echo $b->nama, ": ", $b->harga, "\n";
}`, '<code>public $nama</code> langsung di parameter constructor adalah jalan pintas PHP 8 untuk membuat dan mengisi property sekaligus.')
]
};

// pelajaran baru: Komentar (disisipkan sebelum Hitung-hitungan)
const KOMENTAR_LESSON = { id: 'komentar', title: 'Komentar', ex: [
  { t: 'Tulis satu <b>komentar</b> (isinya bebas) di atas perintah echo, lalu tampilkan <code>Komentar itu catatan</code>.', s: c`<?php
`, a: c`<?php
// ini komentar pertamaku
echo "Komentar itu catatan";`, h: 'Baris pertama: // tulisan bebas. Baris kedua: echo "Komentar itu catatan";', needRaw: [['(//|#|/\\*)', 'Tambahkan sebuah komentar, misalnya // catatanku']] },
  { t: '"Matikan" baris yang menampilkan <code>Dua</code> dengan menjadikannya komentar (jangan dihapus), sehingga output menjadi:<pre>Satu\nTiga</pre>', s: c`<?php
echo "Satu\n";
echo "Dua\n";
echo "Tiga\n";`, a: c`<?php
echo "Satu\n";
// echo "Dua\n";
echo "Tiga\n";`, h: 'Tambahkan // di depan baris echo "Dua\\n";', needRaw: [['(//|#|/\\*)\\s*echo\\s*"Dua', 'Jadikan baris echo "Dua" sebagai komentar, jangan dihapus.']] }
]};
const EXTRA_EX = {
  angka: { t: 'Gabungkan teks dan hasil hitung dengan koma: tampilkan <code>Hasil: 21</code>, dengan 21 dihitung dari <b>3 dikali 7</b>.', s: c`<?php
`, a: c`<?php
echo "Hasil: ", 3 * 7;`, h: 'echo "Hasil: ", 3 * 7;  — teks dalam kutip, hitungan di luar kutip.', need: [['3\\s*\\*\\s*7', 'Biarkan PHP menghitung 3 * 7.']] }
};
function applySteps(worlds) {
  for (const w of worlds) for (const l of w.lessons) if (STEPS[l.id]) l.steps = STEPS[l.id];
  const desa = worlds[0];
  if (!desa.lessons.some(l => l.id === 'komentar')) {
    KOMENTAR_LESSON.steps = STEPS.komentar;
    const idx = desa.lessons.findIndex(l => l.id === 'angka');
    desa.lessons.splice(idx, 0, KOMENTAR_LESSON);
  }
  const ang = desa.lessons.find(l => l.id === 'angka');
  ang.title = 'Hitung-hitungan';
  if (ang.ex.length === 3) ang.ex.push(EXTRA_EX.angka);
  desa.blurb = 'Tempat semua petualang mulai: echo, komentar, dan berhitung.';
}
applySteps(WORLDS);
if (typeof module !== 'undefined') module.exports = STEPS;
