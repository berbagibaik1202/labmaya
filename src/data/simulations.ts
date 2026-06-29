import { SimConfig, QuizQuestion } from '../types';

export const PHYSICS_MODULES: SimConfig[] = [
  {
    id: 'glb',
    title: 'Gerak Lurus Beraturan (GLB)',
    category: 'mechanics',
    description: 'Simulasi gerakan benda dengan kecepatan konstan tanpa adanya percepatan. Amati hubungan linier antara posisi dan waktu.',
    parameters: [
      {
        id: 'v0',
        name: 'Kecepatan Awal',
        label: 'Kecepatan (v)',
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 5,
        unit: 'm/s',
        description: 'Kecepatan konstan mobil mainan sepanjang lintasan lurus.'
      },
      {
        id: 'x0',
        name: 'Posisi Awal',
        label: 'Posisi Awal (x₀)',
        min: 0,
        max: 50,
        step: 1,
        defaultValue: 0,
        unit: 'm',
        description: 'Titik start awal mobil mainan.'
      }
    ],
    outputs: [
      { id: 't', label: 'Waktu (t)', unit: 's', color: 'text-gray-500' },
      { id: 'x', label: 'Posisi (x)', unit: 'm', color: 'text-emerald-500' },
      { id: 'v', label: 'Kecepatan (v)', unit: 'm/s', color: 'text-blue-500' },
      { id: 'a', label: 'Percepatan (a)', unit: 'm/s²', color: 'text-amber-500' }
    ],
    formulas: {
      'Posisi (x)': 'x = x₀ + v × t',
      'Kecepatan (v)': 'v = konstan',
      'Percepatan (a)': 'a = 0'
    },
    theoryMarkdown: `### Teori Gerak Lurus Beraturan (GLB)

Gerak Lurus Beraturan (GLB) didefinisikan sebagai gerak suatu benda pada lintasan lurus dengan kecepatan yang konstan atau tetap. Karena kecepatannya tetap, maka perubahan kecepatannya adalah nol, yang berarti **percepatan benda bernilai nol** ($a = 0$).

#### Rumus Utama:
$$x = x_0 + v \\cdot t$$

Dimana:
* $x$ = Posisi akhir pada waktu $t$ (m)
* $x_0$ = Posisi awal (m)
* $v$ = Kecepatan konstan (m/s)
* $t$ = Selang waktu tempuh (s)

#### Karakteristik Grafik GLB:
1. **Grafik Posisi vs Waktu ($x-t$)**: Berupa garis lurus miring ke atas. Kemiringan (gradien) garis menunjukkan nilai kecepatannya. Semakin curam grafiknya, semakin besar kecepatannya.
2. **Grafik Kecepatan vs Waktu ($v-t$)**: Berupa garis horizontal mendatar. Ini membuktikan bahwa kecepatan selalu konstan di setiap waktu.
3. **Grafik Percepatan vs Waktu ($a-t$)**: Berupa garis mendatar tepat di sumbu $t = 0$.`,
    steps: [
      'Atur nilai Kecepatan Awal (v) sesuai petunjuk menggunakan slider kontrol.',
      'Tentukan Posisi Awal (x₀) mobil mainan.',
      'Klik tombol "Mulai" untuk menjalankan simulasi.',
      'Klik tombol "Rekam Data" pada beberapa interval waktu (misal t = 1s, t = 2s, dst.) untuk menyimpan koordinat ke Tabel Pengamatan.',
      'Amati grafik real-time Posisi vs Waktu dan Kecepatan vs Waktu yang terbentuk.',
      'Selesaikan LKS Digital dan selesaikan kuis untuk menguji pemahaman Anda.'
    ]
  },
  {
    id: 'glbb',
    title: 'Gerak Lurus Berubah Beraturan (GLBB)',
    category: 'mechanics',
    description: 'Simulasi gerakan benda dengan percepatan konstan. Amati grafik posisi parabola dan grafik kecepatan linier terhadap waktu.',
    parameters: [
      {
        id: 'v0',
        name: 'Kecepatan Awal',
        label: 'Kecepatan Awal (v₀)',
        min: 0,
        max: 15,
        step: 0.5,
        defaultValue: 2,
        unit: 'm/s',
        description: 'Kecepatan mobil saat memulai pergerakan.'
      },
      {
        id: 'a',
        name: 'Percepatan',
        label: 'Percepatan (a)',
        min: -5,
        max: 5,
        step: 0.2,
        defaultValue: 1.5,
        unit: 'm/s²',
        description: 'Percepatan konstan (jika positif mempercepat, jika negatif memperlambat).'
      },
      {
        id: 'x0',
        name: 'Posisi Awal',
        label: 'Posisi Awal (x₀)',
        min: 0,
        max: 20,
        step: 1,
        defaultValue: 0,
        unit: 'm',
        description: 'Titik start awal mobil.'
      }
    ],
    outputs: [
      { id: 't', label: 'Waktu (t)', unit: 's', color: 'text-gray-500' },
      { id: 'x', label: 'Posisi (x)', unit: 'm', color: 'text-emerald-500' },
      { id: 'v', label: 'Kecepatan (v)', unit: 'm/s', color: 'text-blue-500' },
      { id: 'a', label: 'Percepatan (a)', unit: 'm/s²', color: 'text-amber-500' }
    ],
    formulas: {
      'Kecepatan (vt)': 'v_t = v_0 + a × t',
      'Posisi (x)': 'x = x_0 + v_0 × t + 0.5 × a × t²',
      'Kuadrat Kecepatan': 'v_t² = v_0² + 2 × a × (x - x_0)'
    },
    theoryMarkdown: `### Teori Gerak Lurus Berubah Beraturan (GLBB)

Gerak Lurus Berubah Beraturan (GLBB) didefinisikan sebagai gerak suatu benda pada lintasan lurus dengan **percepatan yang konstan atau tetap** ($a = \\text{konstan}$). Ini berarti kecepatannya berubah secara teratur setiap detiknya.

Jika percepatan bernilai positif ($a > 0$), benda mengalami **dipercepat**. Jika percepatan bernilai negatif ($a < 0$), benda mengalami **diperlambat**.

#### Rumus Utama GLBB:
1. Kecepatan akhir:
   $$v_t = v_0 + a \\cdot t$$
2. Posisi akhir:
   $$x = x_0 + v_0 \\cdot t + \\frac{1}{2} a \\cdot t^2$$
3. Hubungan kecepatan dan jarak tanpa waktu:
   $$v_t^2 = v_0^2 + 2 a \\cdot (x - x_0)$$

#### Karakteristik Grafik GLBB:
* **Grafik Posisi vs Waktu ($x-t$)**: Berupa kurva parabola melengkung ke atas (dipercepat) atau melengkung ke bawah (diperlambat).
* **Grafik Kecepatan vs Waktu ($v-t$)**: Berupa garis miring naik (dipercepat) atau turun (diperlambat). Kemiringan garis mewakili nilai percepatan.
* **Grafik Percepatan vs Waktu ($a-t$)**: Berupa garis horizontal lurus di atas sumbu t (untuk percepatan positif) atau di bawah sumbu t (untuk percepatan negatif).`,
    steps: [
      'Atur Kecepatan Awal (v₀) dan nilai Percepatan (a) menggunakan slider.',
      'Klik "Mulai" untuk menjalankan mobil sepanjang lintasan.',
      'Amati bagaimana kecepatan bertambah cepat (atau melambat jika a < 0).',
      'Tekan tombol "Rekam Data" untuk mencatat kombinasi waktu, posisi, dan kecepatan.',
      'Bandingkan kelengkungan grafik Posisi vs Waktu dengan garis lurus Kecepatan vs Waktu.'
    ]
  },
  {
    id: 'parabola',
    title: 'Gerak Parabola (Projectile Motion)',
    category: 'mechanics',
    description: 'Simulasi peluncuran proyektil meriam dalam lintasan 2 dimensi dipengaruhi gaya gravitasi bumi. Amati pengaruh sudut dan kecepatan awal.',
    parameters: [
      {
        id: 'v0',
        name: 'Kecepatan Awal',
        label: 'Kecepatan Awal (v₀)',
        min: 5,
        max: 30,
        step: 1,
        defaultValue: 15,
        unit: 'm/s',
        description: 'Kecepatan awal proyektil saat keluar dari meriam.'
      },
      {
        id: 'angle',
        name: 'Sudut Elevasi',
        label: 'Sudut Elevasi (θ)',
        min: 0,
        max: 90,
        step: 5,
        defaultValue: 45,
        unit: '°',
        description: 'Sudut kemiringan laras meriam terhadap bidang horizontal.'
      },
      {
        id: 'g',
        name: 'Percepatan Gravitasi',
        label: 'Gaya Gravitasi (g)',
        min: 5,
        max: 20,
        step: 0.1,
        defaultValue: 9.8,
        unit: 'm/s²',
        description: 'Konstanta gravitasi bumi atau planet lain.'
      },
      {
        id: 'h0',
        name: 'Ketinggian Awal',
        label: 'Tinggi Meriam (h₀)',
        min: 0,
        max: 15,
        step: 0.5,
        defaultValue: 0,
        unit: 'm',
        description: 'Tinggi meriam di atas tanah.'
      }
    ],
    outputs: [
      { id: 't', label: 'Waktu (t)', unit: 's', color: 'text-gray-500' },
      { id: 'x', label: 'Jarak Horisontal (x)', unit: 'm', color: 'text-emerald-500' },
      { id: 'y', label: 'Ketinggian (y)', unit: 'm', color: 'text-blue-500' },
      { id: 'vx', label: 'Kecepatan x (v_x)', unit: 'm/s', color: 'text-indigo-500' },
      { id: 'vy', label: 'Kecepatan y (v_y)', unit: 'm/s', color: 'text-purple-500' }
    ],
    formulas: {
      'Kecepatan awal x': 'v₀x = v₀ × cos(θ)',
      'Kecepatan awal y': 'v₀y = v₀ × sin(θ)',
      'Jarak Horisontal (x)': 'x = v₀x × t',
      'Ketinggian (y)': 'y = h₀ + v₀y × t - 0.5 × g × t²',
      'Jarak Terjauh Max': 'x_max = (v₀² × sin(2θ)) / g',
      'Tinggi Maksimum': 'y_max = h₀ + (v₀² × sin²(θ)) / (2g)'
    },
    theoryMarkdown: `### Teori Gerak Parabola

Gerak Parabola merupakan perpaduan antara dua jenis gerakan pada dua sumbu koordinat yang saling tegak lurus:
1. **Sumbu Horisontal (Sumbu x)**: Mengalami **Gerak Lurus Beraturan (GLB)** karena tidak ada percepatan pada arah horisontal ($a_x = 0$, mengabaikan gesekan udara). Kecepatan arah mendatar selalu konstan.
2. **Sumbu Vertikal (Sumbu y)**: Mengalami **Gerak Lurus Berubah Beraturan (GLBB)** karena dipengaruhi oleh percepatan gravitasi bumi ($a_y = -g$). Kecepatan arah vertikal akan berkurang hingga nol di titik puncak, lalu berbalik arah dan bertambah cepat ke bawah.

#### Rumus Analisis:
* Kecepatan komponen awal:
  $$v_{0x} = v_0 \\cos \\theta$$
  $$v_{0y} = v_0 \\sin \\theta$$

* Posisi setiap saat ($t$):
  $$x(t) = v_{0x} \\cdot t$$
  $$y(t) = h_0 + v_{0y} \\cdot t - \\frac{1}{2} g t^2$$

* Titik Tertinggi ($y_{max}$):
  $$y_{max} = h_0 + \\frac{v_0^2 \\sin^2 \\theta}{2g}$$

* Jangkauan Terjauh di tanah ($x_{max}$ ketika $h_0 = 0$):
  $$x_{max} = \\frac{v_0^2 \\sin(2\\theta)}{g}$$`,
    steps: [
      'Atur Kecepatan Awal (v₀) dan Sudut Elevasi (θ). Letakkan meriam di tanah (h₀ = 0) atau di ketinggian tertentu.',
      'Klik tombol "Mulai" untuk menembakkan meriam.',
      'Gunakan tombol "Pause" untuk menghentikan proyektil di udara dan mencatat koordinat (x, y) serta kecepatannya.',
      'Coba ubah Sudut Elevasi ke 30°, 45°, dan 60°. Catat sudut mana yang menghasilkan jangkauan horizontal terjauh.',
      'Verifikasi hasil simulasi dengan rumus jangkauan teoritis menggunakan kalkulator formula di panel samping.'
    ]
  },
  {
    id: 'newton2',
    title: 'Hukum Newton II (F = m × a)',
    category: 'mechanics',
    description: 'Simulasi mendorong kotak kayu dengan variasi massa, gaya dorong, dan koefisien gesek permukaan lantai. Amati percepatan kotak.',
    parameters: [
      {
        id: 'F',
        name: 'Gaya Dorong',
        label: 'Gaya Pendorong (F)',
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 40,
        unit: 'N',
        description: 'Gaya konstan yang mendorong kotak ke arah kanan.'
      },
      {
        id: 'm',
        name: 'Massa Kotak',
        label: 'Massa Benda (m)',
        min: 2,
        max: 50,
        step: 1,
        defaultValue: 10,
        unit: 'kg',
        description: 'Massa kotak kayu.'
      },
      {
        id: 'mu',
        name: 'Koefisien Gesek',
        label: 'Gesekan Lantai (μ_k)',
        min: 0,
        max: 0.8,
        step: 0.05,
        defaultValue: 0.2,
        unit: '',
        description: 'Koefisien gesek kinetis antara kotak kayu dengan lantai.'
      }
    ],
    outputs: [
      { id: 't', label: 'Waktu (t)', unit: 's', color: 'text-gray-500' },
      { id: 'fk', label: 'Gaya Gesek (f_k)', unit: 'N', color: 'text-rose-500' },
      { id: 'Fnet', label: 'Gaya Bersih (ΣF)', unit: 'N', color: 'text-emerald-500' },
      { id: 'a', label: 'Percepatan (a)', unit: 'm/s²', color: 'text-purple-500' },
      { id: 'v', label: 'Kecepatan Akhir (v)', unit: 'm/s', color: 'text-blue-500' }
    ],
    formulas: {
      'Gaya Normal (N)': 'N = m × g (g = 9.8 m/s²)',
      'Gaya Gesek Maksimum': 'f_s = μ_s × N (f_k = μ_k × m × 9.8)',
      'Gaya Bersih (ΣF)': 'ΣF = F - f_k (jika F > f_s)',
      'Percepatan (a)': 'a = ΣF / m'
    },
    theoryMarkdown: `### Teori Hukum II Newton

Hukum Kedua Newton menyatakan bahwa percepatan ($a$) yang dihasilkan oleh gaya bersih (resultan gaya) yang bekerja pada suatu benda berbanding lurus dengan besar gaya bersih tersebut, searah dengan gaya tersebut, dan berbanding terbalik dengan massa benda ($m$).

#### Rumus Utama:
$$\\Sigma F = m \\cdot a \\implies a = \\frac{\\Sigma F}{m}$$

#### Gaya Gesek Kinetis ($f_k$):
Ketika benda bergerak pada permukaan yang kasar, benda akan mengalami gaya hambat berupa gaya gesek kinetis yang arahnya berlawanan dengan arah gerak benda.
$$f_k = \\mu_k \\cdot N = \\mu_k \\cdot m \\cdot g$$

Dimana:
* $\\Sigma F$ = Resultan gaya bersih (N)
* $F$ = Gaya dorong yang diberikan (N)
* $f_k$ = Gaya gesek kinetis (N)
* $m$ = Massa benda (kg)
* $a$ = Percepatan benda ($m/s^2$)
* $\\mu_k$ = Koefisien gesek kinetik lantai
* $g$ = Percepatan gravitasi ($9.8 m/s^2$)

#### Analisis Kondisi Gerak:
1. Jika gaya dorong $F \\le f_k$, kotak tidak akan bergerak (percepatan $a = 0$).
2. Jika gaya dorong $F > f_k$, kotak mengalami percepatan konstan sebesar:
   $$a = \\frac{F - f_k}{m}$$`,
    steps: [
      'Atur Gaya Pendorong (F) dan Massa Benda (m). Amati indikator anak panah gaya pada diagram benda bebas.',
      'Ubah koefisien Gesekan Lantai (μ_k) dari licin sempurna (0) ke sangat kasar (0.8).',
      'Klik tombol "Mulai" untuk menerapkan gaya dorong.',
      'Jika gaya bersih ΣF bernilai positif, kotak kayu akan mulai dipercepat ke kanan.',
      'Catat waktu dan kecepatan kotak kayu ke dalam tabel pengamatan untuk memverifikasi nilai percepatan.'
    ]
  }
];

