import { User, StudentExperimentReport } from '../types';
import { getReports, getBadgesList } from '../utils/localStorage';
import { 
  Award, 
  Flame, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Download,
  Check
} from 'lucide-react';

interface DashboardStudentProps {
  currentUser: User;
  onSelectModule: (moduleId: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardStudent({ 
  currentUser, 
  onSelectModule,
  setActiveTab 
}: DashboardStudentProps) {
  const reports = getReports().filter(r => r.studentId === currentUser.id);
  const badgesList = getBadgesList();

  // Calculations
  const completedExperimentsCount = reports.filter(r => r.worksheet.submitted).length;
  const gradedReports = reports.filter(r => r.grade !== undefined);
  const averageGrade = gradedReports.length > 0 
    ? Math.round(gradedReports.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedReports.length)
    : 0;

  const currentLevelProgress = (currentUser.xp % 100); // Level up every 100 XP

  const coreModules = [
    { id: 'glb', title: 'Gerak Lurus Beraturan (GLB)', tag: 'Mekanika', duration: '45 menit', xp: 50 },
    { id: 'glbb', title: 'Gerak Lurus Berubah Beraturan (GLBB)', tag: 'Mekanika', duration: '50 menit', xp: 60 },
    { id: 'parabola', title: 'Gerak Parabola (Proyektil)', tag: 'Mekanika', duration: '60 menit', xp: 85 },
    { id: 'newton2', title: 'Hukum Newton II (F=m.a)', tag: 'Mekanika', duration: '45 menit', xp: 75 }
  ];

  const getReportStatus = (moduleId: string) => {
    const r = reports.find(rep => rep.moduleId === moduleId);
    if (!r) return { status: 'NOT_STARTED', label: 'Belum Mulai', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    if (r.grade !== undefined) return { status: 'GRADED', label: `Dinilai: ${r.grade}`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (r.worksheet.submitted) return { status: 'SUBMITTED', label: 'Menunggu Nilai', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { status: 'IN_PROGRESS', label: 'Draf Disimpan', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  const handlePrintCertificate = () => {
    const printContent = `
      <html>
        <head>
          <title>Sertifikat Lab Maya</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@400;600&display=swap');
            body { font-family: 'Inter', sans-serif; text-align: center; padding: 50px; background-color: #f9fafb; color: #111827; }
            .cert-card { border: 15px double #10b981; padding: 50px; background: white; max-width: 800px; margin: auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 8px; }
            .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 20px; }
            h1 { font-family: 'Playfair Display', serif; font-size: 42px; margin: 10px 0; color: #064e3b; }
            h2 { font-size: 18px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; margin-bottom: 40px; }
            .recipient { font-size: 28px; font-weight: bold; border-bottom: 2px solid #e5e7eb; display: inline-block; padding-bottom: 5px; margin: 20px 0; color: #111827; }
            .text { font-size: 16px; line-height: 1.6; color: #4b5563; max-width: 600px; margin: auto; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; padding: 0 50px; }
            .signature { border-top: 1px solid #d1d5db; padding-top: 10px; width: 150px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="cert-card">
            <div class="logo">LAB MAYA</div>
            <h2>Sertifikat Kompetensi Praktikum</h2>
            <p>Diberikan dengan hormat kepada:</p>
            <div class="recipient">${currentUser.name}</div>
            <p class="text">
              Telah berhasil menyelesaikan rangkaian praktikum Fisika Dasar (Mekanika) secara interaktif pada platform virtual <b>Lab Maya</b> dengan rata-rata nilai evaluasi <b>${averageGrade} / 100</b>, menunjukkan pemahaman yang matang dalam konsep ilmiah.
            </p>
            <div class="footer">
              <div class="signature">
                <b>Lab Maya Admin</b><br>Sistem Verifikasi Otomatis
              </div>
              <div class="signature">
                <b>${currentUser.school || 'Sekolah Pengguna'}</b><br>Kepala Laboratorium Fisika
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="student_dashboard_view">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 to-cyan-950 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 bg-cyan-500/10 w-fit px-3 py-1 rounded-full text-xs font-semibold text-cyan-300 mb-3 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>Kemajuan Belajar Anda</span>
            </div>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-white">
              Halo, {currentUser.name}! 👋
            </h2>
            <p className="font-sans text-slate-300 text-sm mt-1 max-w-xl">
              Siap mengeksplorasi eksperimen hari ini? Kamu memiliki {currentUser.streak} hari streak belajar berturut-turut. Jaga terus semangat belajarmu!
            </p>
          </div>

          {/* Level and Progress Wheel */}
          <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10">
            <div className="relative flex items-center justify-center">
              {/* Simple Custom Radial Ring */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="#06b6d4" strokeWidth="6" fill="transparent" 
                        strokeDasharray={175} strokeDashoffset={175 - (175 * currentLevelProgress) / 100} />
              </svg>
              <span className="absolute font-sans font-extrabold text-lg text-white">{currentUser.level}</span>
            </div>
            <div>
              <span className="block font-sans text-xs font-semibold text-cyan-400">LEVEL PENGGUNA</span>
              <span className="block font-sans text-lg font-bold text-white mt-px">{currentUser.xp} XP</span>
              <span className="block font-sans text-[10px] text-slate-400">{100 - currentLevelProgress} XP menuju Level berikutnya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Praktikum Selesai</span>
            <span className="block font-sans text-2xl font-bold text-white mt-0.5">{completedExperimentsCount} / 4</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Rata-rata Nilai</span>
            <span className="block font-sans text-2xl font-bold text-white mt-0.5">{averageGrade > 0 ? `${averageGrade} / 100` : '-'}</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
            <Flame className="w-6 h-6 fill-orange-400 text-orange-400" />
          </div>
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Streak Belajar</span>
            <span className="block font-sans text-2xl font-bold text-white mt-0.5">{currentUser.streak} Hari</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Badge Terbuka</span>
            <span className="block font-sans text-2xl font-bold text-white mt-0.5">{currentUser.badges.length} Badge</span>
          </div>
        </div>
      </div>

      {/* Main Content Split (Left: Modules Progress List, Right: Badges & Certificate) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm">
            <h3 className="font-sans font-bold text-lg text-white mb-1">Daftar Praktikum Mekanika</h3>
            <p className="font-sans text-xs text-slate-400 mb-6">Pilih modul di bawah untuk memulai eksperimen virtual atau mengedit laporan.</p>

            <div className="space-y-4">
              {coreModules.map(mod => {
                const reportStatus = getReportStatus(mod.id);
                return (
                  <div 
                    key={mod.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/30 transition-all gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-white/10 text-cyan-300 font-sans text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                          {mod.tag}
                        </span>
                        <span className="font-sans text-xs text-slate-400">
                          {mod.duration} • +{mod.xp} XP
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-sm text-white mt-1.5">{mod.title}</h4>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-2.5 py-1 rounded-full font-sans text-[11px] font-semibold border ${
                        reportStatus.status === 'GRADED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        reportStatus.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        reportStatus.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        {reportStatus.label}
                      </span>
                      <button 
                        onClick={() => onSelectModule(mod.id)}
                        className="flex items-center space-x-1 font-sans text-xs font-bold text-black bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md"
                      >
                        <span>{reportStatus.status === 'NOT_STARTED' ? 'Mulai Praktikum' : 'Buka'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Board */}
          {completedExperimentsCount >= 2 && (
            <div className="bg-gradient-to-tr from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center space-x-4 text-center sm:text-left">
                <div className="p-3 bg-amber-500 text-black rounded-2xl animate-bounce shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Award className="w-8 h-8 font-extrabold" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-amber-400">Sertifikat Tersedia! 🎓</h4>
                  <p className="font-sans text-xs text-slate-400 mt-0.5 max-w-md">
                    Hebat! Kamu telah berhasil menyelesaikan minimal 2 laporan praktikum fisika di Lab Maya. Sertifikat kelayakan dapat dicetak sekarang.
                  </p>
                </div>
              </div>
              <button 
                onClick={handlePrintCertificate}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-sans text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Cetak Sertifikat</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Badges list */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm">
            <h3 className="font-sans font-bold text-lg text-white mb-1">Badge Penghargaan</h3>
            <p className="font-sans text-xs text-slate-400 mb-6">Pencapaian khusus yang kamu peroleh dari keaktifan eksperimen.</p>

            <div className="grid grid-cols-1 gap-3">
              {badgesList.map(badge => {
                const isUnlocked = currentUser.badges.some(b => b.id === badge.id);
                return (
                  <div 
                    key={badge.id} 
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all ${
                      isUnlocked 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-white/5 border-white/5 opacity-40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isUnlocked ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-600'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-sans font-bold text-xs ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                          {badge.title}
                        </span>
                        {isUnlocked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
