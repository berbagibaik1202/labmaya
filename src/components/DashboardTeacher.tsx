import { useState } from 'react';
import { User, StudentExperimentReport, TeacherClass } from '../types';
import { getStudentsList, getReports, saveReport, getClassesList } from '../utils/localStorage';
import { 
  Users, 
  BookOpen, 
  Award, 
  CheckCircle, 
  ClipboardList, 
  Search, 
  ChevronRight, 
  FileText, 
  X, 
  MessageSquare, 
  ThumbsUp, 
  Check 
} from 'lucide-react';

interface DashboardTeacherProps {
  currentUser: User;
}

export default function DashboardTeacher({ currentUser }: DashboardTeacherProps) {
  const students = getStudentsList();
  const classes = getClassesList();
  const reports = getReports();

  const [activeClassId, setActiveClassId] = useState<string>('class_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportToReview, setSelectedReportToReview] = useState<StudentExperimentReport | null>(null);
  const [inputGrade, setInputGrade] = useState<string>('90');
  const [inputFeedback, setInputFeedback] = useState<string>('');

  // Filtering reports and calculations
  const totalSubmissions = reports.filter(r => r.worksheet.submitted).length;
  const gradedReports = reports.filter(r => r.grade !== undefined);
  const averageGrade = gradedReports.length > 0 
    ? Math.round(gradedReports.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedReports.length)
    : 0;

  // Render a nice visual grade distribution
  const gradeDistribution = {
    'A (90-100)': reports.filter(r => r.grade !== undefined && r.grade >= 90).length,
    'B (80-89)': reports.filter(r => r.grade !== undefined && r.grade >= 80 && r.grade < 90).length,
    'C (70-79)': reports.filter(r => r.grade !== undefined && r.grade >= 70 && r.grade < 80).length,
    'D (60-69)': reports.filter(r => r.grade !== undefined && r.grade < 70).length
  };

  const handleOpenReview = (report: StudentExperimentReport) => {
    setSelectedReportToReview(report);
    setInputGrade(String(report.grade || report.worksheet.score || 85));
    setInputFeedback(report.feedback || '');
  };

  const handleSaveReview = () => {
    if (!selectedReportToReview) return;
    
    const updatedReport: StudentExperimentReport = {
      ...selectedReportToReview,
      grade: Number(inputGrade),
      feedback: inputFeedback,
      worksheet: {
        ...selectedReportToReview.worksheet,
        score: Number(inputGrade),
        feedback: inputFeedback
      }
    };

    saveReport(updatedReport);
    setSelectedReportToReview(null);
  };

  const getStudentReports = (studentId: string) => {
    return reports.filter(r => r.studentId === studentId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="teacher_dashboard_view">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="font-sans text-xs text-cyan-400 font-bold uppercase tracking-wider">Ruang Kelas Digital</span>
          <h2 className="font-sans font-bold text-2xl tracking-tight text-white mt-1">
            Dashboard Guru: {currentUser.name}
          </h2>
          <p className="font-sans text-xs text-slate-400 mt-0.5">
            Kelola eksperimen siswa, tinjau laporan praktikum, dan berikan evaluasi belajar secara real-time.
          </p>
        </div>

        {/* Classes list select */}
        <div className="flex items-center space-x-2">
          {classes.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveClassId(c.id)}
              className={`px-4 py-2 rounded-xl font-sans text-xs font-bold border transition-all cursor-pointer ${
                activeClassId === c.id 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Laporan Masuk</span>
            <span className="block font-sans text-3xl font-bold text-white mt-1">{totalSubmissions} Laporan</span>
            <span className="block font-sans text-[11px] text-cyan-400 font-medium mt-1">Siap untuk ditinjau & dinilai</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <ClipboardList className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Rata-rata Nilai Kelas</span>
            <span className="block font-sans text-3xl font-bold text-white mt-1">{averageGrade} / 100</span>
            <span className="block font-sans text-[11px] text-emerald-400 font-medium mt-1">Mencapai target ketuntasan (75+)</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-sans text-xs text-slate-400 font-medium">Siswa Terdaftar</span>
            <span className="block font-sans text-3xl font-bold text-white mt-1">{students.length} Siswa</span>
            <span className="block font-sans text-[11px] text-slate-400 mt-1">Kode Kelas: <b>LMY-10A</b></span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Users className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main split (Left: Students Table & Submissions, Right: Analytics Visualizer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Table) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <h3 className="font-sans font-bold text-base text-white">Daftar Perkembangan Siswa</h3>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Cari nama siswa..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-lg focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse mt-4">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 font-sans text-xs font-semibold text-slate-400">Siswa</th>
                    <th className="py-3 font-sans text-xs font-semibold text-slate-400 text-center">Level</th>
                    <th className="py-3 font-sans text-xs font-semibold text-slate-400">Status Praktikum</th>
                    <th className="py-3 font-sans text-xs font-semibold text-slate-400 text-center">Nilai Rata-rata</th>
                    <th className="py-3 font-sans text-xs font-semibold text-slate-400 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(student => {
                      const studentReps = getStudentReports(student.id);
                      const submittedReps = studentReps.filter(r => r.worksheet.submitted);
                      const gradedReps = studentReps.filter(r => r.grade !== undefined);
                      const studentAvg = gradedReps.length > 0
                        ? Math.round(gradedReps.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedReps.length)
                        : 0;

                      return (
                        <tr key={student.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5">
                            <span className="block font-sans font-bold text-sm text-slate-200">{student.name}</span>
                            <span className="block font-sans text-[10px] text-slate-400">{student.email}</span>
                          </td>
                          <td className="py-3.5 text-center">
                            <span className="font-sans font-semibold text-xs text-slate-300">LV.{student.level}</span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {studentReps.length === 0 ? (
                                <span className="text-[10px] font-medium text-slate-500 italic">Belum memulai</span>
                              ) : (
                                studentReps.map(rep => (
                                  <span 
                                    key={rep.id} 
                                    onClick={() => handleOpenReview(rep)}
                                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold cursor-pointer transition-all border ${
                                      rep.grade !== undefined 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                    }`}
                                    title={`Topik: ${rep.moduleTitle}. Klik untuk meninjau.`}
                                  >
                                    {rep.moduleId.toUpperCase()}: {rep.grade !== undefined ? rep.grade : 'Review'}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 text-center">
                            <span className={`font-sans font-bold text-xs ${studentAvg >= 75 ? 'text-emerald-400' : studentAvg > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                              {studentAvg > 0 ? studentAvg : '-'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {submittedReps.some(r => r.grade === undefined) ? (
                              <button 
                                onClick={() => handleOpenReview(submittedReps.find(r => r.grade === undefined)!)}
                                className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 px-2.5 py-1 rounded-lg font-sans text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Tinjau Tugas
                              </button>
                            ) : (
                              <span className="font-sans text-xs text-slate-500 italic">Semua dinilai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Visual Analytics Distribution) */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-sm">
            <h3 className="font-sans font-bold text-base text-white mb-1">Sebaran Nilai Praktikum</h3>
            <p className="font-sans text-xs text-slate-400 mb-6">Toleransi ketuntasan KKM adalah nilai 75.</p>

            <div className="space-y-4">
              {Object.entries(gradeDistribution).map(([label, count]) => {
                const totalGraded = Math.max(gradedReports.length, 1);
                const percent = Math.round((count / totalGraded) * 100);

                return (
                  <div key={label}>
                    <div className="flex justify-between font-sans text-xs font-medium text-slate-300 mb-1">
                      <span>{label}</span>
                      <span>{count} Siswa ({percent}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-white/10 my-6"></div>

            <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
              <span className="block font-sans text-xs font-bold text-cyan-400">Statistik Pelaksanaan</span>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="block font-sans text-[10px] text-slate-400">Total Kuis Selesai</span>
                  <span className="block font-sans font-bold text-base text-white">
                    {reports.filter(r => r.quiz.completed).length} Kali
                  </span>
                </div>
                <div>
                  <span className="block font-sans text-[10px] text-slate-400">Persentase Lulus</span>
                  <span className="block font-sans font-bold text-base text-white">
                    {Math.round((reports.filter(r => (r.grade || 0) >= 75).length / Math.max(reports.length, 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review & Grading Panel Modal */}
      {selectedReportToReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative text-slate-200">
            
            <button 
              onClick={() => setSelectedReportToReview(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="font-sans text-xs text-cyan-400 font-bold uppercase tracking-wider">Lembar Pemeriksaan Praktikum</span>
              <h3 className="font-sans font-bold text-xl text-white mt-1">
                Laporan Praktikum: {selectedReportToReview.moduleTitle}
              </h3>
              <p className="font-sans text-xs text-slate-400">
                Siswa: <b>{selectedReportToReview.studentName}</b> • Diserahkan pada {new Date(selectedReportToReview.createdAt).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              
              {/* Report Worksheet details (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-5 border-r border-white/10 pr-0 lg:pr-6">
                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">1. Hipotesis Siswa</h4>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 mt-1.5 text-xs text-slate-300 italic">
                    "{selectedReportToReview.worksheet.hypothesis || 'Siswa tidak mengisi hipotesis.'}"
                  </div>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">2. Data Pengamatan Hasil Eksperimen</h4>
                  <div className="mt-1.5 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="p-2.5 font-semibold text-slate-400">Percobaan</th>
                          {selectedReportToReview.worksheet.observations[0] && 
                            Object.keys(selectedReportToReview.worksheet.observations[0].values).map(k => (
                              <th key={k} className="p-2.5 font-semibold text-slate-400 uppercase">{k}</th>
                            ))
                          }
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedReportToReview.worksheet.observations.map((obs, idx) => (
                          <tr key={obs.id}>
                            <td className="p-2.5 font-medium text-slate-400">Percobaan {idx + 1}</td>
                            {Object.values(obs.values).map((val, vIdx) => (
                              <td key={vIdx} className="p-2.5 text-slate-200">{Number(val).toFixed(2)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">3. Analisis Data</h4>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 mt-1.5 text-xs text-slate-300 whitespace-pre-wrap">
                    {selectedReportToReview.worksheet.analysis || 'Siswa tidak menuliskan analisis data.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">4. Kesimpulan</h4>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 mt-1.5 text-xs text-slate-300 whitespace-pre-wrap">
                    {selectedReportToReview.worksheet.conclusion || 'Siswa tidak menuliskan kesimpulan.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider">5. Hasil Evaluasi Kuis</h4>
                  <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20 mt-1.5 flex justify-between items-center text-xs">
                    <span>Skor Kuis Otomatis:</span>
                    <span className="font-bold text-sm">{selectedReportToReview.quiz.score} / 100</span>
                  </div>
                </div>
              </div>

              {/* Grading Input (Right 1 col) */}
              <div className="space-y-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <h4 className="font-sans font-bold text-sm text-white mb-3">Penilaian Guru</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-sans text-[11px] font-semibold text-slate-400 uppercase">Input Nilai Laporan (0-100)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={inputGrade}
                        onChange={(e) => setInputGrade(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2 font-sans text-sm font-semibold border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[11px] font-semibold text-slate-400 uppercase">Umpan Balik / Catatan</label>
                      <textarea 
                        rows={4}
                        value={inputFeedback}
                        onChange={(e) => setInputFeedback(e.target.value)}
                        placeholder="Tulis saran perbaikan atau pujian ilmiah..."
                        className="w-full mt-1.5 px-3 py-2 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedReportToReview(null)}
                    className="flex-1 border border-white/10 hover:bg-white/10 text-slate-300 font-sans text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveReview}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Nilai</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
