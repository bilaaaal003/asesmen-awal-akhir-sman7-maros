import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth/mammoth.browser';
import {
  GraduationCap, LayoutDashboard, ClipboardCheck, BookOpen, Users, BarChart3, LockKeyhole, ShieldCheck,
  Settings, Search, Bell, Sparkles, ArrowUpRight, Clock3, CheckCircle2,
  CircleHelp, ChevronRight, ChevronLeft, LogOut, Menu, X, Download,
  Play, Trophy, Target, Zap, CalendarDays, UserRound, FileText, Plus,
  Eye, EyeOff, RotateCcw, Check, Circle, Layers, SlidersHorizontal, Upload, FileSpreadsheet
  , Trash2, KeyRound
} from 'lucide-react';
import './styles.css';

const initialQuestions = [
  { id: 1, subject: 'Bahasa Indonesia', text: 'Tujuan utama teks editorial adalah …', options: ['Menceritakan pengalaman pribadi penulis', 'Menyampaikan pendapat disertai argumen tentang isu aktual', 'Memberikan petunjuk penggunaan alat', 'Menggambarkan objek secara rinci'], answer: 1 },
  { id: 2, subject: 'Matematika', text: 'Jika f(x) = 2x + 3, maka nilai f(4) adalah …', options: ['8', '10', '11', '14'], answer: 2 },
  { id: 3, subject: 'Bahasa Inggris', text: 'Which sentence expresses an opinion?', options: ['The meeting starts at eight.', 'Water boils at 100°C.', 'I believe this program will help students.', 'She lives in Maros.'], answer: 2 },
  { id: 4, subject: 'Sejarah', text: 'Salah satu tujuan utama Konferensi Asia Afrika tahun 1955 adalah …', options: ['Membentuk pakta militer dunia', 'Mendorong kerja sama dan perdamaian antarbangsa Asia-Afrika', 'Mendirikan organisasi perdagangan Eropa', 'Membagi wilayah kolonial baru'], answer: 1 },
  { id: 5, subject: 'Literasi Digital', text: 'Tindakan paling tepat saat menerima berita yang belum jelas sumbernya adalah …', options: ['Langsung meneruskan ke semua grup', 'Mengubah judul agar lebih menarik', 'Memeriksa sumber dan membandingkan dengan sumber tepercaya', 'Menganggapnya benar jika banyak dibagikan'], answer: 2 },
  { id: 6, subject: 'Matematika', text: 'Rata-rata dari 6, 8, 10, dan 12 adalah …', options: ['8', '9', '10', '11'], answer: 1 },
  { id: 7, subject: 'Bahasa Indonesia', text: 'Kalimat efektif ditandai oleh …', options: ['Penggunaan kata sebanyak mungkin', 'Struktur jelas, hemat, dan sesuai kaidah', 'Pengulangan gagasan yang sama', 'Istilah asing pada setiap kalimat'], answer: 1 },
  { id: 8, subject: 'Penalaran', text: 'Semua peserta yang hadir mengisi daftar hadir. Rani hadir. Kesimpulan yang tepat adalah …', options: ['Rani tidak mengisi daftar hadir', 'Rani mengisi daftar hadir', 'Semua pengisi daftar hadir adalah Rani', 'Rani adalah panitia'], answer: 1 },
  { id: 9, subject: 'Bahasa Inggris', text: 'The closest meaning of “improve” is …', options: ['Make better', 'Make smaller', 'Forget', 'Refuse'], answer: 0 },
  { id: 10, subject: 'Literasi Digital', text: 'Kata sandi yang lebih aman sebaiknya …', options: ['Menggunakan tanggal lahir saja', 'Sama untuk semua akun', 'Panjang, unik, dan sulit ditebak', 'Dibagikan kepada teman dekat'], answer: 2 }
];
const initialStudents = [
  { name: 'Alya Putri', id: '0068123401', class: 'XII IPA 1', birthDate: '2008-04-12', gender: 'P', status: 'Selesai' },
  { name: 'Muhammad Fajar', id: '0068123402', class: 'XII IPA 1', birthDate: '2008-09-21', gender: 'L', status: 'Belum' },
  { name: 'Nadia Rahma', id: '0068123403', class: 'XII IPA 2', birthDate: '2008-01-30', gender: 'P', status: 'Selesai' },
  { name: 'Andi Rizky', id: '0068123404', class: 'XII IPS 1', birthDate: '2008-06-18', gender: 'L', status: 'Belum' },
  { name: 'Nur Aisyah', id: '0068123405', class: 'XII IPA 2', birthDate: '2008-11-07', gender: 'P', status: 'Selesai' },
  { name: 'Rafi Akbar', id: '0068123406', class: 'XII IPS 1', birthDate: '2008-03-25', gender: 'L', status: 'Belum' }
];

