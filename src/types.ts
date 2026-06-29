export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school?: string;
  xp: number;
  level: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

// Configuration-driven Simulation types
export interface SimParameter {
  id: string;
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description?: string;
}

export interface SimOutputVariable {
  id: string;
  label: string;
  unit: string;
  color: string;
}

export interface SimConfig {
  id: string;
  title: string;
  category: 'mechanics' | 'electricity' | 'optics' | 'wave' | 'fluid' | 'magnet' | 'modern';
  description: string;
  parameters: SimParameter[];
  outputs: SimOutputVariable[];
  formulas: {
    [key: string]: string; // human-readable string representation of formulas
  };
  theoryMarkdown: string;
  steps: string[];
}

export interface DataLogEntry {
  id: string;
  timestamp: number; // in-sim elapsed time or real time
  values: {
    [key: string]: number;
  };
}

export interface WorksheetData {
  hypothesis: string;
  observations: DataLogEntry[];
  analysis: string;
  conclusion: string;
  submitted: boolean;
  score?: number;
  feedback?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'DRAG_DROP' | 'MATCHING';
  question: string;
  options?: string[]; // for MC
  correctAnswer: string | string[]; // Single answer, boolean, or array for matches/drag-drop
  pairs?: { left: string; right: string }[]; // for MATCHING
  dragItems?: string[]; // for DRAG_DROP target sequences
}

export interface QuizState {
  answers: { [questionId: string]: string | string[] };
  score?: number;
  completed: boolean;
}

export interface StudentExperimentReport {
  id: string;
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleTitle: string;
  worksheet: WorksheetData;
  quiz: QuizState;
  createdAt: string;
  grade?: number;
  feedback?: string;
}

export interface TeacherClass {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  code: string;
}

export interface SystemSettings {
  schoolName: string;
  academicYear: string;
  allowGuestAccess: boolean;
  enableNotifications: boolean;
  themeColor: 'emerald' | 'indigo' | 'cyan' | 'violet';
}
