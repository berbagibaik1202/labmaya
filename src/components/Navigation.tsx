import { useState } from 'react';
import { User, UserRole } from '../types';
import { getCurrentUser, saveCurrentUser, getStudentsList, getSystemSettings } from '../utils/localStorage';
import { 
  Atom, 
  Users, 
  User as UserIcon, 
  Shield, 
  Settings, 
  Award, 
  Flame, 
  LogOut, 
  RefreshCw,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface NavigationProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ 
  currentUser, 
  onUserChange, 
  activeTab, 
  setActiveTab 
}: NavigationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const students = getStudentsList();
  const settings = getSystemSettings();

  const handleRoleSwitch = (role: UserRole, studentId?: string) => {
    setDropdownOpen(false);
    if (role === 'STUDENT' && studentId) {
      const selectedStudent = students.find(s => s.id === studentId);
      if (selectedStudent) {
        saveCurrentUser(selectedStudent);
        onUserChange(selectedStudent);
        setActiveTab('simulations');
      }
    } else if (role === 'TEACHER') {
      const teacherUser: User = {
        id: 'teacher_1',
        name: 'Pak Bambang, M.Pd.',
        email: 'bambang.guru@sekolah.sch.id',
        role: 'TEACHER',
        school: settings.schoolName,
        xp: 1200,
        level: 10,
        streak: 15,
        badges: []
      };
      saveCurrentUser(teacherUser);
      onUserChange(teacherUser);
      setActiveTab('teacher_dashboard');
    } else if (role === 'ADMIN') {
      const adminUser: User = {
        id: 'admin_1',
        name: 'Administrator Lab Maya',
        email: 'admin@labmaya.id',
        role: 'ADMIN',
        school: settings.schoolName,
        xp: 5000,
        level: 50,
        streak: 100,
        badges: []
      };
      saveCurrentUser(adminUser);
      onUserChange(adminUser);
      setActiveTab('admin_dashboard');
    } else if (role === 'GUEST') {
      const guestUser: User = {
        id: 'guest_1',
        name: 'Tamu Eksplorasi',
        email: 'guest@labmaya.id',
        role: 'GUEST',
        xp: 0,
        level: 1,
        streak: 0,
        badges: []
      };
      saveCurrentUser(guestUser);
      onUserChange(guestUser);
      setActiveTab('simulations');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return <Shield className="w-4 h-4 text-rose-500" />;
      case 'TEACHER': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'STUDENT': return <UserIcon className="w-4 h-4 text-emerald-500" />;
      default: return <Atom className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'TEACHER': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'STUDENT': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <nav className="bg-black/40 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl shadow-2xl" id="lab_maya_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('simulations')}>
            <div className="p-2 bg-cyan-500 text-black rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
              <Atom className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-white block leading-tight">
                Lab Maya
              </span>
              <span className="font-sans text-[10px] text-cyan-400 font-bold tracking-wide uppercase">
                Virtual Physics Lab
              </span>
            </div>
          </div>

          {/* Navigation Tabs based on role */}
          <div className="hidden md:flex space-x-1 items-center">
            <button
              id="nav_sim_btn"
              onClick={() => setActiveTab('simulations')}
              className={`px-3.5 py-2 rounded-xl font-sans text-sm font-semibold transition-all ${
                activeTab === 'simulations' 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Laboratorium
            </button>

            {currentUser.role === 'STUDENT' && (
              <>
                <button
                  id="nav_student_dash_btn"
                  onClick={() => setActiveTab('student_dashboard')}
                  className={`px-3.5 py-2 rounded-xl font-sans text-sm font-semibold transition-all ${
                    activeTab === 'student_dashboard' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard Belajar
                </button>
                <button
                  id="nav_reports_btn"
                  onClick={() => setActiveTab('reports_list')}
                  className={`px-3.5 py-2 rounded-xl font-sans text-sm font-semibold transition-all ${
                    activeTab === 'reports_list' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Laporan Praktikum
                </button>
              </>
            )}

            {currentUser.role === 'TEACHER' && (
              <button
                id="nav_teacher_dash_btn"
                onClick={() => setActiveTab('teacher_dashboard')}
                className={`px-3.5 py-2 rounded-xl font-sans text-sm font-semibold transition-all ${
                  activeTab === 'teacher_dashboard' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard Guru
              </button>
            )}

            {currentUser.role === 'ADMIN' && (
              <button
                id="nav_admin_dash_btn"
                onClick={() => setActiveTab('admin_dashboard')}
                className={`px-3.5 py-2 rounded-xl font-sans text-sm font-semibold transition-all ${
                  activeTab === 'admin_dashboard' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard Admin
              </button>
            )}
          </div>

          {/* User Status, XP Points, & Role Switcher Simulation */}
          <div className="flex items-center space-x-4">
            {currentUser.role === 'STUDENT' && (
              <div className="hidden lg:flex items-center space-x-3 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
                {/* Streak Counter */}
                <div className="flex items-center space-x-1" title="Streak Belajar Harian">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span className="font-sans font-bold text-xs text-slate-200">{currentUser.streak} Hari</span>
                </div>
                <div className="h-3 w-px bg-white/10"></div>
                {/* XP / Level Indicator */}
                <div className="flex items-center space-x-1" title="Poin XP Keaktifan">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="font-sans font-bold text-xs text-slate-200">LV.{currentUser.level} ({currentUser.xp} XP)</span>
                </div>
              </div>
            )}

            {/* Quick Simulation Controller */}
            <div className="relative">
              <button
                id="user_selector_dropdown"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 pl-3 pr-2 py-1.5 rounded-xl transition-all text-slate-200"
              >
                <div className={`border p-1 rounded-lg ${getRoleBadgeColor(currentUser.role)}`}>
                  {getRoleIcon(currentUser.role)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block font-sans text-xs font-bold text-slate-100 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="block font-sans text-[9px] text-cyan-400 font-medium capitalize">
                    {currentUser.role.toLowerCase()}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0d1117]/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 py-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-150 text-slate-200">
                  <div className="px-4 py-2 border-b border-white/5">
                    <span className="block font-sans text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      Simulasikan Peran Pengguna
                    </span>
                    <span className="block font-sans text-xs text-slate-500 mt-0.5">
                      Pilih profil di bawah untuk menguji dashboard & fungsionalitas:
                    </span>
                  </div>

                  {/* Students List */}
                  <div className="py-1">
                    <div className="px-4 py-1 flex items-center text-[10px] font-semibold text-cyan-400">
                      <Users className="w-3 h-3 mr-1" /> SISWA
                    </div>
                    {students.map(std => (
                      <button
                        key={std.id}
                        onClick={() => handleRoleSwitch('STUDENT', std.id)}
                        className={`w-full px-4 py-1.5 text-left font-sans text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                          currentUser.id === std.id ? 'bg-cyan-500/10 font-semibold text-cyan-400' : 'text-slate-300'
                        }`}
                      >
                        <div className="truncate max-w-[150px]">
                          <span>{std.name}</span>
                          <span className="block text-[9px] text-slate-400">Level {std.level} • {std.xp} XP</span>
                        </div>
                        {currentUser.id === std.id && (
                          <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-white/5 my-1.5"></div>

                  {/* Teacher & Admin */}
                  <div className="py-1">
                    <button
                      onClick={() => handleRoleSwitch('TEACHER')}
                      className={`w-full px-4 py-2 text-left font-sans text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                        currentUser.role === 'TEACHER' ? 'bg-blue-500/10 font-semibold text-blue-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>Pak Bambang (Guru)</span>
                      </div>
                      {currentUser.role === 'TEACHER' && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('ADMIN')}
                      className={`w-full px-4 py-2 text-left font-sans text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                        currentUser.role === 'ADMIN' ? 'bg-rose-500/10 font-semibold text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-rose-400" />
                        <span>Administrator (Admin)</span>
                      </div>
                      {currentUser.role === 'ADMIN' && (
                        <span className="w-2 h-2 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('GUEST')}
                      className={`w-full px-4 py-2 text-left font-sans text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                        currentUser.role === 'GUEST' ? 'bg-white/10 font-semibold text-slate-200' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Atom className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mode Tamu (Guest)</span>
                      </div>
                      {currentUser.role === 'GUEST' && (
                        <span className="w-2 h-2 bg-slate-400 rounded-full shadow-[0_0_8px_rgba(156,163,175,0.8)]"></span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
