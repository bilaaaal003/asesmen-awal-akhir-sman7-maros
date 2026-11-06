-- ============================================================
-- APLIKASI ASESMEN AWAL & AKHIR KELAS XII
-- SMAN 7 MAROS
-- Jalankan melalui Supabase > SQL Editor.
--
-- Catatan keamanan:
-- Script ini membuat struktur database dan mengaktifkan RLS.
-- Kebijakan akses belum dibuka secara umum. Jangan menonaktifkan RLS
-- atau memberi akses anon penuh pada tabel jawaban/kunci soal.
-- Integrasikan aplikasi melalui kebijakan/RPC yang sesuai.
-- ============================================================

create extension if not exists pgcrypto;

-- 1. Kelas
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  academic_year text,
  created_at timestamptz not null default now()
);

-- 2. Data siswa
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nisn text not null unique,
  full_name text not null,
  class_id uuid references public.classes(id) on delete set null,
  birth_date date,
  gender text check (gender in ('L', 'P')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_class_id_idx
  on public.students(class_id);
create index if not exists students_full_name_idx
  on public.students(full_name);

-- 3. Paket asesmen: awal atau akhir
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assessment_type text not null
    check (assessment_type in ('awal', 'akhir')),
  description text,
  instructions text,
  academic_year text,
  duration_minutes integer not null default 60
    check (duration_minutes between 1 and 600),
  start_at timestamptz,
  end_at timestamptz,
  is_published boolean not null default false,
  shuffle_questions boolean not null default false,
  shuffle_options boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at is null or start_at is null or end_at > start_at)
);

create index if not exists assessments_type_idx
  on public.assessments(assessment_type);

-- 4. Bank soal
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  topic text,
  question_type text not null default 'multiple_choice'
    check (question_type in ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  question_text text not null,
  explanation text,
  difficulty text check (difficulty in ('mudah', 'sedang', 'sulit')),
  default_score numeric(8,2) not null default 1
    check (default_score >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Pilihan jawaban; correct answer harus tetap terlindungi dari akses siswa
create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_label text not null,
  option_text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  unique (question_id, option_label)
);

create index if not exists question_options_question_id_idx
  on public.question_options(question_id);

-- 6. Hubungan soal dengan asesmen
create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  question_order integer not null default 1,
  score numeric(8,2) not null default 1 check (score >= 0),
  created_at timestamptz not null default now(),
  unique (assessment_id, question_id),
  unique (assessment_id, question_order)
);

-- 7. Percobaan/pelaksanaan asesmen oleh siswa
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  attempt_number integer not null default 1 check (attempt_number >= 1),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'graded', 'cancelled')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(8,2),
  max_score numeric(8,2),
  percentage numeric(5,2) check (percentage is null or percentage between 0 and 100),
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assessment_id, student_id, attempt_number),
  check (submitted_at is null or submitted_at >= started_at)
);

create index if not exists attempts_assessment_id_idx
  on public.assessment_attempts(assessment_id);
create index if not exists attempts_student_id_idx
  on public.assessment_attempts(student_id);
create index if not exists attempts_status_idx
  on public.assessment_attempts(status);

-- 8. Jawaban siswa
create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_option_id uuid references public.question_options(id) on delete set null,
  answer_text text,
  is_correct boolean,
  awarded_score numeric(8,2),
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists answers_attempt_id_idx
  on public.assessment_answers(attempt_id);

-- 9. Pengaturan aplikasi
create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  school_name text not null default 'SMAN 7 Maros',
  school_logo_url text,
  academic_year text,
  default_duration_minutes integer not null default 60
    check (default_duration_minutes between 1 and 600),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, school_name)
values (1, 'SMAN 7 Maros')
on conflict (id) do nothing;

-- 10. Profil admin/staf yang terkait dengan akun Supabase Auth
create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nip text,
  subject text,
  role text not null default 'teacher'
    check (role in ('admin', 'teacher', 'operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Aktifkan Row Level Security pada seluruh tabel aplikasi.
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.app_settings enable row level security;
alter table public.staff_profiles enable row level security;

-- Tidak membuat policy publik yang longgar secara sengaja.
-- Selanjutnya buat policies atau RPC terkontrol untuk:
-- * admin/operator mengelola siswa, kelas, asesmen, soal, dan laporan;
-- * guru mengelola asesmen sesuai kewenangannya;
-- * siswa hanya memulai asesmen yang dipublikasikan, menyimpan jawabannya,
--   dan melihat hasil miliknya sesuai aturan sekolah.
--
-- Jangan memberi SELECT publik pada question_options karena is_correct
-- dapat membocorkan kunci jawaban. Untuk peserta, sajikan pilihan jawaban
-- melalui view/RPC yang tidak mengembalikan is_correct.

-- 11. Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_assessments_updated_at on public.assessments;
create trigger trg_assessments_updated_at
before update on public.assessments
for each row execute function public.set_updated_at();

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

-- 12. View ringkasan nilai untuk dipakai setelah policy admin yang sesuai dibuat.
create or replace view public.assessment_results_summary as
select
  aa.id as attempt_id,
  aa.assessment_id,
  a.title as assessment_title,
  a.assessment_type,
  s.id as student_id,
  s.nisn,
  s.full_name,
  c.name as class_name,
  aa.status,
  aa.started_at,
  aa.submitted_at,
  aa.score,
  aa.max_score,
  aa.percentage
from public.assessment_attempts aa
join public.assessments a on a.id = aa.assessment_id
join public.students s on s.id = aa.student_id
left join public.classes c on c.id = s.class_id;

-- Selesai membuat struktur awal.
-- Jalankan dahulu di project Supabase uji/cadangan sebelum produksi.

-- Pastikan kolom tanggal lahir tersedia pada tabel siswa untuk kebutuhan login.
-- Bagian ini aman dijalankan ulang setelah tabel public.students dibuat.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS birth_date date;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS gender text;
