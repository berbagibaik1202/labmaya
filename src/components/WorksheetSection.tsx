import { useState, useEffect } from 'react';
import { SimConfig, DataLogEntry, WorksheetData, User, StudentExperimentReport } from '../types';
import { saveReport, getCurrentUser, saveCurrentUser, getReports } from '../utils/localStorage';
import { FileText, Save, Send, Sparkles, CheckCircle, Award, Flame } from 'lucide-react';

interface WorksheetSectionProps {
  config: SimConfig;
  recordedLogs: DataLogEntry[];
  currentUser: User;
  onRefreshUser: () => void;
  onNavigateToDashboard: () => void;
}

export default function WorksheetSection({
  config,
  recordedLogs,
  currentUser,
  onRefreshUser,
  onNavigateToDashboard
}: WorksheetSectionProps) {
  // Load existing draft or instantiate empty worksheet
  const [worksheet, setWorksheet] = useState<WorksheetData>({
    hypothesis: '',
    observations: [],
    analysis: '',
    conclusion: '',
    submitted: false
  });

  const [isSaved, setIsSaved] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Load existing student worksheet if present in local storage
  useEffect(() => {
    const reports = getReports();
    const existing = reports.find(r => r.studentId === currentUser.id && r.moduleId === config.id);
    if (existing) {
      setWorksheet(existing.worksheet);
    } else {
      setWorksheet({
        hypothesis: '',
        observations: recordedLogs,
        analysis: '',
        conclusion: '',
        submitted: false
      });
    }
  }, [config, currentUser, recordedLogs]);

  // Synchronize observations with simulated logger
  useEffect(() => {
    if (recordedLogs.length > 0 && !worksheet.submitted) {
      setWorksheet(prev => ({
        ...prev,
        observations: recordedLogs
      }));
    }
  }, [recordedLogs]);

  const handleLocalSave = () => {
    const reportId = `report_${currentUser.id}_${config.id}`;
    const reportItem: StudentExperimentReport = {
      id: reportId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      moduleId: config.id,
      moduleTitle: config.title,
      worksheet: {
        ...worksheet,
        observations: recordedLogs.length > 0 ? recordedLogs : worksheet.observations
      },
      quiz: { answers: {}, completed: false },
      createdAt: new Date().toISOString()
    };

    saveReport(reportItem);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSubmitReport = () => {
    if (!worksheet.hypothesis.trim()) {
      alert('Silakan tulis Hipotesis Anda sebelum menyerahkan laporan.');
      return;
    }
    if (recordedLogs.length === 0 && worksheet.observations.length === 0) {
      alert('Harap rekam minimal 1 baris data simulasi ke dalam tabel sebelum mengumpulkan.');
      return;
    }
    if (!worksheet.analysis.trim() || !worksheet.conclusion.trim()) {
      alert('Lengkapi bagian Analisis & Kesimpulan Anda.');
      return;
    }

    const reportId = `report_${currentUser.id}_${config.id}`;
    const reports = getReports();
    const existingReport = reports.find(r => r.studentId === currentUser.id && r.moduleId === config.id);

    const updatedWorksheet: WorksheetData = {
      ...worksheet,
      observations: recordedLogs.length > 0 ? recordedLogs : worksheet.observations,
      submitted: true
    };

    const submittedReport: StudentExperimentReport = {
      id: reportId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      moduleId: config.id,
      moduleTitle: config.title,
      worksheet: updatedWorksheet,
      quiz: existingReport?.quiz || { answers: {}, completed: false },
      createdAt: new Date().toISOString()
    };

    saveReport(submittedReport);
    setWorksheet(updatedWorksheet);

    // Gamification rewards
    let xpGain = 100; // Large reward for formal uploader report
    let updatedUser = { ...currentUser };
    
    // Unlock Penulis Jurnal / first report badge
    const badgeId = 'report_master';
    const hasBadge = currentUser.badges.some(b => b.id === badgeId);
    if (!hasBadge) {
      const journalBadge = {
        id: badgeId,
        title: 'Penulis Jurnal',
        description: 'Mengirimkan laporan praktikum digital pertamanya ke guru.',
        icon: 'BookOpen',
        unlockedAt: new Date().toISOString()
      };
      updatedUser.badges = [...updatedUser.badges, journalBadge];
      xpGain += 25; // Bonus for badge
    }

    updatedUser.xp += xpGain;
    updatedUser.level = Math.floor(updatedUser.xp / 100) + 1; // Level up every 100 xp
    updatedUser.streak += 1; // Increment learning streak

    saveCurrentUser(updatedUser);
    setEarnedXP(xpGain);
    setShowXPModal(true);
    onRefreshUser();
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl" id="digital_worksheet">
      <div>
        <span className="font-sans text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> LKS Digital
        </span>
        <h3 className="font-sans font-bold text-lg text-white mt-1">Lembar Kerja Siswa & Jurnal Laporan</h3>
        <p className="font-sans text-xs text-slate-400 mt-0.5">Isi hipotesis, amati data, lakukan analisis, dan kirimkan laporan ini ke Guru pengampu Kelas Anda.</p>
      </div>

      {worksheet.submitted && (
        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-300">Laporan Terkirim! 🎉</span>
            <p className="mt-0.5 text-emerald-400/95">Laporan praktikum ini telah terkirim ke **Pak Bambang** untuk dinilai. Anda mendapatkan **+{earnedXP} XP**!</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Tujuan (Static) */}
        <div>
          <label className="block font-sans text-xs font-bold text-slate-200">1. Tujuan Eksperimen</label>
          <div className="mt-1.5 p-3.5 bg-black/40 border border-white/5 rounded-xl font-sans text-xs text-slate-300">
            Menganalisis hubungan variabel input (slider kontrol) terhadap variabel output (posisi, waktu, kecepatan) pada modul **{config.title}** secara virtual.
          </div>
        </div>

        {/* Hipotesis */}
        <div>
          <label className="block font-sans text-xs font-bold text-slate-200">2. Hipotesis Siswa</label>
          <p className="font-sans text-[10px] text-slate-500 mt-0.5">Tulis perkiraan ilmiah Anda mengenai pengaruh perubahan parameter terhadap hasil.</p>
          <textarea
            rows={3}
            disabled={worksheet.submitted}
            value={worksheet.hypothesis}
            onChange={(e) => setWorksheet({ ...worksheet, hypothesis: e.target.value })}
            placeholder="Contoh: Jika kecepatan awal (v) ditingkatkan, maka jarak horizontal (x) yang dicapai pada waktu t akan bertambah jauh secara linear..."
            className="w-full mt-2 p-3 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-cyan-500 disabled:bg-white/5 disabled:text-slate-500"
          />
        </div>

        {/* Analisis Data */}
        <div>
          <label className="block font-sans text-xs font-bold text-slate-200">3. Analisis Hasil Pengamatan</label>
          <p className="font-sans text-[10px] text-slate-500 mt-0.5">Uraikan pembuktian rumus fisika berdasarkan deretan angka koordinat di data logger.</p>
          <textarea
            rows={4}
            disabled={worksheet.submitted}
            value={worksheet.analysis}
            onChange={(e) => setWorksheet({ ...worksheet, analysis: e.target.value })}
            placeholder="Tuliskan analisis data Anda. Amati kemiringan grafik, hitung rasio perubahan kecepatan, bandingkan percepatan, dan kaitkan dengan hukum fisika..."
            className="w-full mt-2 p-3 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-cyan-500 disabled:bg-white/5 disabled:text-slate-500"
          />
        </div>

        {/* Kesimpulan */}
        <div>
          <label className="block font-sans text-xs font-bold text-slate-200">4. Kesimpulan Ilmiah</label>
          <p className="font-sans text-[10px] text-slate-500 mt-0.5">Apakah hipotesis Anda terbukti benar? Berikan kalimat rangkuman penutup.</p>
          <textarea
            rows={3}
            disabled={worksheet.submitted}
            value={worksheet.conclusion}
            onChange={(e) => setWorksheet({ ...worksheet, conclusion: e.target.value })}
            placeholder="Rangkum pemahaman baru yang Anda dapatkan dari praktikum virtual ini..."
            className="w-full mt-2 p-3 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-cyan-500 disabled:bg-white/5 disabled:text-slate-500"
          />
        </div>

        {/* Action Buttons */}
        {!worksheet.submitted && (
          <div className="flex gap-3 pt-3">
            <button
              id="save_draft_worksheet_btn"
              onClick={handleLocalSave}
              className="flex-1 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-sans text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Draf Disimpan' : 'Simpan Draf LKS'}</span>
            </button>
            <button
              id="submit_worksheet_btn"
              onClick={handleSubmitReport}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 animate-bounce" />
              <span>Kirim Jurnal Laporan</span>
            </button>
          </div>
        )}
      </div>

      {/* Gamification Success Badge Modal Overlay */}
      {showXPModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/10 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 text-slate-200">
            <div className="p-4 bg-yellow-500/10 text-yellow-400 rounded-full w-fit mx-auto animate-bounce border border-yellow-500/20">
              <Award className="w-12 h-12" />
            </div>

            <div>
              <span className="font-sans text-[10px] text-yellow-400 font-bold uppercase tracking-widest block">Laporan Praktikum Sukses</span>
              <h4 className="font-sans font-extrabold text-xl text-white mt-1">XP Diperoleh! +{earnedXP} Poin</h4>
              <p className="font-sans text-xs text-slate-400 mt-2">
                Selamat! Laporan ilmiah digital untuk **{config.title}** berhasil dipublikasikan ke Kelas Jurnal. Tingkat kemandirian belajar Anda terus meningkat!
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span className="font-sans font-bold text-xs">Level: {currentUser.level} • Streak: {currentUser.streak} Hari</span>
            </div>

            <button
              onClick={() => {
                setShowXPModal(false);
                onNavigateToDashboard();
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              Ke Dashboard Belajar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
