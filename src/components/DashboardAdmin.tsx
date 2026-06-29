import React, { useState } from 'react';
import { User, SystemSettings, SimConfig } from '../types';
import { 
  getStudentsList, 
  saveStudentList, 
  getSystemSettings, 
  saveSystemSettings, 
  resetDatabase 
} from '../utils/localStorage';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Code, 
  Check, 
  Info,
  RefreshCw
} from 'lucide-react';

interface DashboardAdminProps {
  currentUser: User;
  onRefreshAllData: () => void;
  onImportNewModule: (newModule: SimConfig) => void;
}

export default function DashboardAdmin({ 
  currentUser, 
  onRefreshAllData,
  onImportNewModule 
}: DashboardAdminProps) {
  const [students, setStudents] = useState<User[]>(getStudentsList());
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  
  // Create Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  
  // Custom Module JSON Uploader State
  const [customModuleJson, setCustomModuleJson] = useState(`{
  "id": "bandul",
  "title": "Simulasi Bandul Sederhana",
  "category": "mechanics",
  "description": "Mengukur periode ayunan bandul pada variasi panjang tali dan percepatan gravitasi planet.",
  "parameters": [
    {
      "id": "L",
      "name": "Panjang Tali",
      "label": "Panjang Tali (L)",
      "min": 0.2,
      "max": 2.0,
      "step": 0.1,
      "defaultValue": 1.0,
      "unit": "m"
    },
    {
      "id": "g",
      "name": "Gravitasi",
      "label": "Gravitasi Bumi (g)",
      "min": 1.0,
      "max": 25.0,
      "step": 0.5,
      "defaultValue": 9.8,
      "unit": "m/s²"
    }
  ],
  "outputs": [
    { "id": "t", "label": "Waktu (t)", "unit": "s", "color": "text-gray-500" },
    { "id": "theta", "label": "Sudut (θ)", "unit": "°", "color": "text-emerald-500" }
  ],
  "formulas": {
    "Periode Ayunan (T)": "T = 2π * √(L / g)"
  },
  "theoryMarkdown": "### Teori Bandul Sederhana\\n\\nPeriode ayunan bandul dipengaruhi oleh panjang tali dan gravitasi planet.",
  "steps": [
    "Ubah panjang tali menggunakan slider.",
    "Klik Mulai untuk melepaskan bandul dari sudut simpangan."
  ]
}`);
  const [moduleUploadMessage, setModuleUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveSettings = () => {
    saveSystemSettings(settings);
    alert('Pengaturan sistem berhasil diperbarui!');
    onRefreshAllData();
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;

    const newStudent: User = {
      id: `student_${Date.now()}`,
      name: newStudentName,
      email: newStudentEmail,
      role: 'STUDENT',
      school: settings.schoolName,
      xp: 0,
      level: 1,
      streak: 1,
      badges: []
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    saveStudentList(updated);
    setNewStudentName('');
    setNewStudentEmail('');
    onRefreshAllData();
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun siswa ini? Semua nilai & riwayat kuis akan ikut terhapus.')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      saveStudentList(updated);
      onRefreshAllData();
    }
  };

  // Custom JSON Module Validation and Import
  const handleUploadCustomModule = () => {
    try {
      const parsed = JSON.parse(customModuleJson);
      
      // Basic validation
      if (!parsed.id || !parsed.title || !parsed.parameters || !parsed.outputs) {
        throw new Error('JSON tidak lengkap. Harus memiliki id, title, parameters, dan outputs.');
      }

      onImportNewModule(parsed);
      setModuleUploadMessage({
        type: 'success',
        text: `Modul "${parsed.title}" berbasis konfigurasi berhasil diunggah secara dinamis!`
      });
      setTimeout(() => setModuleUploadMessage(null), 5000);
    } catch (err: any) {
      setModuleUploadMessage({
        type: 'error',
        text: `Format JSON tidak valid: ${err.message}`
      });
    }
  };

  // Database Backup (JSON Export)
  const handleExportDatabase = () => {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lab_maya_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_lab_maya_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Database Restore (JSON Import)
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, val]) => {
          if (key.startsWith('lab_maya_')) {
            localStorage.setItem(key, val as string);
          }
        });
        alert('Database Lab Maya berhasil dipulihkan!');
        window.location.reload();
      } catch (err) {
        alert('Gagal memulihkan database. Format file tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (confirm('PERINGATAN! Tindakan ini akan menghapus semua laporan, nilai kuis, dan data kustom di local storage, lalu memuat data bawaan pabrik. Lanjutkan?')) {
      resetDatabase();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin_dashboard_view">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="font-sans text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Konsol Administrator
          </span>
          <h2 className="font-sans font-bold text-2xl tracking-tight text-white mt-1">
            Pengaturan & Manajemen Lab Maya
          </h2>
          <p className="font-sans text-xs text-slate-400 mt-0.5">
            Konfigurasi platform, unggah modul berbasis JSON, kelola akun siswa, dan lakukan pencadangan data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (Sistem & Database - 1 col) */}
        <div className="space-y-6">
          {/* Settings Card */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm backdrop-blur-xl">
            <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-rose-400" /> Pengaturan Umum
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-sans text-[11px] font-semibold text-slate-400 uppercase">Nama Institusi / Sekolah</label>
                <input 
                  type="text" 
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] font-semibold text-slate-400 uppercase">Tahun Ajaran</label>
                <input 
                  type="text" 
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 font-sans text-xs border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="block font-sans text-xs font-bold text-slate-200">Akses Tamu (Guest)</span>
                  <span className="block font-sans text-[10px] text-slate-400">Izinkan pengguna mengeksplor tanpa login</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.allowGuestAccess}
                  onChange={(e) => setSettings({ ...settings, allowGuestAccess: e.target.checked })}
                  className="w-4 h-4 text-rose-500 bg-white/5 border-white/10 rounded-sm focus:ring-rose-500 focus:ring-offset-slate-900 cursor-pointer"
                />
              </div>

              <button 
                onClick={handleSaveSettings}
                className="w-full bg-rose-600 hover:bg-rose-500 text-black font-sans text-xs font-extrabold py-2.5 rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>

          {/* Database Admin Card */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm backdrop-blur-xl">
            <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-rose-400" /> Pemeliharaan Database
            </h3>

            <div className="space-y-3">
              <button 
                onClick={handleExportDatabase}
                className="w-full border border-white/10 hover:bg-white/10 text-slate-300 font-sans text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Cadangan (Backup .json)</span>
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  id="db_restore_file" 
                  accept=".json"
                  onChange={handleImportDatabase}
                  className="hidden"
                />
                <label 
                  htmlFor="db_restore_file"
                  className="w-full border border-white/10 hover:bg-white/10 text-slate-300 font-sans text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-dashed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan Cadangan (Restore)</span>
                </label>
              </div>

              <div className="h-px bg-white/10 my-4"></div>

              <button 
                onClick={handleResetDatabase}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-sans text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset ke Setelan Awal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center column (Config-driven module uploader - 2 cols span) */}
        <div className="lg:col-span-2 space-y-6">
          {/* JSON Config-Driven Simulation Uploader */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-rose-400" /> Format Berbasis Konfigurasi (JSON)
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-sm">
                Scalable Engine
              </span>
            </div>

            <p className="font-sans text-xs text-slate-400 mb-4">
              Sesuai rekomendasi arsitektur, Anda dapat menambahkan modul eksperimen baru secara dinamis dengan mengunggah skema JSON di bawah. Engine simulasi di "Laboratorium" akan mem-parsing parameter, rentang nilai, visualisasi, dan rumus fisika secara otomatis tanpa mengubah kode sumber React!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block font-sans text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Skema JSON Konfigurasi Modul</label>
                <textarea 
                  rows={10}
                  value={customModuleJson}
                  onChange={(e) => setCustomModuleJson(e.target.value)}
                  className="w-full font-mono text-xs p-4 bg-black/40 text-emerald-400 rounded-2xl border border-white/10 focus:outline-hidden focus:border-rose-500"
                  style={{ whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'auto' }}
                />
              </div>

              {moduleUploadMessage && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  moduleUploadMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{moduleUploadMessage.text}</span>
                </div>
              )}

              <button 
                onClick={handleUploadCustomModule}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Terapkan Modul Baru ke Laboratorium</span>
              </button>
            </div>
          </div>

          {/* User Directory Management */}
          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl shadow-sm backdrop-blur-xl">
            <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-rose-400" /> Manajemen Direktori Siswa
            </h3>

            {/* Form to add student */}
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
              <input 
                type="text" 
                placeholder="Nama Lengkap Siswa" 
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
                className="px-3 py-1.5 font-sans text-xs border border-white/10 bg-black/20 text-white rounded-lg focus:outline-hidden focus:border-rose-500"
              />
              <input 
                type="email" 
                placeholder="Email Siswa" 
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                required
                className="px-3 py-1.5 font-sans text-xs border border-white/10 bg-black/20 text-white rounded-lg focus:outline-hidden focus:border-rose-500"
              />
              <button 
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-black font-sans text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2.5 font-sans text-xs font-semibold text-slate-400">Siswa</th>
                    <th className="py-2.5 font-sans text-xs font-semibold text-slate-400">Email</th>
                    <th className="py-2.5 font-sans text-xs font-semibold text-slate-400 text-center">XP</th>
                    <th className="py-2.5 font-sans text-xs font-semibold text-slate-400 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-bold text-slate-200">{s.name}</td>
                      <td className="py-2.5 text-slate-400">{s.email}</td>
                      <td className="py-2.5 text-center font-semibold text-slate-300">{s.xp}</td>
                      <td className="py-2.5 text-right">
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