function App() {
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('student');
  const [page, setPage] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [assessmentType, setAssessmentType] = useState('awal');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentClass, setStudentClass] = useState('XII IPA 1');
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [students, setStudents] = useState(initialStudents);
  const [importSummary, setImportSummary] = useState('');
  const [questions, setQuestions] = useState(initialQuestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [schoolName, setSchoolName] = useState('SMAN 7 Maros');
  const [assessmentTitle, setAssessmentTitle] = useState('Asesmen Kompetensi Kelas XII');
  const [duration, setDuration] = useState(45);
  const [staffUser, setStaffUser] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ subject: 'Literasi Digital', text: '', options: ['', '', '', ''], answer: 0 });
  const [theme, setTheme] = useState(() => localStorage.getItem('portalTheme') || 'ungu');
  const [assessments, setAssessments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portalAssessments')) || []; }
    catch { return []; }
  });
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    localStorage.setItem('portalTheme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('portalAssessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    if (!started || !selectedAssessment || remainingSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds(current => {
        if (current <= 1) {
          window.clearInterval(timer);
          setSubmitted(true);
          notify('Waktu asesmen telah habis dan jawaban dikumpulkan otomatis.');
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, selectedAssessment]);

  const completed = students.filter(s => s.status === 'Selesai').length;
  const progress = Math.round((completed / students.length) * 100);
  const currentQuestion = questions[qIndex];
  const score = useMemo(() => questions.reduce((sum, q) => sum + (answers[q.id] === q.answer ? 1 : 0), 0), [answers, questions]);

  useEffect(() => {
    if (!supabase) return undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(role, data) {
    if (role === 'student') {
      const found = students.find(s => s.id === data.nisn && s.birthDate === data.birthDate);
      if (!found) throw new Error('Data siswa tidak cocok.');
      setLoginRole('student'); setStudentId(found.id); setStudentName(found.name);
      setStudentClass(found.class || 'XII'); setPage('assessment');
      setStarted(false); setSubmitted(false); setAnswers({}); setQIndex(0); setAssessmentType('awal'); setPage('student-assessments');
      setLoggedIn(true); return;
    }
    if (!supabase) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada file .env.');
    const email = role === 'teacher' ? `${data.nip.trim()}@guru.sman7maros.id` : data.email.trim().toLowerCase();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: data.password });
    if (authError) throw new Error('Login gagal. Periksa NIP/email dan kata sandi.');
    const { data: profile, error: profileError } = await supabase.from('staff_profiles')
      .select('user_id, full_name, nip, subject, role, is_active').eq('user_id', authData.user.id).maybeSingle();
    if (profileError || !profile || !profile.is_active || profile.role !== role) {
      await supabase.auth.signOut();
      throw new Error('Akun tidak memiliki izin untuk masuk sebagai ' + (role === 'admin' ? 'Administrator.' : 'Guru.'));
    }
    if (authData.user.user_metadata?.must_change_password) {
      setStaffUser(profile);
      setLoginRole(role);
      setMustChangePassword(true);
      return;
    }
    setStaffUser(profile); setLoginRole(role); setPage('dashboard'); setLoggedIn(true);
  }
  function notify(message) {
    setNotice(message);
    setTimeout(() => setNotice(''), 2600);
  }
  async function logout() {
    if (loginRole !== 'student' && supabase) await supabase.auth.signOut();
    setShowProfileMenu(false);
    setLoggedIn(false);
    setStaffUser(null);
    setStarted(false);
    setSubmitted(false);
    setAnswers({});
  }
  function openAssessment(type) {
    setAssessmentType(type); setStarted(false); setSubmitted(false); setAnswers({}); setQIndex(0); setPage('assessment');
  }
  function beginAssessment(e) {
    e.preventDefault();
    if (!studentName.trim() || !studentId.trim()) return notify('Isi nama dan NISN terlebih dahulu.');
    setStarted(true);
  }
  function finishAssessment() {
    setSubmitted(true);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: studentName, class: studentClass, status: 'Selesai' } :
      s));
    notify('Jawaban berhasil dikumpulkan!');
  }
  function normalizeBirthDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
    }
    if (typeof value === 'number' && value > 20000 && value < 80000) {
      const d = XLSX.SSF.parse_date_code(value);
      if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
    }
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
      const [y,m,d] = raw.split('-');
      return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    const m = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    return '';
  }
  function downloadStudentTemplate() {
    const rows = [
      ['NISN', 'Nama', 'Kelas', 'Tanggal Lahir', 'Jenis Kelamin'],
      ['0091234567', 'Contoh Nama Siswa', 'XII A', '2008-04-12', 'L'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch:16},{wch:28},{wch:16},{wch:18},{wch:18}];
    const instructions = XLSX.utils.aoa_to_sheet([
      ['PETUNJUK IMPOR DATA SISWA'],
      ['Isi data pada sheet Data Siswa dan hapus baris contoh sebelum digunakan.'],
      ['NISN harus disimpan sebagai teks agar angka nol di depan tidak hilang.'],
      ['Tanggal Lahir gunakan format YYYY-MM-DD, contoh 2008-04-12.'],
      ['Jenis Kelamin isi L atau P. Pastikan data sesuai dokumen sekolah.'],
      ['Login prototipe mencocokkan NISN dan tanggal lahir yang diimpor.'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.utils.book_append_sheet(wb, instructions, 'Petunjuk');
    XLSX.writeFile(wb, 'Template_Impor_Siswa_SMAN_7_Maros.xlsx');
    notify('Template Excel berhasil diunduh.');
  }
  async function importStudentFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(bytes, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
      const imported = [];
      const errors = [];
      rows.forEach((row, index) => {
        const normalized = Object.fromEntries(Object.entries(row).map(([key,value]) => [String(key).trim().toLowerCase().replace(/\s+/g,' '), value]));
        const nisnValue = normalized['nisn'];
        const nisn = String(nisnValue ?? '').trim().replace(/\.0$/, '').padStart(10, '0');
        const name = String(normalized['nama'] ?? normalized['nama siswa'] ?? '').trim();
        const className = String(normalized['kelas'] ?? '').trim();
        const birthDate = normalizeBirthDate(normalized['tanggal lahir'] ?? normalized['tgl lahir'] ?? '');
        const genderRaw = String(normalized['jenis kelamin'] ?? normalized['jk'] ?? '').trim().toUpperCase();
        const gender = ({'LAKI-LAKI':'L','LAKI LAKI':'L','PEREMPUAN':'P','L':'L','P':'P'})[genderRaw] || '';
        if (!nisnValue && !name && !className && !birthDate) return;
        if (!/^\d{10}$/.test(nisn) || !name || !className || !birthDate || !gender) {
          errors.push(`Baris ${index + 2}: periksa NISN, Nama, Kelas, Tanggal Lahir, dan Jenis Kelamin.`);
          return;
        }
        imported.push({ name, id: nisn, class: className, birthDate, gender, status: 'Belum' });
      });
      if (!imported.length) {
        setImportSummary(errors[0] || 'Tidak ada baris data siswa yang ditemukan.');
        notify('Tidak ada data valid yang dapat diimpor.');
        return;
      }
      const merged = new Map(students.map(student => [student.id, student]));
      imported.forEach(student => { const previous = merged.get(student.id); merged.set(student.id, { ...student, status: previous?.status || 'Belum' }); });
      setStudents(Array.from(merged.values()));
      setImportSummary(`${imported.length} siswa berhasil diimpor/diperbarui.${errors.length ? ` ${errors.length} baris dilewati. ${errors[0]}` : ''}`);
      notify(`${imported.length} data siswa berhasil diimpor.`);
    } catch (err) {
      setImportSummary('File tidak dapat dibaca. Gunakan template Excel yang disediakan.');
      notify('Gagal membaca file Excel.');
    } finally {
      event.target.value = '';
    }
  }

  function exportResults() {
    const rows = [['Nama', 'NISN', 'Kelas', 'Jenis Asesmen', 'Jawaban Benar', 'Jumlah Soal', 'Nilai']];
    students.forEach(s => rows.push([s.name, s.id, s.class, assessmentType === 'awal' ? 'Asesmen Awal' : 'Asesmen Akhir', '', questions.length, '']));
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'rekap-asesmen-sman7-maros.csv'; a.click(); URL.revokeObjectURL(url);
    notify('File rekap diunduh.');
  }
  function addQuestion(e) {
    e.preventDefault();
    if (!newQuestion.text.trim() || newQuestion.options.some(o => !o.trim())) return notify('Lengkapi pertanyaan dan semua pilihan jawaban.');
    setQuestions(prev => [...prev, { ...newQuestion, id: Math.max(0, ...prev.map(q => q.id)) + 1 }]);
    setNewQuestion({ subject: 'Literasi Digital', text: '', options: ['', '', '', ''], answer: 0 });
    notify('Soal baru ditambahkan.');
  }

  const navItems = loginRole === 'student' ? [
    { id: 'student-assessments', label: 'Pilih Asesmen', icon: ClipboardCheck, group: 'MENU SISWA' }
  ] : loginRole === 'teacher' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'MENU UTAMA' },
    { id: 'questions', label: 'Bank Soal', icon: BookOpen, group: 'PENGELOLAAN' },
    { id: 'reports', label: 'Hasil & Analitik', icon: BarChart3, group: 'PENGELOLAAN' },
    { id: 'manage-assessments', label: 'Kelola Asesmen', icon: ClipboardCheck, group: 'PENGELOLAAN' }
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'MENU UTAMA' },
    { id: 'assessment', label: 'Pratinjau Asesmen', icon: ClipboardCheck, group: 'MENU UTAMA' },
    { id: 'questions', label: 'Bank Soal', icon: BookOpen, group: 'PENGELOLAAN' },
    { id: 'students', label: 'Data Peserta', icon: Users, group: 'PENGELOLAAN' },
    { id: 'reports', label: 'Hasil & Analitik', icon: BarChart3, group: 'PENGELOLAAN' },
    { id: 'settings', label: 'Pengaturan', icon: Settings, group: 'SISTEM' },
    ...(loginRole === 'admin' ? [{ id: 'staff', label: 'Manajemen Pengguna', icon: ShieldCheck, group: 'SISTEM' }] : []),
    { id: 'manage-assessments', label: 'Kelola Asesmen', icon: ClipboardCheck, group: 'PENGELOLAAN' }
  ];
  const filteredStudents = students.filter(s => `${s.name} ${s.id} ${s.class}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const teacherQuestions = loginRole === 'teacher'
    ? questions.filter(q => q.subject === staffUser?.subject)
    : questions;

  if (passwordRecovery) return <PasswordRecovery onComplete={() => {
    setPasswordRecovery(false);
    if (supabase) supabase.auth.signOut();
  }} />;
  if (mustChangePassword) return <RequiredPasswordChange onComplete={() => {
    setMustChangePassword(false);
    setPage('dashboard');
    setLoggedIn(true);
  }} />;
  if (!loggedIn) return <LoginPortal schoolName={schoolName} students={students} onLogin={handleLogin} />;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-logo"><GraduationCap size={25}/></div>
        <div><strong>ASSESS<span>MENT</span></strong><small>{schoolName}</small></div>
        <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button>
      </div>
      <div className="school-chip"><span className="live-dot"></span> PORTAL ASESMEN XII</div>
      {(loginRole === 'student' ? ['MENU SISWA'] : ['MENU UTAMA', 'PENGELOLAAN', 'SISTEM']).map(group => <div className="nav-group" key={group}>
        <p className="nav-caption">{group}</p>
        {navItems.filter(n => n.group === group).map(n => <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => { setPage(n.id); setMobileNav(false); }}>
          <n.icon size={18}/><span className="nav-label">{n.label}</span>{n.id === 'reports' && <span className="nav-badge">NEW</span>}
        </button>)}
      </div>)}
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><strong>Semangat belajar!</strong><p>Setiap langkah kecil membawamu lebih dekat ke tujuan.</p><button onClick={() => notify('Tetap fokus dan kerjakan dengan jujur!')}>Pesan motivasi <ArrowUpRight size={14}/></button></div>
      </div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)}></div>}
    <main className="main-area">
      <header className="topbar">
        <button className="menu-toggle" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
        <div className="breadcrumb">Portal Sekolah <ChevronRight size={14}/> <b>{navItems.find(n => n.id === page)?.label || 'Asesmen'}</b></div>
        <div className="top-actions">
          <div className="semester-pill"><CalendarDays size={15}/> Tahun Ajaran 2026/2027</div>
          <button className="icon-button" onClick={() => notify('Tidak ada notifikasi baru.')}><Bell size={18}/><i></i></button>
          <div className="profile-menu-wrap">
            <button className="top-avatar profile-menu-trigger" title="Menu pengguna" aria-expanded={showProfileMenu} onClick={() => setShowProfileMenu(open => !open)}>
              {loginRole === 'student' ? (studentName || 'S').slice(0, 1).toUpperCase() : (staffUser?.full_name || 'A').slice(0, 1).toUpperCase()}
            </button>
            {showProfileMenu && <div className="profile-menu">
              <div className="profile-menu-user">
                <strong>{loginRole === 'student' ? studentName : (staffUser?.full_name || 'Pengguna Sekolah')}</strong>
                <small>{loginRole === 'student' ? studentClass : loginRole === 'admin' ? 'Administrator' : 'Guru'}</small>
              </div>
              <button className="profile-menu-logout" onClick={logout}><LogOut size={17}/> Keluar</button>
            </div>}
          </div>
        </div>
      </header>
      <div className="content">
        {page === 'student-assessments' && <StudentAssessmentCenter assessments={assessments} studentName={studentName} selectedAssessment={selectedAssessment} setSelectedAssessment={setSelectedAssessment} started={started} setStarted={setStarted} submitted={submitted} setSubmitted={setSubmitted} answers={answers} setAnswers={setAnswers} qIndex={qIndex} setQIndex={setQIndex} remainingSeconds={remainingSeconds} setRemainingSeconds={setRemainingSeconds} notify={notify}/>}
        {page === 'manage-assessments' && <TeacherAssessmentManager assessments={assessments} setAssessments={setAssessments} staffUser={staffUser} notify={notify}/>}
        {page === 'dashboard' && <Dashboard schoolName={schoolName} assessmentTitle={assessmentTitle} students={students} completed={completed} progress={progress} openAssessment={openAssessment} setPage={setPage} exportResults={exportResults} questions={questions}/>}
        {page === 'assessment' && <section className="page-section">
          <div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> RUANG ASESMEN</div><h1>Asesmen <span className="gradient-text">Kelas XII</span></h1><p>Ukur kemampuanmu, kenali potensimu, dan terus berkembang.</p></div><div className="heading-art"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><GraduationCap size={45}/></div></div>
          {!started && !submitted && <div className="assessment-layout">
            <div className="panel form-panel"><div className="panel-title"><div className="title-icon purple"><ClipboardCheck size={19}/></div><div><h3>Siap untuk memulai?</h3><p>Isi data peserta sebelum mengerjakan soal.</p></div></div>
              <form onSubmit={beginAssessment} className="student-form">
                <label>Jenis asesmen</label><div className="type-switch"><button type="button" className={assessmentType === 'awal' ? 'selected' : ''} onClick={() => setAssessmentType('awal')}><Target size={17}/> Asesmen Awal</button><button type="button" className={assessmentType === 'akhir' ? 'selected' : ''} onClick={() => setAssessmentType('akhir')}><Trophy size={17}/> Asesmen Akhir</button></div>
                <label htmlFor="studentName">Nama lengkap</label><input id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Masukkan nama sesuai data sekolah" required/>
                <label htmlFor="studentId">NISN</label><input id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Masukkan 10 digit NISN" required/>
                <label htmlFor="studentClass">Kelas</label><select id="studentClass" value={studentClass} onChange={e => setStudentClass(e.target.value)}><option>XII IPA 1</option><option>XII IPA 2</option><option>XII IPS 1</option><option>XII IPS 2</option><option>XII Bahasa</option></select>
                <div className="form-note"><CircleHelp size={16}/><span>Pastikan data benar. Jawaban yang dikumpulkan akan digunakan untuk evaluasi pembelajaran.</span></div>
                <button className="btn-primary full" type="submit">Mulai Mengerjakan <ChevronRight size={18}/></button>
              </form>
            </div>
            <div className="assessment-info"><div className="info-illustration"><div className="floating-star star-a">✦</div><div className="floating-star star-b">✧</div><div className="big-book"><BookOpen size={54}/></div><div className="mini-card card-a"><CheckCircle2 size={16}/> Fokus & teliti</div><div className="mini-card card-b"><Zap size={16}/> Tunjukkan kemampuanmu</div></div><h3>Persiapkan dirimu!</h3><p>Kerjakan setiap soal dengan tenang. Baca pertanyaan dengan saksama dan pilih jawaban yang paling tepat.</p><div className="info-stats"><div><Clock3 size={17}/><b>{duration} menit</b><small>Durasi</small></div><div><FileText size={17}/><b>{questions.length} soal</b><small>Jumlah soal</small></div><div><Layers size={17}/><b>5 topik</b><small>Kompetensi</small></div></div></div>
          </div>}
          {started && !submitted && currentQuestion && <div className="quiz-layout"><div className="panel quiz-panel"><div className="quiz-top"><span className="question-count">PERTANYAAN {qIndex + 1} <span>/ {questions.length}</span></span><span className="subject-chip">{currentQuestion.subject}</span></div><div className="progress-track"><div className="progress-fill" style={{width: `${((qIndex + 1) / questions.length) * 100}%`}}></div></div><h2 className="question-text">{currentQuestion.text}</h2><div className="answer-list">{currentQuestion.options.map((opt, i) => <button key={i} className={`answer-option ${answers[currentQuestion.id] === i ? 'chosen' : ''}`} onClick={() => setAnswers(prev => ({...prev, [currentQuestion.id]: i}))}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{opt}</span>{answers[currentQuestion.id] === i && <CheckCircle2 className="answer-check" size={19}/>}</button>)}</div><div className="quiz-footer"><button className="btn-ghost" disabled={qIndex === 0} onClick={() => setQIndex(i => i-1)}><ChevronLeft size={17}/> Sebelumnya</button><span className="answered-count">{Object.keys(answers).length} dari {questions.length} dijawab</span>{qIndex < questions.length - 1 ? <button className="btn-primary" onClick={() => setQIndex(i => i+1)}>Berikutnya <ChevronRight size={17}/></button> : <button className="btn-primary" onClick={finishAssessment}>Kumpulkan <Check size={17}/></button>}</div></div><aside className="panel question-nav"><h3>Navigasi soal</h3><p>Pilih nomor untuk berpindah soal.</p><div className="question-grid">{questions.map((q, i) => <button key={q.id} className={`${qIndex === i ? 'current' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`} onClick={() => setQIndex(i)}>{i+1}</button>)}</div><div className="legend"><span><i className="legend-current"></i> Sedang dibuka</span><span><i className="legend-done"></i> Terjawab</span><span><i className="legend-empty"></i> Belum dijawab</span></div><button className="btn-ghost full" onClick={() => {setStarted(false);setAnswers({});}}>Batalkan asesmen</button></aside></div>}
          {submitted && <div className="panel result-panel"><div className="result-confetti">✦ ✧ ✦</div><div className="result-icon"><Trophy size={36}/></div><div className="eyebrow">ASESMEN SELESAI</div><h2>Kerja bagus, {studentName.split(' ')[0]}!</h2><p>Jawabanmu sudah dikumpulkan. Terus belajar dan tingkatkan kemampuanmu.</p><div className="score-card"><small>Skor latihan (demo)</small><strong>{Math.round(score / questions.length * 100)}</strong><span>dari 100 poin</span></div><div className="result-detail"><span><CheckCircle2 size={17}/> Terjawab: {Object.keys(answers).length} soal</span><span><FileText size={17}/> Total: {questions.length} soal</span><span><Clock3 size={17}/> {assessmentType === 'awal' ? 'Asesmen Awal' : 'Asesmen Akhir'}</span></div><button className="btn-primary" onClick={() => {setStarted(false);setSubmitted(false);setAnswers({});setPage('dashboard');}}>Kembali ke Dashboard <ChevronRight size={17}/></button><p className="demo-warning">Nilai di atas hanya hasil demo dari contoh soal, bukan nilai resmi sekolah.</p></div>}
        </section>}
        {page === 'questions' && loginRole === 'teacher' && <section className="page-section">
          <div className="page-heading"><div><div className="eyebrow"><BookOpen size={14}/> MATA PELAJARAN SAYA</div><h1>Bank <span className="gradient-text">Soal</span></h1><p>Soal yang ditampilkan hanya untuk mata pelajaran {staffUser?.subject || 'Anda'}.</p></div><div className="heading-art"><BookOpen size={42}/></div></div>
          <div className="metrics-grid compact"><Metric icon={FileText} label="Total Soal" value={teacherQuestions.length} color="purple" foot={staffUser?.subject || 'Mata pelajaran guru'}/><Metric icon={Target} label="Mata Pelajaran" value={staffUser?.subject || '-'} color="blue" foot="Akses bank soal"/></div>
          <div className="panel table-panel"><div className="panel-heading"><div><h3>Soal {staffUser?.subject || 'Mata Pelajaran'}</h3><p>Hanya soal milik mata pelajaran Anda yang dapat digunakan.</p></div></div><div className="table-wrap"><table><thead><tr><th>No.</th><th>Pertanyaan</th><th>Pilihan jawaban</th><th>Kunci</th></tr></thead><tbody>{teacherQuestions.map((q,i)=><tr key={q.id}><td>{i+1}</td><td className="question-cell">{q.text}</td><td>{q.options.join(', ')}</td><td><span className="key-pill">{String.fromCharCode(65+q.answer)}</span></td></tr>)}</tbody></table>{teacherQuestions.length===0&&<div className="empty-state">Belum ada soal untuk mata pelajaran {staffUser?.subject || 'Anda'}.</div>}</div></div>
        </section>}
        {page === 'questions' && loginRole !== 'teacher' && <section className="page-section">
          <div className="page-heading"><div><div className="eyebrow"><BookOpen size={14}/> PENGELOLAAN KONTEN</div><h1>Bank <span className="gradient-text">Soal</span></h1><p>Kelola pertanyaan untuk asesmen awal dan akhir kelas XII.</p></div><div className="heading-art"><BookOpen size={42}/></div></div>
          <div className="metrics-grid compact"><Metric icon={FileText} label="Total Soal" value={questions.length} color="purple" foot="Semua mata pelajaran"/><Metric icon={Layers} label="Mata Pelajaran" value={new Set(questions.map(q=>q.subject)).size} color="blue" foot="Topik terdaftar"/><Metric icon={Target} label="Jenis Asesmen" value="2" color="orange" foot="Awal dan akhir"/></div>
          <div className="panel table-panel"><div className="panel-heading"><div><h3>Daftar pertanyaan</h3><p>Contoh soal bawaan dapat disesuaikan oleh pengelola.</p></div><span className="small-tag">{questions.length} soal</span></div><div className="table-wrap"><table><thead><tr><th>No.</th><th>Pertanyaan</th><th>Topik</th><th>Kunci</th></tr></thead><tbody>{questions.map((q,i)=><tr key={q.id}><td>{String(i+1).padStart(2,'0')}</td><td className="question-cell">{q.text}</td><td><span className="subject-chip">{q.subject}</span></td><td><span className="key-pill">{String.fromCharCode(65+q.answer)}</span></td></tr>)}</tbody></table></div></div>
          <div className="panel add-question-panel"><div className="panel-heading"><div><h3><Plus size={18}/> Tambah soal baru</h3><p>Soal baru akan muncul dalam sesi asesmen demo.</p></div></div><form className="add-question-form" onSubmit={addQuestion}><div className="form-two"><div><label>Topik</label><select value={newQuestion.subject} onChange={e=>setNewQuestion(p=>({...p,subject:e.target.value}))}><option>Literasi Digital</option><option>Matematika</option><option>Bahasa Indonesia</option><option>Bahasa Inggris</option><option>Sejarah</option><option>Penalaran</option></select></div><div><label>Pertanyaan</label><input value={newQuestion.text} onChange={e=>setNewQuestion(p=>({...p,text:e.target.value}))} placeholder="Tuliskan pertanyaan..." /></div></div><label>Pilihan jawaban</label><div className="options-editor">{newQuestion.options.map((o,i)=><div className="option-edit" key={i}><span>{String.fromCharCode(65+i)}</span><input value={o} onChange={e=>setNewQuestion(p=>({...p,options:p.options.map((x,j)=>j===i?e.target.value:x)}))} placeholder={`Pilihan ${String.fromCharCode(65+i)}`} /></div>)}</div><label>Kunci jawaban benar</label><div className="correct-picker">{newQuestion.options.map((o,i)=><button type="button" className={newQuestion.answer===i?'picked':''} onClick={()=>setNewQuestion(p=>({...p,answer:i}))} key={i}>{String.fromCharCode(65+i)}</button>)}</div><button className="btn-primary" type="submit"><Plus size={17}/> Simpan Soal</button></form></div>
        </section>}
        {page === 'students' && <section className="page-section"><div className="page-heading"><div><div className="eyebrow"><Users size={14}/> DATA AKADEMIK</div><h1>Data <span className="gradient-text">Peserta</span></h1><p>Kelola data peserta termasuk tanggal lahir untuk login siswa.</p></div><div className="heading-art"><Users size={42}/></div></div><div className="metrics-grid compact"><Metric icon={Users} label="Total Peserta" value={students.length} color="purple" foot="Data pada sesi ini"/><Metric icon={CheckCircle2} label="Sudah Selesai" value={completed} color="green" foot={`${progress}% dari peserta`}/><Metric icon={Clock3} label="Belum Selesai" value={students.length-completed} color="orange" foot="Perlu dipantau"/></div><div className="panel import-panel"><div className="panel-heading"><div><h3><FileSpreadsheet size={18}/> Impor data siswa dari Excel</h3><p>Kolom wajib: NISN, Nama, Kelas, Tanggal Lahir, Jenis Kelamin.</p></div></div><div className="import-actions"><label className="btn-primary import-file-label"><Upload size={17}/> Pilih file Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={importStudentFile} /></label><button className="btn-outline" onClick={downloadStudentTemplate}><Download size={16}/> Unduh Template Excel</button></div>{importSummary && <div className="import-summary"><CheckCircle2 size={16}/><span>{importSummary}</span></div>}<div className="demo-warning-box"><CircleHelp size={18}/><span>Impor ini memperbarui data di memori browser saja, belum menyimpan ke Supabase. Gunakan data uji terlebih dahulu dan lindungi tanggal lahir siswa.</span></div></div><div className="panel table-panel"><div className="panel-heading"><div><h3>Daftar peserta didik</h3><p>Gunakan pencarian untuk menemukan peserta.</p></div><div className="table-tools"><div className="search-box"><Search size={16}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Cari nama, NISN, kelas..." /></div><button className="btn-outline" onClick={exportResults}><Download size={16}/> Ekspor CSV</button></div></div><div className="table-wrap"><table><thead><tr><th>Peserta</th><th>NISN</th><th>Kelas</th><th>Tanggal Lahir</th><th>Status Asesmen</th></tr></thead><tbody>{filteredStudents.map(s=><tr key={s.id}><td><div className="person-cell"><div className="table-avatar">{s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><b>{s.name}</b></div></td><td>{s.id}</td><td>{s.class}</td><td>{s.birthDate || 'Belum diisi'}</td><td><span className={`status-pill ${s.status==='Selesai'?'success':'pending'}`}><i></i>{s.status}</span></td></tr>)}</tbody></table>{filteredStudents.length===0&&<div className="empty-state">Tidak ada peserta yang cocok.</div>}</div><div className="table-foot">Menampilkan {filteredStudents.length} dari {students.length} peserta.</div></div></section>}
        {page === 'reports' && <section className="page-section"><div className="page-heading"><div><div className="eyebrow"><BarChart3 size={14}/> RINGKASAN PEMBELAJARAN</div><h1>Hasil & <span className="gradient-text">Analitik</span></h1><p>Ringkasan progres pelaksanaan asesmen peserta didik.</p></div><div className="heading-art"><BarChart3 size={42}/></div></div><div className="metrics-grid"><Metric icon={Users} label="Peserta Terdata" value={students.length} color="purple" foot="Seluruh kelas XII"/><Metric icon={CheckCircle2} label="Telah Mengerjakan" value={completed} color="green" foot={`${progress}% partisipasi`}/><Metric icon={Clock3} label="Belum Mengerjakan" value={students.length-completed} color="orange" foot="Perlu tindak lanjut"/><Metric icon={Target} label="Jumlah Soal" value={questions.length} color="blue" foot="Bank soal aktif"/></div><div className="report-grid"><div className="panel report-panel"><div className="panel-heading"><div><h3>Partisipasi peserta</h3><p>Proporsi status dari data contoh.</p></div><span className="small-tag">Live preview</span></div><div className="donut-wrap"><div className="donut" style={{'--progress':`${progress}%`}}><div><strong>{progress}%</strong><small>Partisipasi</small></div></div><div className="donut-legend"><span><i className="dot-purple"></i><b>{completed}</b> Selesai</span><span><i className="dot-grey"></i><b>{students.length-completed}</b> Belum</span></div></div></div><div className="panel report-panel"><div className="panel-heading"><div><h3>Progres per kelas</h3><p>Jumlah peserta selesai per kelas.</p></div></div><div className="bar-chart">{['XII IPA 1','XII IPA 2','XII IPS 1','XII IPS 2'].map((c,i)=>{const total=students.filter(s=>s.class===c).length;const done=students.filter(s=>s.class===c&&s.status==='Selesai').length;return <div className="bar-row" key={c}><div><span>{c}</span><b>{done}/{total}</b></div><div className="bar-track"><div style={{width:`${total?done/total*100:0}%`}}></div></div></div>})}</div></div></div><div className="panel table-panel"><div className="panel-heading"><div><h3>Unduh rekap peserta</h3><p>Unduh data ringkas untuk diolah lebih lanjut.</p></div><button className="btn-primary" onClick={exportResults}><Download size={17}/> Unduh CSV</button></div><p className="report-note">Catatan: hasil nilai resmi memerlukan penyimpanan jawaban per peserta di basis data. Paket demo ini belum menyimpan jawaban secara permanen.</p></div></section>}
        {page === 'staff' && loginRole === 'admin' && <TeacherManagement notify={notify} />}
        {page === 'settings' && <section className="page-section"><div className="page-heading"><div><div className="eyebrow"><Settings size={14}/> KONFIGURASI APLIKASI</div><h1>Pengaturan <span className="gradient-text">Sistem</span></h1><p>Atur identitas sekolah, asesmen, dan tampilan portal.</p></div><div className="heading-art"><SlidersHorizontal size={42}/></div></div><div className="panel settings-panel"><div className="panel-heading"><div><h3>Identitas sekolah dan warna portal</h3><p>Warna tema langsung diterapkan pada login siswa, guru, dan administrator.</p></div></div><form onSubmit={e=>{e.preventDefault();notify('Pengaturan dan warna tema diperbarui.');}} className="settings-form"><label>Nama sekolah<input value={schoolName} onChange={e=>setSchoolName(e.target.value)}/></label><label>Judul asesmen<input value={assessmentTitle} onChange={e=>setAssessmentTitle(e.target.value)}/></label><label>Durasi pengerjaan default (menit)<input type="number" min="5" max="180" value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label><label>Warna tema<select value={theme} onChange={e=>setTheme(e.target.value)}><option value="ungu">Ungu & Biru — Modern</option><option value="biru">Biru — Profesional</option><option value="hijau">Hijau — Segar</option><option value="merah">Merah & Oranye — Hangat</option></select></label><div className="theme-preview"><span className={`theme-swatch ${theme}`}></span><span>Pratinjau warna portal: {theme}</span></div><div className="demo-warning-box"><CircleHelp size={18}/><span>Tema disimpan pada browser ini dan berlaku untuk seluruh halaman login serta ruang asesmen.</span></div><button className="btn-primary" type="submit"><Check size={17}/> Simpan Pengaturan</button></form></div></section>}
      </div>
      <footer className="footer"><span>© 2026 <b>{schoolName}</b> • Portal Asesmen Kelas XII</span><span>Dibuat untuk mendukung pembelajaran <Sparkles size={13}/></span></footer>
    </main>
    {notice && <div className="toast"><div><CheckCircle2 size={18}/></div>{notice}</div>}
  </div>;
}

function LoginPortal({ schoolName, onLogin, students }) {
  const [view, setView] = useState('welcome');
  const [accessCode, setAccessCode] = useState('');
  const [role, setRole] = useState('student');
  const [nisn, setNisn] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  function submitAdminAccess(e) {
    e.preventDefault();
    setError('');
    if (accessCode.trim().toUpperCase() !== 'SMAN07MRS') {
      setError('Kode akses administrator tidak valid.');
      return;
    }
    setAccessCode('');
    setView('login');
  }
  async function sendPasswordReset(e) {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    if (!username.trim()) {
      setError('Masukkan email administrator terlebih dahulu.');
      return;
    }
    if (!supabase) {
      setError('Supabase belum dikonfigurasi.');
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(username.trim().toLowerCase(), { redirectTo });
      if (resetError) throw resetError;
      setForgotMessage('Jika email terdaftar, tautan pemulihan telah dikirim. Periksa kotak masuk dan folder spam.');
    } catch (resetError) {
      setError(resetError.message || 'Tautan pemulihan gagal dikirim.');
    } finally {
      setLoading(false);
    }
  }
  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    if (role === 'student') {
      if (!nisn.trim() || !birthDate) { setError('Masukkan NISN dan tanggal lahir.'); setLoading(false); return; }
      const matched = students.find(s => s.id === nisn.trim() && s.birthDate === birthDate);
      if (!matched) { setError('Data siswa tidak cocok. Periksa NISN dan tanggal lahir, atau hubungi operator sekolah.'); setLoading(false); return; }
      try { await onLogin('student', { nisn: nisn.trim(), birthDate }); } catch (err) { setError(err.message); } finally { setLoading(false); }
    } else if (role === 'teacher') {
      if (!username.trim() || !password) { setError('Masukkan NIP dan kata sandi.'); setLoading(false); return; }
      try { await onLogin('teacher', { nip: username.trim(), password }); } catch (err) { setError(err.message); } finally { setLoading(false); }
    } else {
      if (!username.trim() || !password) { setError('Masukkan email dan kata sandi administrator.'); setLoading(false); return; }
      try { await onLogin('admin', { email: username.trim(), password }); } catch (err) { setError(err.message); } finally { setLoading(false); }
    }
  }
  const roleTitle = role === 'student' ? 'Siswa' : role === 'teacher' ? 'Guru' : 'Administrator';
  if (view === 'welcome') return <main className="portal-welcome-screen">
    <div className="portal-welcome-card"><div className="portal-welcome-logo"><GraduationCap size={38}/></div><div className="login-eyebrow"><Sparkles size={14}/> PORTAL ASESMEN DIGITAL</div><h1>Portal Asesmen<br/><span>{schoolName}</span></h1><p>Kelola dan kerjakan asesmen dalam satu portal terpadu yang aman untuk seluruh warga sekolah.</p><button className="login-submit portal-enter-button" onClick={() => setView('roles')}>Masuk ke Aplikasi <ChevronRight size={18}/></button></div>
  </main>;
  if (view === 'roles') return <main className="role-picker-screen">
    <section className="role-picker"><button className="role-picker-back login-text-button" onClick={() => setView('welcome')}>← Kembali</button><div className="login-eyebrow"><Sparkles size={14}/> PILIH PERAN MASUK</div><h1>Masuk sebagai siapa?</h1><p>Pilih jenis akun yang sesuai untuk melanjutkan ke halaman login.</p><div className="role-card-grid">
      <button className="role-card" onClick={() => { setRole('student'); setView('login'); }}><span><GraduationCap size={38}/></span><h2>Siswa</h2><p>Mengerjakan asesmen dan melihat hasil.</p><b>Masuk sebagai Siswa <ChevronRight size={16}/></b></button>
      <button className="role-card teacher" onClick={() => { setRole('teacher'); setView('login'); }}><span><UserRound size={38}/></span><h2>Guru</h2><p>Menyiapkan soal dan mengelola asesmen.</p><b>Masuk sebagai Guru <ChevronRight size={16}/></b></button>
      <button className="role-card admin" onClick={() => { setRole('admin'); setView('admin-access'); }}><span><ShieldCheck size={38}/></span><h2>Administrator</h2><p>Mengelola pengguna, sistem, dan tema.</p><b>Masuk sebagai Administrator <ChevronRight size={16}/></b></button>
    </div></section>
  </main>;
  if (view === 'admin-access') return <main className="login-screen recovery-screen"><section className="login-card recovery-card">
    <button className="login-text-button login-back-button" type="button" onClick={() => { setView('roles'); setAccessCode(''); setError(''); }}>← Pilih peran lain</button>
    <div className="login-card-head"><span className="login-card-icon"><ShieldCheck size={20}/></span><div><h2>Akses Administrator</h2><p>Masukkan kode akses untuk melanjutkan.</p></div></div>
    <form className="login-form" onSubmit={submitAdminAccess}>
      <label>Kode akses<input value={accessCode} onChange={e=>setAccessCode(e.target.value.toUpperCase())} placeholder="Masukkan kode akses" autoComplete="off" required /></label>
      {error && <div className="login-error">{error}</div>}
      <button className="login-submit" type="submit">Lanjutkan <ChevronRight size={18}/></button>
    </form>
  </section></main>;
  return <div className="login-screen">
    <div className="login-decoration login-decoration-one"></div><div className="login-decoration login-decoration-two"></div>
    <div className="login-layout">
      <section className="login-intro">
        <div className="login-brand-mark"><GraduationCap size={30}/></div>
        <div className="login-eyebrow"><Sparkles size={14}/> PORTAL ASESMEN DIGITAL</div>
        <h1>Kenali kemampuan.<br/><span>Raih potensi terbaik.</span></h1>
        <p>Portal Asesmen Awal dan Asesmen Akhir untuk peserta didik kelas XII {schoolName}.</p>
        <div className="login-feature-list"><div><CheckCircle2 size={17}/> Akses asesmen dengan mudah</div><div><ShieldCheck size={17}/> Ruang belajar yang terarah</div><div><BarChart3 size={17}/> Pantau progres pembelajaran</div></div>
        <div className="login-school-foot">© 2026 {schoolName} · Portal Asesmen Kelas XII</div>
      </section>
      <section className="login-card">
        <button className="login-text-button login-back-button" type="button" onClick={() => { setView('roles'); setError(''); }}>← Pilih peran lain</button>
        <div className="login-card-head"><span className="login-card-icon"><LockKeyhole size={20}/></span><div><h2>Selamat datang!</h2><p>Silakan masuk untuk melanjutkan.</p></div></div>
        <form className="login-form" onSubmit={submit}>
          {role === 'student' ? <><div className="login-form-title"><h3>Login Siswa</h3><p>Gunakan data diri yang terdaftar di sekolah.</p></div><label>NISN<input inputMode="numeric" autoComplete="username" value={nisn} onChange={e=>setNisn(e.target.value)} placeholder="Masukkan NISN" required /></label><label>Tanggal lahir<input type="date" autoComplete="bday" value={birthDate} onChange={e=>setBirthDate(e.target.value)} required /></label><div className="login-hint"><CircleHelp size={15}/> Pastikan NISN dan tanggal lahir sesuai data sekolah.</div></> : <>{forgotPassword && role === 'admin' ? <><div className="login-form-title"><h3>Pemulihan kata sandi</h3><p>Masukkan email yang terdaftar pada akun administrator.</p></div><label>Email administrator<input type="email" autoComplete="email" value={username} onChange={e=>setUsername(e.target.value)} placeholder="nama@sekolah.sch.id" required /></label></> : <><div className="login-form-title"><h3>Login {roleTitle}</h3><p>{role==='admin'?'Masuk untuk mengatur sistem dan akun administrator.':'Masuk menggunakan akun resmi guru.'}</p></div><label>{role==='admin'?'Email administrator':'NIP'}<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder={role==='admin'?'Email administrator':'Masukkan NIP guru'} required /></label><label>Kata sandi<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan kata sandi" required /></label>{role==='admin' && <button className="login-text-button" type="button" onClick={()=>{setForgotPassword(true);setError('');setForgotMessage('');}}>Lupa kata sandi atau email?</button>}{role==='admin' && <div className="login-hint"><ShieldCheck size={15}/> Gunakan email administrator yang terdaftar di Supabase Auth.</div>}{role==='teacher' && <div className="login-hint"><ShieldCheck size={15}/> Gunakan NIP dan kata sandi yang dibuat oleh Administrator.</div>}</>}</>}
          {error && <div className="login-error">{error}</div>}
          {forgotMessage && <div className="login-success">{forgotMessage}</div>}
          {forgotPassword && role === 'admin' ? <><button className="login-submit" type="button" disabled={loading} onClick={sendPasswordReset}>{loading ? 'Mengirim...' : 'Kirim tautan pemulihan'} <ChevronRight size={18}/></button><button className="login-text-button login-back-button" type="button" onClick={()=>{setForgotPassword(false);setError('');setForgotMessage('');}}>Kembali ke login</button><div className="login-hint"><CircleHelp size={15}/> Jika email juga lupa, buka Supabase Dashboard → Authentication → Users untuk melihat atau memperbarui email admin.</div></> : <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Memverifikasi...' : `Masuk sebagai ${roleTitle}`} <ChevronRight size={18}/></button>}
        </form>
        <div className="login-demo-notice"><CircleHelp size={15}/><span><b>Informasi:</b> Login Admin dan Guru menggunakan Supabase Auth. Login siswa pada paket ini masih berupa prototipe lokal dan belum boleh digunakan untuk asesmen resmi.</span></div>
      </section>
    </div>
  </div>;
}

function RequiredPasswordChange({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Kata sandi baru minimal 8 karakter.');
    if (password !== confirmation) return setError('Konfirmasi kata sandi tidak sama.');
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData, error: userError } = await supabase.auth.updateUser({ password, data: { must_change_password: false } });
      if (userError) throw userError;
      if (!userData.user || !sessionData.session) throw new Error('Sesi login tidak ditemukan.');
      onComplete();
    } catch (err) { setError(err.message || 'Kata sandi gagal diperbarui.'); }
    finally { setSaving(false); }
  }
  return <main className="login-screen recovery-screen"><section className="login-card recovery-card"><span className="login-card-icon"><KeyRound size={20}/></span><div className="login-form-title"><h3>Ganti kata sandi sementara</h3><p>Administrator telah mereset akun Anda. Buat kata sandi baru untuk melanjutkan.</p></div><form className="login-form" onSubmit={submit}><label>Kata sandi baru<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" required /></label><label>Konfirmasi kata sandi<input type="password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} autoComplete="new-password" required /></label>{error && <div className="login-error">{error}</div>}<button className="login-submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan & Masuk'} <ChevronRight size={18}/></button></form></section></main>;
}

function TeacherAssessmentManager({ assessments, setAssessments, staffUser, notify }) {
  const blank = { title: '', subject: staffUser?.subject || '', code: '', duration: 45, type: 'awal', is_active: false, questions: [] };
  const [form, setForm] = useState(blank);
  const [question, setQuestion] = useState({ text: '', options: ['', '', '', ''], answer: 0 });
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [importing, setImporting] = useState(false);

  async function importWordQuestions(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      notify('Gunakan file Word dengan format .docx.');
      e.target.value = '';
      return;
    }
    setImporting(true);
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      const text = result.value.replace(/\r/g, '');
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const parsed = [];
      let current = null;
      let answerLetters = {};
      const answerLine = lines.find(line => /^(kunci\s*jawaban|jawaban|answer\s*key)\s*:?/i.test(line));
      if (answerLine) {
        const matches = [...answerLine.matchAll(/(\d{1,2})\s*[.:=-]\s*([A-D])/gi)];
        matches.forEach(match => { answerLetters[Number(match[1])] = match[2].toUpperCase().charCodeAt(0) - 65; });
      }
      lines.forEach(line => {
        const questionMatch = line.match(/^(\d+)[.)]\s*(.+)$/);
        const optionMatch = line.match(/^([A-D])[.)]\s*(.+)$/i);
        if (questionMatch) {
          if (current?.text && current.options.length) parsed.push(current);
          current = { id: `import-${Date.now()}-${parsed.length}`, text: questionMatch[2], options: ['', '', '', ''], answer: 0 };
        } else if (optionMatch && current) {
          const index = optionMatch[1].toUpperCase().charCodeAt(0) - 65;
          if (index < 4) current.options[index] = optionMatch[2];
        } else if (current && !/^(kunci\s*jawaban|jawaban|answer\s*key)/i.test(line)) {
          if (!current.options.some(option => option === line)) current.text += ` ${line}`;
        }
      });
      if (current?.text && current.options.length) parsed.push(current);
      parsed.forEach((item, index) => {
        if (answerLetters[index + 1] !== undefined) item.answer = answerLetters[index + 1];
      });
      if (!parsed.length) notify('Format soal tidak dikenali. Gunakan format nomor soal dan pilihan A-D.');
      else { setImportedQuestions(parsed); notify(`${parsed.length} soal berhasil dikenali dan siap diperiksa.`); }
    } catch (error) {
      notify(`File Word gagal dibaca: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  function addImportedQuestions() {
    if (!importedQuestions.length) return;
    const invalid = importedQuestions.some(item => !item.text.trim() || item.options.some(option => !option.trim()));
    if (invalid) return notify('Lengkapi pertanyaan dan semua pilihan A-D sebelum menambahkan.');
    setForm(current => ({ ...current, questions: [...current.questions, ...importedQuestions.map(item => ({ ...item, id: Date.now() + Number(item.id.split('-').pop()) }))] }));
    setImportedQuestions([]);
    notify('Soal dari Word ditambahkan ke asesmen.');
  }

  function addQuestion(e) {
    e.preventDefault();
    if (!question.text.trim() || question.options.some(option => !option.trim())) return;
    setForm(current => ({ ...current, questions: [...current.questions, { ...question, id: Date.now() }] }));
    setQuestion({ text: '', options: ['', '', '', ''], answer: 0 });
  }

  function createAssessment(e) {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!form.title.trim() || !form.subject.trim() || !code || form.questions.length === 0) {
      notify('Lengkapi judul, mata pelajaran, kode, dan minimal satu soal.');
      return;
    }
    if (assessments.some(item => item.code === code)) {
      notify('Kode asesmen sudah digunakan.');
      return;
    }
    setAssessments(items => [...items, {
      ...form, code, id: `assessment-${Date.now()}`,
      teacher: staffUser?.full_name || 'Guru', created_at: new Date().toISOString(),
    }]);
    setForm(blank);
    notify('Asesmen berhasil dibuat.');
  }

  function toggleAssessment(id) {
    setAssessments(items => items.map(item => item.id === id ? { ...item, is_active: !item.is_active } : item));
  }

  return <section className="page-section assessment-manager">
    <div className="page-heading"><div><div className="eyebrow"><ClipboardCheck size={14}/> KELOLA ASESMEN</div><h1>Buat & aktifkan <span className="gradient-text">Asesmen</span></h1><p>Atur mata pelajaran, kode akses, durasi, soal, dan status aktif.</p></div><div className="heading-art"><FileText size={42}/></div></div>
    <div className="assessment-manager-grid">
      <div className="panel assessment-builder">
        <div className="panel-heading"><div><h3>Asesmen baru</h3><p>Asesmen aktif dapat dipilih siswa menggunakan kode.</p></div></div>
        <form className="settings-form" onSubmit={createAssessment}>
          <div className="form-grid"><label>Judul asesmen<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Contoh: Asesmen Akhir Semester"/></label><label>Mata pelajaran<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Contoh: Matematika"/></label><label>Kode asesmen<input required maxLength={12} value={form.code} onChange={e=>setForm({...form,code:e.target.value.replace(/\s/g,'').toUpperCase()})} placeholder="MTK12A"/></label><label>Durasi (menit)<input type="number" min="5" max="180" value={form.duration} onChange={e=>setForm({...form,duration:Number(e.target.value)})}/></label></div>
          <label>Jenis asesmen<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="awal">Asesmen Awal</option><option value="akhir">Asesmen Akhir</option></select></label>
          <div className="word-import-panel"><div className="word-import-copy"><Upload size={20}/><div><h4>Unggah soal Word (.docx)</h4><p>Gunakan format 1), A), atau 1., A. Tulis kunci seperti “Kunci jawaban: 1-A, 2-B”.</p></div></div><label className="btn-outline import-word-button">{importing ? 'Mengenali soal...' : 'Pilih File Word'}<input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={importWordQuestions}/></label></div>
          {importedQuestions.length > 0 && <div className="imported-question-panel"><div className="panel-heading"><div><h4>Hasil pengenalan Word</h4><p>Periksa dan ubah soal sebelum ditambahkan ke asesmen.</p></div><button className="btn-outline" type="button" onClick={()=>setImportedQuestions([])}>Hapus semua</button></div>{importedQuestions.map((item,index)=><div className="imported-question-card" key={item.id}><div className="imported-question-title"><b>Soal {index+1}</b><button type="button" onClick={()=>setImportedQuestions(current=>current.filter((_,i)=>i!==index))}><X size={16}/></button></div><label>Pertanyaan<textarea value={item.text} onChange={e=>setImportedQuestions(current=>current.map((row,i)=>i===index?{...row,text:e.target.value}:row))}/></label><div className="option-grid">{item.options.map((option,i)=><label key={i}>Pilihan {String.fromCharCode(65+i)}<input value={option} onChange={e=>setImportedQuestions(current=>current.map((row,rowIndex)=>rowIndex===index?{...row,options:row.options.map((value,j)=>j===i?e.target.value:value)}:row))}/></label>)}</div><label>Jawaban benar<select value={item.answer} onChange={e=>setImportedQuestions(current=>current.map((row,i)=>i===index?{...row,answer:Number(e.target.value)}:row))}>{item.options.map((_,i)=><option key={i} value={i}>{String.fromCharCode(65+i)}</option>)}</select></label></div>)}<button className="btn-primary" type="button" onClick={addImportedQuestions}><Plus size={16}/> Tambahkan {importedQuestions.length} soal ke asesmen</button></div>}
          <div className="question-builder"><h4>Tambahkan soal</h4><label>Pertanyaan<textarea required value={question.text} onChange={e=>setQuestion({...question,text:e.target.value})} placeholder="Tulis pertanyaan di sini"/></label><div className="option-grid">{question.options.map((option,index)=><label key={index}>Pilihan {String.fromCharCode(65+index)}<input required value={option} onChange={e=>setQuestion({...question,options:question.options.map((item,i)=>i===index?e.target.value:item)})}/></label>)}</div><label>Jawaban benar<select value={question.answer} onChange={e=>setQuestion({...question,answer:Number(e.target.value)})}>{question.options.map((_,i)=><option key={i} value={i}>{String.fromCharCode(65+i)}</option>)}</select></label><button className="btn-outline" type="button" onClick={addQuestion}><Plus size={16}/> Tambah soal ke asesmen</button></div>
          <div className="form-note"><FileText size={16}/><span>{form.questions.length} soal siap disimpan pada asesmen ini.</span></div>
          <button className="btn-primary" type="submit"><Check size={17}/> Buat Asesmen</button>
        </form>
      </div>
      <div className="panel assessment-list-panel"><div className="panel-heading"><div><h3>Daftar asesmen</h3><p>Status aktif langsung tersedia bagi siswa.</p></div></div>
        {assessments.length === 0 ? <div className="empty-state">Belum ada asesmen yang dibuat.</div> : assessments.map(item=><div className="assessment-list-item" key={item.id}><div><span className="subject-chip">{item.subject}</span><h4>{item.title}</h4><p>Kode <b>{item.code}</b> · {item.duration} menit · {item.questions.length} soal</p></div><button className={`activation-button ${item.is_active?'active':'inactive'}`} type="button" onClick={()=>toggleAssessment(item.id)}>{item.is_active?<><X size={15}/> Nonaktifkan</>:<><Play size={15}/> Aktifkan</>}</button></div>)}
      </div>
    </div>
  </section>;
}

