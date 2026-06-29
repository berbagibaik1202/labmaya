import { useState, useEffect } from 'react';
import { QuizQuestion, User, StudentExperimentReport } from '../types';
import { MODULE_QUIZZES } from '../data/simulations';
import { getReports, saveReport, getCurrentUser, saveCurrentUser } from '../utils/localStorage';
import { Award, CheckCircle, RefreshCw, Star, XCircle, ArrowRight } from 'lucide-react';

interface QuizSectionProps {
  moduleId: string;
  currentUser: User;
  onRefreshUser: () => void;
}

export default function QuizSection({ 
  moduleId, 
  currentUser,
  onRefreshUser
}: QuizSectionProps) {
  const quizQuestions = MODULE_QUIZZES[moduleId] || [];

  const [answers, setAnswers] = useState<{ [qId: string]: string | string[] }>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Matching specific state (tracks matched right values index-wise for matching questions)
  const [matchingSelections, setMatchingSelections] = useState<{ [qId: string]: { [leftTerm: string]: string } }>({});

  useEffect(() => {
    // Reset state for new module
    const reports = getReports();
    const existing = reports.find(r => r.studentId === currentUser.id && r.moduleId === moduleId);
    if (existing && existing.quiz.completed) {
      setAnswers(existing.quiz.answers);
      setScore(existing.quiz.score || 0);
      setCompleted(true);
    } else {
      setAnswers({});
      setMatchingSelections({});
      setCompleted(false);
      setScore(0);
    }
  }, [moduleId, currentUser]);

  const handleSelectMC = (qId: string, value: string) => {
    if (completed) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSelectMatching = (qId: string, left: string, right: string) => {
    if (completed) return;
    
    const currentMatches = { ...matchingSelections[qId], [left]: right };
    setMatchingSelections(prev => ({
      ...prev,
      [qId]: currentMatches
    }));

    // Update answers dictionary as an ordered array of matches
    const question = quizQuestions.find(q => q.id === qId);
    if (question && question.pairs) {
      const orderedAnswers = question.pairs.map(pair => currentMatches[pair.left] || '');
      setAnswers(prev => ({
        ...prev,
        [qId]: orderedAnswers
      }));
    }
  };

  const handleSubmitQuiz = () => {
    // Validate all answered
    const unanswered = quizQuestions.filter(q => {
      const ans = answers[q.id];
      if (!ans) return true;
      if (Array.isArray(ans) && ans.some(a => !a)) return true;
      return false;
    });

    if (unanswered.length > 0) {
      alert('Silakan jawab semua pertanyaan terlebih dahulu.');
      return;
    }

    // Auto grading
    let correctCount = 0;
    quizQuestions.forEach(q => {
      const studentAns = answers[q.id];
      if (Array.isArray(q.correctAnswer) && Array.isArray(studentAns)) {
        const isMatchPerfect = q.correctAnswer.every((val, idx) => val === studentAns[idx]);
        if (isMatchPerfect) correctCount++;
      } else if (typeof q.correctAnswer === 'string' && typeof studentAns === 'string') {
        if (q.correctAnswer.toLowerCase() === studentAns.toLowerCase()) {
          correctCount++;
        }
      }
    });

    const calculatedScore = Math.round((correctCount / quizQuestions.length) * 100);
    setScore(calculatedScore);
    setCompleted(true);

    // Save Quiz results to student report database
    const reportId = `report_${currentUser.id}_${moduleId}`;
    const reports = getReports();
    const existingReport = reports.find(r => r.studentId === currentUser.id && r.moduleId === moduleId);

    const quizStatePayload = {
      answers,
      score: calculatedScore,
      completed: true
    };

    const updatedReport: StudentExperimentReport = {
      id: reportId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      moduleId: moduleId,
      moduleTitle: existingReport?.moduleTitle || `${moduleId.toUpperCase()} Lab`,
      worksheet: existingReport?.worksheet || {
        hypothesis: '',
        observations: [],
        analysis: '',
        conclusion: '',
        submitted: false
      },
      quiz: quizStatePayload,
      createdAt: new Date().toISOString()
    };

    saveReport(updatedReport);

    // Gamification: Give XP points based on score
    const xpPoints = Math.round(calculatedScore * 0.5); // Max +50 XP
    let updatedUser = { ...currentUser };
    
    // Unlock specialized perfect score badges if score is 100
    if (calculatedScore === 100) {
      let badgeToUnlock: any = null;
      if (moduleId === 'glb') badgeToUnlock = 'master_glb';
      if (moduleId === 'parabola') badgeToUnlock = 'perfect_parabola';

      if (badgeToUnlock && !currentUser.badges.some(b => b.id === badgeToUnlock)) {
        const fullBadge = {
          id: badgeToUnlock,
          title: badgeToUnlock === 'master_glb' ? 'Master GLB' : 'Ahli Artileri',
          description: badgeToUnlock === 'master_glb' ? 'Menyelesaikan kuis Gerak Lurus Beraturan dengan nilai sempurna.' : 'Menemukan sudut terjauh 45° pada Gerak Parabola.',
          icon: 'Award',
          unlockedAt: new Date().toISOString()
        };
        updatedUser.badges = [...updatedUser.badges, fullBadge];
      }
    }

    updatedUser.xp += xpPoints;
    updatedUser.level = Math.floor(updatedUser.xp / 100) + 1;
    saveCurrentUser(updatedUser);
    onRefreshUser();
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setMatchingSelections({});
    setCompleted(false);
    setScore(0);
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl animate-fade-in" id="quiz_container">
      <div>
        <span className="font-sans text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Award className="w-3.5 h-3.5" /> Evaluasi Konsep
        </span>
        <h3 className="font-sans font-bold text-lg text-white mt-1">Kuis Pemahaman Fisika</h3>
        <p className="font-sans text-xs text-slate-400 mt-0.5">Kerjakan kuis berikut untuk memverifikasi pemahaman ilmiah Anda.</p>
      </div>

      {completed && (
        <div className={`p-5 rounded-2xl border text-center space-y-3 ${
          score >= 75 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className="flex justify-center">
            {score >= 75 ? <CheckCircle className="w-12 h-12 text-emerald-400" /> : <XCircle className="w-12 h-12 text-rose-400" />}
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-lg text-white">Skor Akhir: {score} / 100</h4>
            <p className="font-sans text-xs text-slate-400 mt-1">
              {score === 100 ? 'Luar biasa! Konsep ilmiah Anda sempurna.' : score >= 75 ? 'Bagus sekali! Anda memenuhi Kriteria Ketuntasan Minimal.' : 'Tingkatkan pemahaman Anda dan coba praktikum kembali!'}
            </p>
          </div>
          <button
            onClick={handleRetakeQuiz}
            className="font-sans text-xs font-bold bg-white/5 px-4 py-2 rounded-xl shadow-xs hover:bg-white/10 border border-white/10 transition-colors inline-flex items-center gap-1 cursor-pointer text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ulangi Kuis</span>
          </button>
        </div>
      )}

      <div className="space-y-6">
        {quizQuestions.map((q, qIndex) => {
          const isCorrect = completed && (
            Array.isArray(q.correctAnswer) && Array.isArray(answers[q.id])
              ? q.correctAnswer.every((val, idx) => val === (answers[q.id] as string[])[idx])
              : String(q.correctAnswer).toLowerCase() === String(answers[q.id]).toLowerCase()
          );

          return (
            <div 
              key={q.id} 
              className={`p-5 rounded-2xl border transition-all ${
                completed 
                  ? isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <span className="font-sans font-bold text-xs text-slate-200 leading-tight">
                  {qIndex + 1}. {q.question}
                </span>

                {completed && (
                  <span className={`text-xs font-extrabold font-sans uppercase tracking-wider ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? 'BENAR' : 'SALAH'}
                  </span>
                )}
              </div>

              {/* Multiple Choice Selector */}
              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {q.options.map((option, idx) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={idx}
                        disabled={completed}
                        onClick={() => handleSelectMC(q.id, option)}
                        className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-sans transition-all border cursor-pointer ${
                          isSelected 
                            ? 'bg-cyan-500 text-black border-cyan-400 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False Selector */}
              {q.type === 'TRUE_FALSE' && q.options && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {q.options.map((option, idx) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={idx}
                        disabled={completed}
                        onClick={() => handleSelectMC(q.id, option)}
                        className={`px-4 py-3 rounded-xl text-center text-xs font-sans font-bold tracking-wide transition-all border cursor-pointer uppercase ${
                          isSelected 
                            ? option === 'Benar' ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]' : 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Interactive Matching Pairs */}
              {q.type === 'MATCHING' && q.pairs && (
                <div className="mt-4 space-y-3">
                  {q.pairs.map((pair, pIdx) => {
                    const selectedMatch = matchingSelections[q.id]?.[pair.left] || '';
                    const rightOptions = Array.from(new Set(q.pairs!.map(p => p.right)));

                    return (
                      <div key={pIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="font-sans text-xs font-semibold text-slate-300">{pair.left}</span>
                        
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                          <select
                            disabled={completed}
                            value={selectedMatch}
                            onChange={(e) => handleSelectMatching(q.id, pair.left, e.target.value)}
                            className="px-2.5 py-1 text-xs border border-white/10 rounded-lg bg-[#0d1117] text-slate-200 font-sans focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="">-- Pilih Satuan --</option>
                            {rightOptions.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {!completed && (
        <button
          id="submit_quiz_btn"
          onClick={handleSubmitQuiz}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-extrabold py-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <Award className="w-4 h-4" />
          <span>Kumpulkan Hasil Kuis</span>
        </button>
      )}
    </div>
  );
}
