import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, Minimize2, Maximize2, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  moduleTitle: string;
  activeParameters: { [key: string]: number };
  currentLogs: any[];
}

export default function AIAssistant({ 
  moduleTitle, 
  activeParameters, 
  currentLogs 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Saya adalah **Guru Asisten AI** Anda di Lab Maya. 👩‍🔬\n\nSaya memantau praktikum Anda di topik **${moduleTitle}**.\n\nAda yang bisa saya bantu jelaskan tentang teori, rumus, atau grafik pengamatan Anda hari ini?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle module title changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome_${moduleTitle}`,
        role: 'assistant',
        content: `Halo! Saya adalah **Guru Asisten AI** Anda di Lab Maya. 👩‍🔬\n\nSaya memantau praktikum Anda di topik **${moduleTitle}**.\n\nAda yang bisa saya bantu jelaskan tentang teori, rumus, atau grafik pengamatan Anda hari ini?`
      }
    ]);
  }, [moduleTitle]);

  const quickQuestions = [
    { text: 'Jelaskan rumus topik ini', q: 'Bisa jelaskan rumus fisika apa saja yang berlaku pada praktikum ini?' },
    { text: 'Mengapa grafik melengkung?', q: 'Mengapa grafik posisi terhadap waktu (x-t) melengkung, sedangkan kecepatan (v-t) lurus?' },
    { text: 'Pengaruh gesekan lantai', q: 'Bagaimana pengaruh koefisien gesek lantai terhadap percepatan kotak?' }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          moduleTitle,
          activeParameters,
          currentLogs
        })
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi server asisten AI.');
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_reply`,
        role: 'assistant',
        content: data.response
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `Maaf, saya mengalami kendala teknis: ${err.message || 'Koneksi terputus'}. Tetapi jangan khawatir, Anda tetap bisa melanjutkan simulasi fisikanya!`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Sparkle Button to open */}
      {!isOpen && (
        <button
          id="ai_tutor_floating_btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-black p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center space-x-2 z-40 cursor-pointer animate-bounce transition-all duration-300 border border-cyan-400"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-sans text-xs font-bold tracking-wide">Tanya Asisten AI</span>
        </button>
      )}

      {/* Main chat window container */}
      {isOpen && (
        <div 
          id="ai_tutor_sidebar"
          className={`fixed bottom-6 right-6 bg-[#0d1117]/95 backdrop-blur-xl rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col z-50 transition-all duration-300 ${
            isMinimized ? 'h-16 w-72' : 'h-[550px] w-96 max-w-[calc(100vw-2rem)]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 to-cyan-950 text-white p-4 rounded-t-3xl border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <h4 className="font-sans font-bold text-xs tracking-tight text-white">Tutor Fisika Lab Maya</h4>
                <span className="block text-[9px] text-cyan-300 font-medium">Didukung AI Pintar • Bahasa Indonesia</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Body (visible only when not minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="p-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed font-sans border shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500 text-black border-cyan-400 rounded-tr-none font-semibold shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
                        : 'bg-white/5 text-slate-200 border-white/5 rounded-tl-none'
                    }`}>
                      {/* Very basic Markdown parser mock for bolding and italics */}
                      <span className="block whitespace-pre-wrap">
                        {msg.content
                          .split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{chunk}</strong> : chunk)
                        }
                      </span>
                    </div>

                    {msg.role === 'user' && (
                      <div className="p-1.5 bg-white/5 text-slate-300 border border-white/10 rounded-lg shrink-0 mt-1">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-sans italic">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Tutor sedang berpikir ilmiah...</span>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Quick suggestions */}
              {messages.length < 3 && !isLoading && (
                <div className="px-4 py-2 border-t border-white/5 bg-[#0b0f19] flex flex-wrap gap-1.5">
                  {quickQuestions.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.q)}
                      className="text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full font-sans font-semibold transition-colors cursor-pointer border border-cyan-500/20"
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="p-3 border-t border-white/5 bg-[#0b0f19] rounded-b-3xl">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tanyakan konsep fisika di sini..."
                    className="flex-1 px-4 py-2 text-xs font-sans border border-white/10 bg-white/5 text-white rounded-xl focus:outline-hidden focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
