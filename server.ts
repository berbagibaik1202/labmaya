import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google GenAI client lazily & safely
  const getAiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  // 1. API: AI Physics Tutor Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    const { message, history, moduleTitle, activeParameters, currentLogs } = req.body;

    try {
      const ai = getAiClient();
      
      const systemInstruction = `Anda adalah "Guru Asisten AI" di platform "Lab Maya" (Laboratorium Virtual Interaktif Fisika).
Tugas Anda adalah memandu siswa memahami konsep-konsep fisika secara ramah, mendalam, dan mendidik.
Siswa saat ini sedang melakukan praktikum: "${moduleTitle || 'Umum'}".
Parameter kontrol yang aktif: ${JSON.stringify(activeParameters || {})}
Data pengamatan tabel saat ini: ${JSON.stringify(currentLogs || [])}

Aturan Komunikasi:
1. Jawablah dalam bahasa Indonesia yang baik, sopan, komunikatif, dan memotivasi.
2. Jangan memberikan jawaban langsung untuk kuis/lembar kerja mereka, melainkan jelaskan cara berpikir ilmiah di balik rumus tersebut (Socrates Method).
3. Hubungkan penjelasan Anda secara langsung dengan data tabel pengamatan (telah direkam dari simulasi) jika relevan untuk menunjukkan hubungan sebab-akibat fisika yang nyata.
4. Gunakan format Markdown yang rapi untuk penulisan rumus atau teks tebal agar nyaman dibaca.`;

      if (ai) {
        // Prepare chat history in correct SDK format
        const formattedContents = history.map((chat: any) => ({
          role: chat.role === 'user' ? 'user' : 'model',
          parts: [{ text: chat.content }]
        }));

        // Append current message
        formattedContents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });

        return res.json({ 
          response: response.text, 
          source: 'gemini-api' 
        });
      } else {
        // Graceful simulated physics tutor response fallback (if API key is not configured yet)
        let responseText = `Halo! Saya adalah Guru Asisten AI Lab Maya. (Mode Offline: Atur GEMINI_API_KEY di Secrets panel untuk mengaktifkan AI asli).\n\n`;
        
        const q = message.toLowerCase();
        if (q.includes('parabola') || q.includes('sudut') || q.includes('lintasan')) {
          responseText += `Pada Gerak Parabola, lintasan benda berbentuk melengkung karena adanya perpaduan gerak pada sumbu x (horizontal) yang bersifat konstan (GLB) dan sumbu y (vertikal) yang dipengaruhi gravitasi bumi (GLBB). \n\nJika Anda meningkatkan sudut elevasi menuju 45°, jangkauan horizontal (jarak x) akan bertambah panjang. Namun jika melebihi 45° (misal 60° atau 75°), proyektil akan terbang lebih tinggi tetapi jarak jatuhnya justru memendek. Cobalah menguji ini pada area simulasi Anda!`;
        } else if (q.includes('glb') || q.includes('konstan') || q.includes('lurus')) {
          responseText += `Pada Gerak Lurus Beraturan (GLB), kecepatan benda selalu konstan setiap detik ($v = \\text{tetap}$). Oleh karena itu, posisi benda ($x$) akan bertambah secara linier sebanding dengan waktu ($t$). Rumus utamanya adalah $x = x_0 + v \\cdot t$. Amati grafik Posisi terhadap Waktu ($x-t$) di simulasi Anda, grafiknya berupa garis lurus diagonal miring ke atas!`;
        } else if (q.includes('glbb') || q.includes('percepatan')) {
          responseText += `Pada Gerak Lurus Berubah Beraturan (GLBB), benda memiliki percepatan konstan ($a = \\text{konstan}$). Ini artinya kecepatannya bertambah (atau berkurang) secara teratur. Grafik Posisi terhadap Waktu ($x-t$) akan melengkung parabola karena rumus posisinya menggunakan kuadrat waktu: $x = x_0 + v_0 t + \\frac{1}{2} a t^2$.`;
        } else if (q.includes('newton') || q.includes('gaya') || q.includes('massa')) {
          responseText += `Hukum II Newton menyatakan $F = m \\cdot a$, yang berarti percepatan ($a$) sebanding dengan resultan gaya bersih ($F$) dan berbanding terbalik dengan massa benda ($m$). Jika Anda mendorong kotak dengan gaya yang lebih besar, percepatannya akan meningkat. Namun jika massa kotak ditambah menjadi lebih berat, maka dengan gaya yang sama, percepatannya akan melambat. Faktor koefisien gesek ($\\%mu$) akan menghasilkan gaya gesek penghambat yang mengurangi gaya pendorong Anda!`;
        } else {
          responseText += `Tentu! Berdasarkan data pengamatan Anda yang aktif untuk praktikum **${moduleTitle}**, mari kita diskusikan cara kerja rumus fisika yang relevan. \n\nApakah Anda ingin tahu bagaimana perubahan parameter kontrol (slider Anda) mempengaruhi grafik atau tabel pengamatan yang sedang Anda rekam? Tanyakan saja variabel spesifiknya!`;
        }

        return res.json({ 
          response: responseText, 
          source: 'local-simulation' 
        });
      }
    } catch (error: any) {
      console.error('Error in AI Tutor endpoint:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // 2. Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lab Maya] Full-stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
