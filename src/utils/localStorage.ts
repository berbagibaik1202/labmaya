import { User, StudentExperimentReport, TeacherClass, SystemSettings } from '../types';

const USER_KEY = 'lab_maya_current_user';
const REPORTS_KEY = 'lab_maya_reports';
const SETTINGS_KEY = 'lab_maya_settings';

// Pre-seeded badges
const INITIAL_BADGES = [
  { id: 'first_run', title: 'Ilmuwan Perintis', description: 'Memulai eksperimen fisika pertama kali.', icon: 'Zap' },
  { id: 'master_glb', title: 'Master GLB', description: 'Menyelesaikan kuis Gerak Lurus Beraturan dengan nilai sempurna.', icon: 'Activity' },
  { id: 'perfect_parabola', title: 'Ahli Artileri', description: 'Menemukan sudut terjauh 45° pada Gerak Parabola.', icon: 'Compass' },
  { id: 'newton_pioneer', title: 'Penakluk Gaya', description: 'Menyelesaikan praktikum Hukum Newton II.', icon: 'ShieldAlert' },
  { id: 'report_master', title: 'Penulis Jurnal', description: 'Mengirimkan laporan praktikum digital pertamanya ke guru.', icon: 'BookOpen' }
];

const INITIAL_STUDENTS: User[] = [
  {
    id: 'student_1',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@sekolah.sch.id',
    role: 'STUDENT',
    school: 'SMA Negeri 1 Jakarta',
    xp: 340,
    level: 3,
    streak: 5,
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-25T10:00:00Z' },
      { ...INITIAL_BADGES[1], unlockedAt: '2026-06-26T14:30:00Z' }
    ]
  },
  {
    id: 'student_2',
    name: 'Siti Aminah',
    email: 'siti.aminah@sekolah.sch.id',
    role: 'STUDENT',
    school: 'SMA Negeri 1 Jakarta',
    xp: 520,
    level: 4,
    streak: 12,
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-24T09:00:00Z' },
      { ...INITIAL_BADGES[1], unlockedAt: '2026-06-25T11:20:00Z' },
      { ...INITIAL_BADGES[2], unlockedAt: '2026-06-27T15:10:00Z' }
    ]
  },
  {
    id: 'student_3',
    name: 'Budi Santoso',
    email: 'budi.santoso@sekolah.sch.id',
    role: 'STUDENT',
    school: 'SMA Negeri 1 Jakarta',
    xp: 150,
    level: 1,
    streak: 2,
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-28T16:00:00Z' }
    ]
  },
  {
    id: 'student_4',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@sekolah.sch.id',
    role: 'STUDENT',
    school: 'SMA Negeri 1 Jakarta',
    xp: 280,
    level: 2,
    streak: 4,
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-25T11:00:00Z' },
      { ...INITIAL_BADGES[4], unlockedAt: '2026-06-27T10:15:00Z' }
    ]
  }
];

