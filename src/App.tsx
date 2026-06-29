import { useState, useEffect } from 'react';
import { User, SimConfig, DataLogEntry } from './types';
import { PHYSICS_MODULES } from './data/simulations';
import { getCurrentUser, getReports, getSystemSettings } from './utils/localStorage';
import Navigation from './components/Navigation';
import DashboardStudent from './components/DashboardStudent';
import DashboardTeacher from './components/DashboardTeacher';
import DashboardAdmin from './components/DashboardAdmin';
import SimulationEngine from './components/SimulationEngine';
import WorksheetSection from './components/WorksheetSection';
import QuizSection from './components/QuizSection';
import AIAssistant from './components/AIAssistant';
import { 
  Atom, 
  ChevronRight, 
  BookOpen, 
  Settings, 
  ChevronLeft, 
  Compass, 
  Sliders, 
  FileText, 
  Award,
  ArrowRight,
  Flame,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('simulations');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  // Custom Modules state (configuration-driven)
  const [modulesList, setModulesList] = useState<SimConfig[]>(PHYSICS_MODULES);

  // Lab internal sub-tab navigation (Theory vs. Sandbox Sim vs. Worksheet vs. Quiz)
  const [labSubTab, setLabSubTab] = useState<'theory' | 'simulation' | 'worksheet' | 'quiz'>('theory');

  // Recorded logs of the current session to link SimulationEngine data with WorksheetSection
  const [currentRecordedLogs, setCurrentRecordedLogs] = useState<DataLogEntry[]>([]);

  // Reload current user info from local storage when changes occur
  const handleRefreshUser = () => {
    setCurrentUser(getCurrentUser());
  };

  // Add dynamically uploaded config JSON module
  const handleImportNewModule = (newModule: SimConfig) => {
    const updated = [...modulesList];
    const index = updated.findIndex(m => m.id === newModule.id);
    if (index !== -1) {
      updated[index] = newModule;
    } else {
      updated.push(newModule);
    }
    setModulesList(updated);
  };

  const selectedModule = modulesList.find(m => m.id === selectedModuleId);

  // Set default view on role changes to avoid invalid dashboards
  useEffect(() => {
    if (currentUser.role === 'TEACHER') {
      setActiveTab('teacher_dashboard');
    } else if (currentUser.role === 'ADMIN') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('simulations');
    }
    setSelectedModuleId(null);
  }, [currentUser.role]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" id="lab_maya_application">
      {/* Navigation Header */}
      <Navigation 
        currentUser={currentUser} 
        onUserChange={setCurrentUser} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container Area */}
      <main className="flex-1 pb-16">
        
        {/* STUDENT VIEW - Available simulations uploader */}
        {activeTab === 'simulations' && !selectedModuleId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="simulations_list_view">
            <div className="mb-8">
              <span className="font-sans text-xs text-emerald-600 font-bold uppercase tracking-wider">Laboratorium Maya</span>
              <h2 className="font-sans font-bold text-2xl tracking-tight text-gray-900 mt-1">
                Eksperimen Fisika Virtual
              </h2>
              <p className="font-sans text-xs text-gray-400 mt-0.5">
                Pilih topik di bawah untuk menjalankan simulasi 2D interaktif, merekam tabel numerik, dan mengerjakan lembar kuis evaluasi.
              </p>
            </div>

            {/* List grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesList.map((mod) => (
                <div 
                  key={mod.id}
                  className="bg-white border border-gray-100 rounded-3xl p-5 hover:border-emerald-100 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-emerald-50 text-emerald-700 font-sans text-[10px] font-bold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                        {mod.category === 'mechanics' ? 'Mekanika' : mod.category}
                      </span>
                      <div className="p-2 bg-gray-50 text-gray-400 rounded-xl">
                        <Atom className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="font-sans font-extrabold text-base text-gray-900 tracking-tight leading-snug">
                      {mod.title}
                    </h3>
                    
                    <p className="font-sans text-xs text-gray-500 mt-2 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between">
                    <span className="font-sans text-[10px] text-gray-400">
                      Formulasi Tersemat: <b>{Object.keys(mod.formulas).length} Rumus</b>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setLabSubTab('theory');
                        setCurrentRecordedLogs([]);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Masuk Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE SIMULATION INTERFACE (Side-by-side tabs layout as configured in sections 10 & 11) */}
        {activeTab === 'simulations' && selectedModuleId && selectedModule && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="active_lab_workspace">
            {/* Breadcrumbs & Navigation Back */}
            <div className="flex items-center space-x-2 text-xs font-sans text-gray-400 mb-4">
              <button 
                onClick={() => setSelectedModuleId(null)}
                className="hover:text-gray-900 flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Laboratorium</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium">{selectedModule.title}</span>
            </div>

            {/* Title banner */}
            <div className="pb-4 border-b border-gray-100 mb-6">
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-gray-900 tracking-tight">
                {selectedModule.title}
              </h2>
              <p className="font-sans text-xs text-gray-400 mt-0.5">{selectedModule.description}</p>
            </div>

            {/* Sidebar vs. Main Arena Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left sidebar - Section Navigation (Section 10) */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-xs space-y-1">
                  <span className="block font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-2">
                    Tahapan Praktikum
                  </span>

                  <button
                    onClick={() => setLabSubTab('theory')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                      labSubTab === 'theory' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Tujuan & Teori</span>
                  </button>

                  <button
                    onClick={() => setLabSubTab('simulation')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                      labSubTab === 'simulation' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Simulasi & Grafik</span>
                  </button>

                  <button
                    onClick={() => setLabSubTab('worksheet')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                      labSubTab === 'worksheet' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Worksheet / LKS</span>
                  </button>

                  <button
                    onClick={() => setLabSubTab('quiz')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                      labSubTab === 'quiz' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Kuis Evaluasi</span>
                  </button>
                </div>

                {/* Info block */}
                <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 text-[11px] font-sans text-emerald-800 leading-relaxed">
                  <span className="font-bold block mb-1">💡 Tips Eksperimen:</span>
                  Ubah parameter di tab **Simulasi** menggunakan slider, lalu amati perubahan grafik real-time. Tekan **Rekam Data** untuk mengisi tabel Worksheet Anda!
                </div>
              </div>

              {/* Center / Right - Active Content Pane */}
              <div className="lg:col-span-3">
                {/* 1. Theory Tab */}
                {labSubTab === 'theory' && (
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in" id="theory_view">
                    <div>
                      <span className="font-sans text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Materi Praktikum</span>
                      <h3 className="font-sans font-bold text-lg text-gray-900 mt-1">Landasan Teori</h3>
                    </div>

                    <div className="prose prose-emerald max-w-none text-xs text-gray-600 font-sans leading-relaxed space-y-4">
                      {/* Simple custom markdown style text parsing */}
                      {selectedModule.theoryMarkdown.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-sans font-bold text-sm text-gray-900 mb-3">Langkah Percobaan:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-xs text-gray-600 font-sans">
                        {selectedModule.steps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <button
                      onClick={() => setLabSubTab('simulation')}
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer ml-auto"
                    >
                      <span>Lanjut ke Simulasi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 2. Simulation Sandbox Tab */}
                {labSubTab === 'simulation' && (
                  <div className="space-y-6">
                    <SimulationEngine 
                      config={selectedModule} 
                      onDataRecorded={setCurrentRecordedLogs}
                      currentUser={currentUser}
                    />

                    <div className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
                      <span className="font-sans text-xs text-gray-500">
                        Deretan data logger: <b>{currentRecordedLogs.length} baris terekam</b>
                      </span>
                      <button
                        onClick={() => setLabSubTab('worksheet')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Tulis Laporan (Worksheet)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Worksheet Digital Tab */}
                {labSubTab === 'worksheet' && (
                  <WorksheetSection 
                    config={selectedModule}
                    recordedLogs={currentRecordedLogs}
                    currentUser={currentUser}
                    onRefreshUser={handleRefreshUser}
                    onNavigateToDashboard={() => setActiveTab('student_dashboard')}
                  />
                )}

                {/* 4. Quiz Tab */}
                {labSubTab === 'quiz' && (
                  <QuizSection 
                    moduleId={selectedModule.id}
                    currentUser={currentUser}
                    onRefreshUser={handleRefreshUser}
                  />
                )}
              </div>

            </div>

            {/* Persistent Tutor Sidebar */}
            <AIAssistant 
              moduleTitle={selectedModule.title} 
              activeParameters={{}} 
              currentLogs={currentRecordedLogs} 
            />
          </div>
        )}

        {/* STUDENT VIEW - Dashboard */}
        {activeTab === 'student_dashboard' && (
          <DashboardStudent 
            currentUser={currentUser} 
            onSelectModule={(modId) => {
              setSelectedModuleId(modId);
              setLabSubTab('simulation');
              setActiveTab('simulations');
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {/* STUDENT VIEW - Reports list */}
        {activeTab === 'reports_list' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="student_reports_view">
            <div className="mb-6">
              <span className="font-sans text-xs text-emerald-600 font-bold uppercase tracking-wider">Daftar Jurnal</span>
              <h2 className="font-sans font-bold text-2xl tracking-tight text-gray-900 mt-1">Laporan Praktikum Anda</h2>
              <p className="font-sans text-xs text-gray-400 mt-0.5">Tinjau kembali laporan atau evaluasi nilai guru untuk setiap modul.</p>
            </div>

            {getReports().filter(r => r.studentId === currentUser.id).length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-sm text-gray-400 font-sans italic">
                Anda belum mengirimkan laporan praktikum ke kelas jurnal. Silakan masuk laboratorium dan selesaikan LKS Digital.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getReports().filter(r => r.studentId === currentUser.id).map(report => (
                  <div key={report.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                          Laporan Terkirim
                        </span>
                        <h3 className="font-sans font-bold text-sm text-gray-900 mt-1.5">{report.moduleTitle}</h3>
                      </div>

                      {report.grade !== undefined ? (
                        <div className="text-right">
                          <span className="block text-[9px] text-gray-400">NILAI GURU</span>
                          <span className="font-mono font-bold text-lg text-emerald-600">{report.grade} / 100</span>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-1 rounded-md border border-amber-200">
                          Menunggu Review
                        </span>
                      )}
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div className="space-y-2 text-xs text-gray-600 font-sans">
                      <div>
                        <span className="font-bold block text-gray-700">Hipotesis:</span>
                        <p className="italic text-gray-500">"{report.worksheet.hypothesis}"</p>
                      </div>
                      {report.feedback && (
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-blue-900 mt-2">
                          <span className="font-bold block text-[10px] text-blue-800">Catatan/Umpan Balik Guru:</span>
                          <p className="mt-0.5 text-blue-700">{report.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEACHER VIEW - Dashboard */}
        {activeTab === 'teacher_dashboard' && currentUser.role === 'TEACHER' && (
          <DashboardTeacher currentUser={currentUser} />
        )}

        {/* ADMIN VIEW - Dashboard */}
        {activeTab === 'admin_dashboard' && currentUser.role === 'ADMIN' && (
          <DashboardAdmin 
            currentUser={currentUser} 
            onRefreshAllData={handleRefreshUser}
            onImportNewModule={handleImportNewModule}
          />
        )}

      </main>
    </div>
  );
}