function StudentAssessmentCenter({ assessments, studentName, selectedAssessment, setSelectedAssessment, started, setStarted, submitted, setSubmitted, answers, setAnswers, qIndex, setQIndex, remainingSeconds, setRemainingSeconds, notify }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const activeAssessments = assessments.filter(item => item.is_active);
  const current = selectedAssessment?.questions?.[qIndex];

  function findByCode(e) {
    e.preventDefault();
    const match = activeAssessments.find(item => item.code === code.trim().toUpperCase());
    if (!match) { setError('Kode tidak ditemukan atau asesmen belum aktif.'); return; }
    setSelectedAssessment(match); setError('');
  }

  function begin() {
    setAnswers({});
    setQIndex(0);
    setSubmitted(false);
    setRemainingSeconds(Number(selectedAssessment.duration) * 60);
    setStarted(true);
  }

  function submit() {
    setStarted(false);
    setSubmitted(true);
    notify('Jawaban asesmen berhasil dikumpulkan.');
  }

  const correct = selectedAssessment ? selectedAssessment.questions.filter((item,index)=>answers[item.id] === item.answer).length : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = String(remainingSeconds % 60).padStart(2, '0');

  if (started && selectedAssessment && current) return <section className="exam-fullscreen page-section">
    <div className="exam-topbar"><div><span>ASESMEN AKTIF</span><h2>{selectedAssessment.title}</h2></div><div className={`exam-timer ${remainingSeconds < 300 ? 'urgent' : ''}`}><Clock3 size={20}/><b>{minutes}:{seconds}</b></div></div>
    <div className="exam-layout"><aside className="exam-navigator"><strong>{selectedAssessment.subject}</strong><p>Peserta</p><b>{studentName}</b><div className="exam-number-grid">{selectedAssessment.questions.map((item,index)=><button key={item.id} className={`${qIndex===index?'current':''} ${answers[item.id] !== undefined?'answered':''}`} onClick={()=>setQIndex(index)}>{index+1}</button>)}</div></aside>
      <main className="exam-question"><div className="quiz-top"><span className="question-count">SOAL {qIndex+1} / {selectedAssessment.questions.length}</span></div><h1>{current.text}</h1><div className="answer-list">{current.options.map((option,index)=><button key={index} className={`answer-option ${answers[current.id]===index?'chosen':''}`} onClick={()=>setAnswers({...answers,[current.id]:index})}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option}</span></button>)}</div><div className="exam-actions"><button className="btn-outline" disabled={qIndex===0} onClick={()=>setQIndex(qIndex-1)}>Sebelumnya</button>{qIndex < selectedAssessment.questions.length-1 ? <button className="btn-primary" onClick={()=>setQIndex(qIndex+1)}>Selanjutnya</button> : <button className="btn-primary" onClick={submit}>Kumpulkan Jawaban</button>}</div></main></div>
  </section>;

  if (submitted && selectedAssessment) return <section className="page-section exam-result"><div className="exam-result-card"><div className="result-icon"><Trophy size={38}/></div><p>ASESMEN SELESAI</p><h1>{selectedAssessment.subject}</h1><div className="result-score">{correct}/{selectedAssessment.questions.length}</div><span>Jawaban benar</span><button className="btn-primary" onClick={()=>{setSelectedAssessment(null);setSubmitted(false);setAnswers({});}}>Pilih Asesmen Lain</button></div></section>;

  return <section className="page-section student-assessment-page">
    <div className="student-welcome"><div><div className="eyebrow"><Sparkles size={14}/> RUANG ASESMEN SISWA</div><h1>Halo, {studentName}!</h1><p>Pilih asesmen aktif atau masukkan kode mata pelajaran dari gurumu.</p></div><div className="student-class-mark"><GraduationCap size={42}/></div></div>
    <form className="assessment-code-form" onSubmit={findByCode}><div><label htmlFor="assessment-code">Kode asesmen</label><input id="assessment-code" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Contoh: MTK12A" required/></div><button className="btn-primary" type="submit">Cari Asesmen <ArrowUpRight size={17}/></button></form>
    {error && <div className="login-error">{error}</div>}
    {selectedAssessment ? <div className="panel selected-assessment"><span className="subject-chip">{selectedAssessment.subject}</span><h2>{selectedAssessment.title}</h2><p>{selectedAssessment.questions.length} soal · {selectedAssessment.duration} menit · Guru {selectedAssessment.teacher}</p><button className="btn-primary" onClick={begin}>Mulai Sekarang <Play size={17}/></button></div> : <div className="active-assessment-grid">{activeAssessments.map(item=><button className="active-assessment-card" key={item.id} onClick={()=>setSelectedAssessment(item)}><div className="assessment-card-icon"><BookOpen size={22}/></div><span className="live-assessment"><i></i> ASESMEN AKTIF</span><h3>{item.subject}</h3><p>{item.title}</p><b>{item.duration} menit</b><span className="assessment-code">Kode {item.code}</span></button>)}</div>}
    {activeAssessments.length === 0 && !selectedAssessment && <div className="empty-state assessment-empty"><Clock3 size={30}/><h3>Belum ada asesmen aktif</h3><p>Guru akan mengaktifkan asesmen dari halaman Kelola Asesmen.</p></div>}
  </section>;
}