export const MODULE_QUIZZES: { [moduleId: string]: QuizQuestion[] } = {
  glb: [
    {
      id: 'glb_1',
      type: 'MULTIPLE_CHOICE',
      question: 'Manakah dari pernyataan berikut yang paling tepat mendefinisikan Gerak Lurus Beraturan (GLB)?',
      options: [
        'Gerak lintasan melingkar dengan kecepatan konstan',
        'Gerak lintasan lurus dengan perubahan kecepatan teratur',
        'Gerak lintasan lurus dengan kecepatan konstan sehingga percepatannya nol',
        'Gerak lintasan bebas dengan percepatan konstan'
      ],
      correctAnswer: 'Gerak lintasan lurus dengan kecepatan konstan sehingga percepatannya nol'
    },
    {
      id: 'glb_2',
      type: 'TRUE_FALSE',
      question: 'Pada Gerak Lurus Beraturan (GLB), grafik posisi terhadap waktu (x - t) digambarkan sebagai kurva melengkung parabola.',
      options: ['Benar', 'Salah'],
      correctAnswer: 'Salah'
    },
    {
      id: 'glb_3',
      type: 'MATCHING',
      question: 'Pasangkanlah variabel fisika berikut dengan satuannya yang benar dalam standar Internasional (SI):',
      pairs: [
        { left: 'Kecepatan (v)', right: 'm/s' },
        { left: 'Waktu (t)', right: 's' },
        { left: 'Posisi (x)', right: 'm' },
        { left: 'Percepatan (a)', right: 'm/s²' }
      ],
      correctAnswer: ['m/s', 's', 'm', 'm/s²']
    }
  ],
  glbb: [
    {
      id: 'glbb_1',
      type: 'MULTIPLE_CHOICE',
      question: 'Sebuah mobil mainan bergerak dengan kecepatan awal 2 m/s dan mengalami percepatan tetap 3 m/s². Berapakah kecepatan mobil tersebut setelah bergerak selama 4 detik?',
      options: [
        '8 m/s',
        '10 m/s',
        '14 m/s',
        '16 m/s'
      ],
      correctAnswer: '14 m/s'
    },
    {
      id: 'glbb_2',
      type: 'TRUE_FALSE',
      question: 'Jika nilai percepatan pada GLBB bernilai negatif, maka benda tersebut mengalami perlambatan secara teratur.',
      options: ['Benar', 'Salah'],
      correctAnswer: 'Benar'
    },
    {
      id: 'glbb_3',
      type: 'MULTIPLE_CHOICE',
      question: 'Bagaimana bentuk grafik Kecepatan terhadap Waktu (v - t) pada Gerak Lurus Berubah Beraturan (GLBB) dipercepat?',
      options: [
        'Garis lurus mendatar horizontal',
        'Garis lurus miring naik ke atas dengan kemiringan tertentu',
        'Kurva parabola melengkung tajam ke atas',
        'Garis vertikal tegak lurus sumbu t'
      ],
      correctAnswer: 'Garis lurus miring naik ke atas dengan kemiringan tertentu'
    }
  ],
  parabola: [
    {
      id: 'para_1',
      type: 'MULTIPLE_CHOICE',
      question: 'Pada sudut elevasi berapakah proyektil meriam akan menghasilkan jarak jangkauan mendatar (x_max) terjauh di atas tanah datar?',
      options: [
        '30 derajat',
        '45 derajat',
        '60 derajat',
        '90 derajat'
      ],
      correctAnswer: '45 derajat'
    },
    {
      id: 'para_2',
      type: 'TRUE_FALSE',
      question: 'Pada titik tertinggi (puncak lintasan parabola), kecepatan proyektil arah sumbu y (v_y) bernilai nol, sedangkan kecepatan sumbu x (v_x) tetap konstan.',
      options: ['Benar', 'Salah'],
      correctAnswer: 'Benar'
    },
    {
      id: 'para_3',
      type: 'MULTIPLE_CHOICE',
      question: 'Gaya eksternal apakah yang mempengaruhi pergerakan proyektil meriam pada arah vertikal sehingga lintasannya melengkung kembali ke bumi?',
      options: [
        'Gaya gesek udara mendatar',
        'Gaya dorong angin ke atas',
        'Gaya gravitasi bumi',
        'Gaya magnetik atmosfer'
      ],
      correctAnswer: 'Gaya gravitasi bumi'
    }
  ],
  newton2: [
    {
      id: 'new_1',
      type: 'MULTIPLE_CHOICE',
      question: 'Sebuah kotak bermassa 10 kg didorong dengan gaya 50 N di atas permukaan lantai licin sempurna (tanpa gesekan). Berapakah percepatan yang dialami kotak?',
      options: [
        '2 m/s²',
        '5 m/s²',
        '10 m/s²',
        '500 m/s²'
      ],
      correctAnswer: '5 m/s²'
    },
    {
      id: 'new_2',
      type: 'TRUE_FALSE',
      question: 'Menurut Hukum II Newton, jika massa suatu benda diperbesar dua kali lipat sedangkan gaya pendorongnya tetap, maka percepatan benda akan menjadi dua kali lebih besar.',
      options: ['Benar', 'Salah'],
      correctAnswer: 'Salah'
    },
    {
      id: 'new_3',
      type: 'MULTIPLE_CHOICE',
      question: 'Jika koefisien gesek kinetis antara kotak kayu dan lantai diperbesar, bagaimana pengaruhnya terhadap gaya gesek kinetis dan percepatan kotak?',
      options: [
        'Gaya gesek bertambah kecil dan percepatan kotak bertambah besar',
        'Gaya gesek bertambah besar dan percepatan kotak bertambah besar',
        'Gaya gesek bertambah besar dan percepatan kotak bertambah kecil',
        'Gaya gesek dan percepatan kotak tidak mengalami perubahan'
      ],
      correctAnswer: 'Gaya gesek bertambah besar dan percepatan kotak bertambah kecil'
    }
  ]
};