const INITIAL_REPORTS: StudentExperimentReport[] = [
  {
    id: 'report_1',
    studentId: 'student_1',
    studentName: 'Ahmad Fauzi',
    moduleId: 'glb',
    moduleTitle: 'Gerak Lurus Beraturan (GLB)',
    worksheet: {
      hypothesis: 'Makin besar kecepatan mobil mainan, posisi x yang dicapai pada waktu t tertentu akan makin jauh secara linear.',
      observations: [
        { id: '1', timestamp: 1, values: { t: 1, x: 5, v: 5, a: 0 } },
        { id: '2', timestamp: 2, values: { t: 2, x: 10, v: 5, a: 0 } },
        { id: '3', timestamp: 3, values: { t: 3, x: 15, v: 5, a: 0 } },
        { id: '4', timestamp: 4, values: { t: 4, x: 20, v: 5, a: 0 } }
      ],
      analysis: 'Dari grafik posisi terhadap waktu (x-t), terlihat grafik membentuk garis lurus diagonal naik dengan gradien konstan yang setara dengan nilai kecepatannya yaitu 5 m/s. Ini membuktikan bahwa posisi sebanding dengan waktu (x ~ t) ketika kecepatan konstan.',
      conclusion: 'Hipotesis diterima. Gerak Lurus Beraturan memiliki karakteristik di mana posisi benda berubah secara linear sebanding dengan waktu tempuhnya, sedangkan kecepatannya konstan di setiap titik waktu.',
      submitted: true,
      score: 95,
      feedback: 'Kerja bagus Ahmad! Analisismu sangat tepat dan datanya rapi.'
    },
    quiz: {
      answers: {
        glb_1: 'Gerak lintasan lurus dengan kecepatan konstan sehingga percepatannya nol',
        glb_2: 'Salah',
        glb_3: ['m/s', 's', 'm', 'm/s²']
      },
      score: 100,
      completed: true
    },
    createdAt: '2026-06-26T14:45:00Z',
    grade: 97,
    feedback: 'Pemahaman konsep GLB sangat luar biasa!'
  },
  {
    id: 'report_2',
    studentId: 'student_2',
    studentName: 'Siti Aminah',
    moduleId: 'glb',
    moduleTitle: 'Gerak Lurus Beraturan (GLB)',
    worksheet: {
      hypothesis: 'Kecepatan konstan akan menghasilkan grafik linear yang miring ke atas.',
      observations: [
        { id: '1', timestamp: 1, values: { t: 1, x: 10, v: 10, a: 0 } },
        { id: '2', timestamp: 2, values: { t: 2, x: 20, v: 10, a: 0 } },
        { id: '3', timestamp: 3, values: { t: 3, x: 30, v: 10, a: 0 } }
      ],
      analysis: 'Setiap peningkatan waktu 1 sekon, jarak bertambah konstan sebanyak 10 meter. Ini membuktikan x = v * t berjalan dengan sempurna.',
      conclusion: 'Kecepatan adalah turunan pertama dari fungsi posisi, sehingga grafik linear membuktikan kecepatan bernilai konstan.',
      submitted: true,
      score: 90,
      feedback: 'Penjelasan matematis yang sangat baik!'
    },
    quiz: {
      answers: {
        glb_1: 'Gerak lintasan lurus dengan kecepatan konstan sehingga percepatannya nol',
        glb_2: 'Salah',
        glb_3: ['m/s', 's', 'm', 'm/s²']
      },
      score: 100,
      completed: true
    },
    createdAt: '2026-06-25T11:30:00Z',
    grade: 93,
    feedback: 'Nilai kuis sempurna dan laporan rapi.'
  },
  {
    id: 'report_3',
    studentId: 'student_2',
    studentName: 'Siti Aminah',
    moduleId: 'parabola',
    moduleTitle: 'Gerak Parabola (Projectile Motion)',
    worksheet: {
      hypothesis: 'Sudut elevasi 45 derajat menghasilkan jarak mendatar terjauh dibandingkan sudut 30 atau 60 derajat.',
      observations: [
        { id: '1', timestamp: 1.5, values: { t: 1.0, x: 10.6, y: 5.7, vx: 10.6, vy: 5.2 } },
        { id: '2', timestamp: 2.1, values: { t: 2.16, x: 22.9, y: 0, vx: 10.6, vy: -10.6 } }
      ],
      analysis: 'Pada sudut 45 derajat dengan v0=15 m/s, jarak terjauh yang dicapai adalah sekitar 22.9 meter. Pada sudut 30 derajat jarak hanya 19.8 meter dan pada sudut 60 derajat jarak adalah 19.8 meter juga.',
      conclusion: 'Benar bahwa sudut elevasi optimal untuk jarak horizontal maksimum adalah 45 derajat karena sin(2*45) = sin(90) = 1 (nilai maksimum sinus).',
      submitted: true,
      score: 100,
      feedback: 'Luar biasa Siti, kamu membuktikan konsep trigonometri di balik gerak parabola dengan tepat!'
    },
    quiz: {
      answers: {
        para_1: '45 derajat',
        para_2: 'Benar',
        para_3: 'Gaya gravitasi bumi'
      },
      score: 100,
      completed: true
    },
    createdAt: '2026-06-27T15:20:00Z',
    grade: 100,
    feedback: 'Analisis teoritis dan pembuktian matematis yang sempurna!'
  }
];

export const INITIAL_TEACHER_CLASSES: TeacherClass[] = [
  { id: 'class_1', name: 'Kelas X - IPA 1', grade: 'X', studentCount: 24, code: 'LMY-10A' },
  { id: 'class_2', name: 'Kelas XI - IPA 3', grade: 'XI', studentCount: 22, code: 'LMY-11C' }
];

export const INITIAL_SETTINGS: SystemSettings = {
  schoolName: 'SMA Negeri 1 Jakarta',
  academicYear: '2026/2027',
  allowGuestAccess: true,
  enableNotifications: true,
  themeColor: 'emerald'
};

// Main Active User State (Default to Student Siti Aminah for premium presentation, but can switch role)
const DEFAULT_USER: User = {
  id: 'student_2',
  name: 'Siti Aminah',
  email: 'siti.aminah@sekolah.sch.id',
  role: 'STUDENT',
  school: 'SMA Negeri 1 Jakarta',
  xp: 520,
  level: 4,
  streak: 12,
  badges: [
    { ...INITIAL_BADGES[0], unlockedAt: '2026-06-24T09:00:00Z' },
    { ...INITIAL_BADGES[1], unlockedAt: '2026-06-25T11:20:00Z' },
    { ...INITIAL_BADGES[2], unlockedAt: '2026-06-27T15:10:00Z' }
  ]
};

export const getSystemSettings = (): SystemSettings => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  if (!settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  return JSON.parse(settings);
};

export const saveSystemSettings = (settings: SystemSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getCurrentUser = (): User => {
  const user = localStorage.getItem(USER_KEY);
  if (!user) {
    localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
  return JSON.parse(user);
};

export const saveCurrentUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // If the user is a student, update their data in the student list
  if (user.role === 'STUDENT') {
    const students = getStudentsList();
    const idx = students.findIndex(s => s.id === user.id);
    if (idx !== -1) {
      students[idx] = user;
      localStorage.setItem('lab_maya_students', JSON.stringify(students));
    }
  }
};

export const getStudentsList = (): User[] => {
  const students = localStorage.getItem('lab_maya_students');
  if (!students) {
    localStorage.setItem('lab_maya_students', JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  return JSON.parse(students);
};

export const saveStudentList = (students: User[]) => {
  localStorage.setItem('lab_maya_students', JSON.stringify(students));
};

export const getReports = (): StudentExperimentReport[] => {
  const reports = localStorage.getItem(REPORTS_KEY);
  if (!reports) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }
  return JSON.parse(reports);
};

export const saveReport = (report: StudentExperimentReport) => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === report.id);
  if (index !== -1) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const getBadgesList = () => INITIAL_BADGES;
export const getClassesList = () => INITIAL_TEACHER_CLASSES;

export const resetDatabase = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REPORTS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem('lab_maya_students');
};