function PasswordRecovery({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (password !== confirmation) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (updateError) {
      setError(updateError.message || 'Kata sandi baru gagal disimpan.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="login-screen recovery-screen">
    <section className="login-card recovery-card">
      <div className="login-card-head"><span className="login-card-icon"><LockKeyhole size={20}/></span><div><h2>Pemulihan akun</h2><p>Tetapkan kata sandi baru untuk akun administrator.</p></div></div>
      {success ? <>
        <div className="login-success">Kata sandi berhasil diperbarui. Silakan login kembali.</div>
        <button className="login-submit" type="button" onClick={onComplete}>Kembali ke login <ChevronRight size={18}/></button>
      </> : <form className="login-form" onSubmit={submit}>
        <label>Kata sandi baru<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        <label>Ulangi kata sandi baru<input type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={e=>setConfirmation(e.target.value)} required /></label>
        {error && <div className="login-error">{error}</div>}
        <button className="login-submit" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan kata sandi baru'} <ChevronRight size={18}/></button>
      </form>}
    </section>
  </div>;
}

function TeacherManagement({ notify }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', nip: '', subject: 'Matematika', password: '' });
  const [error, setError] = useState('');
  async function loadTeachers() {
    setLoading(true);
    const { data, error } = await supabase.from('staff_profiles').select('user_id, full_name, nip, subject, role, is_active, created_at').eq('role','teacher').order('created_at',{ascending:false});
    if (error) setError(error.message); else setTeachers(data || []);
    setLoading(false);
  }
  React.useEffect(() => { loadTeachers(); }, []);
  async function createTeacher(e) {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-teacher', { body: form });
      if (error) throw new Error(data?.error || error.message || 'Gagal membuat akun guru.');
      setForm({ full_name: '', nip: '', subject: 'Matematika', password: '' });
      notify('Akun guru berhasil dibuat.'); await loadTeachers();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function manageTeacher(action, teacher) {
    if (!window.confirm(action === 'delete' ? `Hapus akun guru ${teacher.full_name}?` : `Reset kata sandi akun ${teacher.full_name}?`)) return;
    setSaving(true);
    setError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-teacher', { body: action === 'delete' ? { action, user_id: teacher.user_id } : { action, user_id: teacher.user_id } });
      if (invokeError) throw new Error(data?.error || invokeError.message);
      if (action === 'reset') notify(`Reset berhasil. Kata sandi sementara: ${data.temporary_password}`);
      else notify('Akun guru berhasil dihapus.');
      await loadTeachers();
    } catch (err) { setError(err.message || 'Aksi akun guru gagal dijalankan.'); }
    finally { setSaving(false); }
  }
  return <section className="page-section"><div className="page-heading"><div><div className="eyebrow"><ShieldCheck size={14}/> ADMINISTRASI AKUN</div><h1>Manajemen <span className="gradient-text">Pengguna</span></h1><p>Administrator dapat membuat akun login untuk guru.</p></div><div className="heading-art"><Users size={42}/></div></div>
    <div className="panel settings-panel"><div className="panel-heading"><div><h3>Tambah akun guru</h3><p>Guru akan masuk menggunakan NIP dan kata sandi yang dibuat di sini.</p></div></div>
      <form className="settings-form" onSubmit={createTeacher}><label>Nama lengkap guru<input required maxLength={120} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Nama lengkap dan gelar"/></label><label>NIP<input required minLength={5} maxLength={30} value={form.nip} onChange={e=>setForm({...form,nip:e.target.value.replace(/\s/g,'')})} placeholder="Masukkan NIP"/></label><label>Mata pelajaran<select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}><option>Matematika</option><option>Bahasa Indonesia</option><option>Bahasa Inggris</option><option>Sejarah</option><option>Literasi Digital</option><option>Penalaran</option></select></label><label>Kata sandi awal<input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Minimal 8 karakter"/></label><div className="demo-warning-box"><ShieldCheck size={18}/><span>Bagikan kata sandi awal secara pribadi kepada guru. Guru sebaiknya menggantinya setelah login pertama. Kata sandi tidak disimpan di tabel profil.</span></div>{error && <div className="login-error">{error}</div>}<button className="btn-primary" disabled={saving} type="submit">{saving?'Membuat akun...':'Buat Akun Guru'} <Plus size={17}/></button></form>
    </div>    <div className="panel table-panel"><div className="panel-heading"><div><h3>Daftar akun guru</h3><p>Akun yang terdaftar pada Supabase Auth dan staff_profiles.</p></div><button className="btn-outline" onClick={loadTeachers}>Muat ulang</button></div>{loading?<p>Memuat data...</p>:<div className="table-wrap"><table><thead><tr><th>Nama</th><th>NIP</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{teachers.map(t=><tr key={t.user_id}><td>{t.full_name}</td><td>{t.nip || '-'}</td><td>Guru</td><td><span className={`status-pill ${t.is_active?'success':'pending'}`}>{t.is_active?'Aktif':'Nonaktif'}</span></td><td><div className="user-actions"><button className="icon-action reset" title="Reset kata sandi" disabled={saving} onClick={()=>manageTeacher('reset',t)}><KeyRound size={16}/><span>Reset</span></button><button className="icon-action delete" title="Hapus pengguna" disabled={saving} onClick={()=>manageTeacher('delete',t)}><Trash2 size={16}/><span>Hapus</span></button></div></td></tr>)}</tbody></table>{teachers.length===0&&<div className="empty-state">Belum ada akun guru.</div>}</div>}</div></section>;
}

function Metric({ icon: Icon, label, value, color, foot }) {
  return <div className="metric-card"><div className={`metric-icon ${color}`}><Icon size={20}/></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot"><span className={`foot-dot ${color}`}></span>{foot}</div><div className={`metric-watermark ${color}`}><Icon size={56}/></div></div>;
}
function Dashboard({schoolName, assessmentTitle, students, completed, progress, openAssessment, setPage, exportResults, questions}) {
  const [tab, setTab] = useState('awal');
  return <section className="page-section dashboard-page">
    <div className="welcome-banner"><div className="welcome-copy"><div className="welcome-tag"><Sparkles size={14}/> SELAMAT DATANG DI PORTAL ASESMEN</div><h1>Belajar lebih terarah,<br/><span>masa depan lebih cerah.</span></h1><p>{assessmentTitle} • {schoolName}</p><div className="welcome-buttons"><button className="btn-white" onClick={()=>openAssessment(tab)}><Play size={16} fill="currentColor"/> Mulai Asesmen <ChevronRight size={16}/></button><button className="btn-translucent" onClick={()=>setPage('reports')}>Lihat laporan <ArrowUpRight size={16}/></button></div></div><div className="welcome-art"><div className="art-circle circle-one"></div><div className="art-circle circle-two"></div><div className="art-book"><GraduationCap size={70}/></div><div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div><div className="art-floating floating-one"><Target size={17}/> Target tercapai</div><div className="art-floating floating-two"><Zap size={16}/> Keep growing!</div></div><div className="banner-decoration"></div></div>
    <div className="section-title-row"><div><h2>Ringkasan asesmen</h2><p>Pantau perkembangan pelaksanaan asesmen kelas XII.</p></div><button className="date-filter"><CalendarDays size={16}/> Tahun Ajaran 2026/2027</button></div>
    <div className="metrics-grid"><Metric icon={Users} label="Total Peserta" value={students.length} color="purple" foot="Siswa terdaftar (contoh)"/><Metric icon={CheckCircle2} label="Sudah Mengerjakan" value={completed} color="green" foot={`${progress}% tingkat partisipasi`}/><Metric icon={Clock3} label="Belum Mengerjakan" value={students.length-completed} color="orange" foot="Perlu ditindaklanjuti"/><Metric icon={BookOpen} label="Bank Soal" value={questions.length} color="blue" foot="Soal tersedia"/></div>
    <div className="dashboard-grid"><div className="panel quick-panel"><div className="panel-heading"><div><h3>Akses cepat asesmen</h3><p>Pilih jenis asesmen yang ingin dibuka.</p></div><div className="heading-spark"><Sparkles size={17}/></div></div><div className="assessment-choice"><button className={`assessment-choice-card ${tab==='awal'?'choice-active':''}`} onClick={()=>setTab('awal')}><div className="choice-icon early"><Target size={21}/></div><div><b>Asesmen Awal</b><span>Petakan kemampuan awal siswa</span></div><div className="choice-radio">{tab==='awal'&&<Check size={12}/>}</div></button><button className={`assessment-choice-card ${tab==='akhir'?'choice-active':''}`} onClick={()=>setTab('akhir')}><div className="choice-icon final"><Trophy size={21}/></div><div><b>Asesmen Akhir</b><span>Evaluasi capaian pembelajaran</span></div><div className="choice-radio">{tab==='akhir'&&<Check size={12}/>}</div></button></div><button className="btn-primary full" onClick={()=>openAssessment(tab)}>Buka {tab==='awal'?'Asesmen Awal':'Asesmen Akhir'} <ArrowUpRight size={17}/></button></div>
      <div className="panel progress-panel"><div className="panel-heading"><div><h3>Progres peserta</h3><p>Ringkasan status pengerjaan.</p></div><button className="more-btn" onClick={()=>setPage('students')}>Detail <ChevronRight size={15}/></button></div><div className="progress-summary"><div className="progress-ring" style={{'--progress':`${progress}%`}}><div><strong>{progress}%</strong><small>selesai</small></div></div><div className="progress-legend"><div><span><i className="dot-purple"></i> Sudah selesai</span><b>{completed}</b></div><div><span><i className="dot-grey"></i> Belum selesai</span><b>{students.length-completed}</b></div></div></div><div className="progress-bottom"><span>Target partisipasi</span><b>100%</b><div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}></div></div></div></div>
    </div>
    <div className="panel recent-panel"><div className="panel-heading"><div><h3>Aktivitas peserta</h3><p>Contoh daftar peserta dan status asesmen.</p></div><button className="more-btn" onClick={()=>setPage('students')}>Lihat semua <ChevronRight size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>Nama peserta</th><th>NISN</th><th>Kelas</th><th>Status</th><th>Progres</th></tr></thead><tbody>{students.slice(0,4).map((s,i)=><tr key={s.id}><td><div className="person-cell"><div className={`table-avatar avatar-${i%4}`}>{s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><b>{s.name}</b></div></td><td>{s.id}</td><td>{s.class}</td><td><span className={`status-pill ${s.status==='Selesai'?'success':'pending'}`}><i></i>{s.status}</span></td><td><div className="mini-progress"><span style={{width:s.status==='Selesai'?'100%':'0%'}}></span></div></td></tr>)}</tbody></table></div></div>
    <div className="bottom-callout"><div className="callout-icon"><Sparkles size={20}/></div><div><b>Setiap siswa punya potensi luar biasa.</b><p>Gunakan asesmen sebagai awal untuk memahami kebutuhan belajar, bukan sekadar angka.</p></div><button onClick={()=>setPage('questions')}>Kelola bank soal <ArrowUpRight size={16}/></button></div>
    <div className="dashboard-export"><span><FileText size={16}/> Butuh rekap untuk laporan?</span><button className="btn-outline" onClick={exportResults}><Download size={16}/> Ekspor data peserta</button></div>
  </section>;
}
createRoot(document.getElementById('root')).render(<App/>);
