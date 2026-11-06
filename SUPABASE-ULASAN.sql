-- Kancil PHP Quest: tabel ulasan (publik) dan kotak saran (privat)
-- Jalankan sekali di Supabase: SQL Editor > New query > tempel > Run

create table public.ulasan (
  id bigint generated always as identity primary key,
  dibuat timestamptz not null default now(),
  nama text not null check (char_length(nama) between 1 and 30),
  bintang smallint not null check (bintang between 1 and 5),
  komentar text not null check (char_length(komentar) between 3 and 500),
  tampil boolean not null default true
);
alter table public.ulasan enable row level security;
create policy "baca ulasan tampil" on public.ulasan for select to anon, authenticated using (tampil = true);
create policy "tulis ulasan" on public.ulasan for insert to anon, authenticated with check (tampil = true);

create table public.saran (
  id bigint generated always as identity primary key,
  dibuat timestamptz not null default now(),
  kategori text not null check (kategori in ('materi','bug','fitur','lainnya')),
  pesan text not null check (char_length(pesan) between 5 and 1000),
  kontak text check (kontak is null or char_length(kontak) <= 80),
  nama text check (nama is null or char_length(nama) <= 30)
);
alter table public.saran enable row level security;
-- sengaja TIDAK ada policy select: saran hanya bisa dibaca dari dashboard Supabase
create policy "kirim saran" on public.saran for insert to anon, authenticated with check (true);

-- Menyembunyikan ulasan yang tidak pantas:
-- Table Editor > ulasan > ubah kolom "tampil" jadi false
