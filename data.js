/**
 * Database Fasilitas & Informasi Detail
 * Desain Laboratorium Fisika Impian
 * Karya: Putri Intan Kania Nosa (NIM: 2407015)
 */

const LAB_METADATA = {
  title: "Desain Laboratorium Fisika Impian",
  author: "Putri Intan Kania Nosa",
  nim: "2407015",
  concept: "Laboratorium Fisika Terintegrasi, Aman, Fleksibel, dan Berpusat pada Peserta Didik (Student-Centered)",
  dimensions: "15 m x 10 m x 3.8 m (Kapasitas: 24 Siswa Praktikan + Guru & Laboran)",
  corePrinciples: [
    { title: "Fungsional", desc: "Setiap zona dan peralatan memiliki fungsi dan batas kerja yang jelas dan terarah." },
    { title: "Aman (Safety First)", desc: "Ruang khusus K3, jalur sirkulasi evakuasi bebas hambatan, dan saklar pemutus sentral darurat." },
    { title: "Fleksibel", desc: "Meja modular heksagonal yang dapat disesuaikan untuk eksperimen individu, kelompok, maupun diskusi." },
    { title: "Efisien & Teratur", desc: "Lemari penyimpanan terklasifikasi 4 cabang utama fisika (Mekanika, Listrik, Optik, Presisi) berlabel." },
    { title: "Berpusat pada Siswa", desc: "Peserta didik aktif bereksperimen, mengukur, mengolah data, dan merumuskan kesimpulan secara langsung." },
    { title: "Terintegrasi Teknologi", desc: "Perpaduan eksperimen riil dengan software simulasi PhET, sensor digital, dan smart board interaktif." }
  ]
};

const LAB_POINTS_OF_INTEREST = [
  {
    id: 1,
    name: "Pintu Masuk Utama Laboratorium",
    category: "Akses & Sirkulasi",
    color: "#2563eb",
    position: [-6.2, 1.4, -3.8],
    cameraTarget: [-5.0, 1.5, -3.0],
    cameraPos: [-3.5, 2.2, -1.8],
    description: "Pintu ganda utama sebagai akses mobilitas siswa dan guru dengan bukaan ke arah luar sesuai standar keselamatan gedung sekolah. Dilengkapi panel kaca intip untuk mengamati aktivitas di dalam tanpa mengganggu jalannya praktikum.",
    features: [
      "Pintu ganda swing dengan push-plate stainless steel",
      "Papan tata tertib & SOP keselamatan lab di dinding samping",
      "Loker penyimpanan tas & rak jas laboratorium praktikan",
      "Akses jalur masuk terpisah dari alur evakuasi darurat"
    ],
    standard: "Permendiknas No. 24 Th 2007 (Lebar bersih pintu minimal 1.2 meter, arah bukaan keluar)."
  },
  {
    id: 2,
    name: "Pintu Darurat & Akses Evakuasi Keluar",
    category: "Keselamatan & K3",
    color: "#16a34a",
    position: [-6.8, 1.4, 4.0],
    cameraTarget: [-6.5, 1.4, 4.0],
    cameraPos: [-4.2, 1.8, 3.2],
    description: "Pintu evakuasi darurat yang terhubung langsung ke area luar / titik kumpul (assembly point) sekolah. Terintegrasi langsung dengan Ruang Keselamatan K3 sehingga evakuasi medis atau insiden dapat dilakukan secepat kilat.",
    features: [
      "Panic Exit Hardware (Push bar darurat yang langsung membuka saat didorong)",
      "Lampu tanda EXIT photoluminescent dan baterai emergency backup saat listrik mati",
      "Jalur sirkulasi evakuasi selebar 1.5 meter tanpa halangan perabot apa pun",
      "Bahan pintu tahan api (Fire-rated door 60 menit)"
    ],
    standard: "NFPA 101 Life Safety Code & Standar Keselamatan Laboratorium Pendidikan Kemendikbud."
  },
  {
    id: 3,
    name: "Area Demonstrasi Konsep & Eksperimen Guru",
    category: "Pendidik & Demonstrasi",
    color: "#15803d",
    position: [-1.0, 1.1, -3.4],
    cameraTarget: [-1.0, 1.1, -3.4],
    cameraPos: [-1.0, 2.3, -1.2],
    description: "Panggung demonstrasi terangkat sedikit (+15cm) agar seluruh siswa dari segala penjuru meja praktikum memiliki garis pandang (sightline) langsung tanpa terhalang saat guru memperagakan fenomena fisika dramatis.",
    features: [
      "Meja demonstrasi panjang 2.5 meter dengan top resin fenolik tahan gores, api, dan kimia",
      "Wastafel sink kran leher angsa dan stop kontak universal terisolasi",
      "Meja pendidik kayu estetik dengan laptop guru dan kursi eksekutif ergonomis",
      "Sudut pandang optimal ke Smart Board dan Papan Tulis interaktif"
    ],
    standard: "SNI Tata Letak Fasilitas Pendidikan IPA: Elevasi panggung demo mempermudah observasi 100% siswa."
  },
  {
    id: 4,
    name: "Layar Cerdas (Smart Board) & Papan Tulis Interaktif",
    category: "Teknologi & Multimedia",
    color: "#0284c7",
    position: [-1.5, 2.3, -4.8],
    cameraTarget: [-1.5, 2.3, -4.8],
    cameraPos: [-1.5, 2.0, -2.5],
    description: "Integrasi media ganda: Papan tulis hijau besar anti-silau untuk penjelasan rumus matematis/vektor fisika mendalam, bersanding dengan Smart Board Interactive 75 inci untuk penayangan animasi partikel, simulasi PhET, dan live data plotting.",
    features: [
      "Smart Interactive Display 4K dengan stylus sentuh interaktif",
      "Papan tulis hijau magnetik 3.2 meter dengan tempat kapur & spidol bebas debu",
      "Terhubung langsung ke PC guru untuk simulasi PhET (Gelombang, Listrik Dinamis, Termodinamika)",
      "Soundbar audio jernih untuk tayangan video fenomena alam dan gempa"
    ],
    standard: "Integrasi TIK Smart Classroom Abad 21 berstandar UNESCO & Kemendikbudristek."
  },
  {
    id: 5,
    name: "Ruang Guru & Laboran (Pengawasan & Tata Kelola)",
    category: "Administrasi & Pengawasan",
    color: "#475569",
    position: [5.0, 1.5, -3.4],
    cameraTarget: [5.0, 1.5, -3.4],
    cameraPos: [3.2, 2.4, -1.8],
    description: "Ruang partisi kaca tempered kedap suara di sudut kanan depan dengan jarak pandang menyeluruh ke ruang laboratorium. Berfungsi sebagai kantor administrasi, pusat pengawasan keselamatan, dan evaluasi hasil belajar siswa.",
    features: [
      "Meja kerja PC workstation laboran untuk sistem inventaris alat digital (barcode tracking)",
      "Lemari arsip dokumen modul ajar praktikum, rubrik penilaian, dan manual alat",
      "Kaca pengawas berbingkai aluminium elegan dengan visibilitas sudut lebar (panoramic line of sight)",
      "Kursi putar ergonomis dan koneksi jaringan internet gigabit"
    ],
    standard: "Manajemen Laboratorium ISO/IEC 17025: Pemisahan zona administrasi dari potensi kontaminasi kerja."
  },
  {
    id: 6,
    name: "Ruang Khusus Keselamatan (K3 & Medis)",
    category: "Keselamatan & K3",
    color: "#dc2626",
    position: [-5.2, 1.4, 3.2],
    cameraTarget: [-5.2, 1.3, 3.2],
    cameraPos: [-3.2, 2.1, 2.2],
    description: "Ruang khusus partisi steril yang menjadi keunggulan utama dalam rancangan Putri Intan Kania Nosa. Dirancang terisolasi namun mudah diakses kilat dari meja praktikum mana pun saat terjadi insiden darurat di laboratorium fisika.",
    features: [
      "Ranjang periksa medis (medical examination couch) & tandu lipat darurat (folding stretcher)",
      "Unit Emergency Safety Shower & Eyewash bertekanan air otomatis",
      "Lemari kotak P3K dinding komprehensif (kasa steril, luka bakar, antiseptik, perban, bidai)",
      "Tabung APAR CO2 5kg (bebas residu, aman untuk alat elektronik & kaca)",
      "Selimut api fiberglass tahan 550°C dan Saklar Sentral Pemutus Daya Listrik (Emergency Cut-Off)",
      "Akses pintu langsung ke pintu keluar evakuasi darurat (Pintu 2)"
    ],
    standard: "OSHA 1910.1450 (Laboratory Standard) & ANSI/ISEA Z358.1 untuk Fasilitas Emergency Eyewash/Shower."
  },
  {
    id: 7,
    name: "Meja Praktikum Siswa Modular Heksagonal",
    category: "Praktikum Siswa",
    color: "#15803d",
    position: [-1.5, 0.9, -0.6],
    cameraTarget: [-1.5, 0.8, -0.6],
    cameraPos: [-1.5, 2.0, 1.0],
    description: "6 unit meja praktikum besar terpusat (2 kolom x 3 baris) berkapasitas 4 siswa per meja (total 24 siswa). Dirancang secara modular dan berpusat pada peserta didik (student-centered) agar kolaborasi kelompok berjalan sangat hidup.",
    features: [
      "Permukaan meja resin fenolik tebal anti-gores, isolator listrik, dan tahan panas",
      "Pop-up Electrical Socket di bagian tengah meja yang dapat disembunyikan saat tidak digunakan",
      "Mini-sink wastafel kecil di meja tertentu untuk percobaan kalor, fluida, dan viskositas",
      "Kabel grounding terpasang di setiap meja untuk pencegahan bahaya listrik statis"
    ],
    standard: "Standar Sarana Prasarana Laboratorium Fisika SMA/SMK Permendikbud: Rasio luas per siswa min 2.4 m²."
  },
  {
    id: 8,
    name: "Kursi Praktikum Siswa Ergonomis",
    category: "Praktikum Siswa",
    color: "#334155",
    position: [-1.5, 0.6, 0.2],
    cameraTarget: [-1.5, 0.6, 0.2],
    cameraPos: [-1.5, 1.5, 1.5],
    description: "24 unit kursi stool praktikum ergonomis dengan mekanisme hidrolik pengatur tinggi kursi (45 - 60 cm) dan sandaran lumbar yang fleksibel. Membantu siswa tetap fokus dan nyaman selama 90-120 menit praktikum intensif.",
    features: [
      "Bahan polimer high-density anti-statis yang mudah disterilisasi",
      "Roda putar 360° berfitur auto-brake (rem otomatis) saat diduduki agar tidak bergeser sendiri",
      "Footring lingkaran pijakan kaki stainless steel untuk sirkulasi darah yang baik",
      "Desain ringkas dan dapat didorong masuk ke kolong meja saat sesi demonstrasi berdiri"
    ],
    standard: "Ergonomi Furnitur Pendidikan ISO 9241-5 & EN 1729 Educational Furniture Standard."
  },
  {
    id: 9,
    name: "Area Kolaborasi & Diskusi Kelompok",
    category: "Kolaborasi & Teori",
    color: "#7e22ce",
    position: [4.8, 0.9, 0.6],
    cameraTarget: [4.8, 0.9, 0.6],
    cameraPos: [3.4, 1.8, 0.6],
    description: "Sudut diskusi santai (breakout space) bernuansa hangat dengan meja bundar ungu dan kursi santai. Menjadi wadah siswa mengolah data eksperimen, melakukan analisis galat / ketidakpastian, dan presentasi mini.",
    features: [
      "Meja bundar diameter 1.5 meter tanpa sudut tajam demi keselamatan",
      "5 unit kursi breakout ergonomis empuk dengan sandaran punggung",
      "Papan tulis kaca flipchart kecil untuk coretan rumus, sketsa grafik linier, dan brainstorming",
      "Suasana yang mendorong komunikasi terbuka antar kelompok praktikan"
    ],
    standard: "Prinsip Pembelajaran Abad 21 (4C: Critical Thinking, Creativity, Collaboration, Communication)."
  },
  {
    id: 10,
    name: "Area Eksperimen & Proyek Riset Mandiri",
    category: "Eksperimen Mandiri",
    color: "#0d9488",
    position: [-5.8, 1.1, -1.2],
    cameraTarget: [-5.8, 1.1, -1.2],
    cameraPos: [-4.2, 1.9, -1.2],
    description: "Workbench linier kokoh di sepanjang dinding barat/kiri di samping jendela alami. Dikhususkan untuk eksperimen sains lanjutan, proyek KIR (Karya Ilmiah Remaja), dan persiapan lomba/olimpiade sains fisika.",
    features: [
      "Meja batu granit/kayu keras teredam getaran (vibration-damped surface)",
      "Set peralatan bandul matematis, rel optik presisi, dan pegas osilasi terpasang kokoh",
      "Jangka sorong digital, mikrometer sekrup, dan statif baja terkalibrasi",
      "Sinar matahari alami optimal untuk observasi instrumen skala mikro tanpa bayangan silang"
    ],
    standard: "Fasilitas Riset Sains Pemula dan Inkubasi Inovasi STEM (Science, Technology, Engineering, Math)."
  },
  {
    id: 11,
    name: "Area Teknologi & Simulasi Virtual (PhET Corner)",
    category: "Teknologi & Simulasi",
    color: "#0891b2",
    position: [-5.8, 1.1, 1.2],
    cameraTarget: [-5.8, 1.1, 1.2],
    cameraPos: [-4.2, 1.9, 1.2],
    description: "Stasiun komputer all-in-one yang dilengkapi paket software simulasi interaktif PhET (University of Colorado Boulder), Tracker Video Analysis, dan Logger Pro untuk pengolahan grafik sensor digital secara otomatis.",
    features: [
      "2 unit PC Workstation berspesifikasi tinggi dengan monitor IPS 24 inci",
      "Interface data logger USB (Vernier / Pasco) untuk merekam temperatur, tegangan, dan percepatan real-time",
      "Koneksi ke repository simulasi offline PhET untuk demonstrasi konsep mikroskopis (kuantum, medan elektromagnetik)",
      "Printer warna untuk mencetak grafik data regresi linier praktikum siswa"
    ],
    standard: "Kurikulum Merdeka: Pembelajaran Fisika Berbasis Integrasi Eksperimen Riil & Laboratorium Virtual."
  },
  {
    id: 12,
    name: "Area Persiapan Alat Praktikum Laboran",
    category: "Laboran & Logistik",
    color: "#64748b",
    position: [5.2, 1.1, -1.8],
    cameraTarget: [5.2, 1.1, -1.8],
    cameraPos: [3.8, 2.0, -1.8],
    description: "Meja konter preparasi kerja laboran yang terletak di luar ruang staf. Digunakan untuk menyusun baki alat praktikum (kit tray) per kelompok sebelum jam praktikum dimulai, menguji baterai, dan kalibrasi rutin.",
    features: [
      "Countertop meja lebar dengan laci perkakas mekanik (obeng presisi, tang crimping, solder station)",
      "Rak penyimpanan baki set praktikum bertingkat (tray storage system)",
      "Multimeter kalibrator dan neraca tera teknis",
      "Daftar periksa (checklist) kesiapan alat dan form peminjaman inventaris"
    ],
    standard: "SOP Manajemen Preparasi Praktikum Laboratorium Pendidikan Berstandar Nasional."
  },
  {
    id: 13,
    name: "Lemari Alat 1: Mekanika & Termodinamika",
    category: "Penyimpanan Alat",
    color: "#0284c7",
    position: [-3.6, 1.5, 4.3],
    cameraTarget: [-3.6, 1.5, 4.3],
    cameraPos: [-3.6, 1.8, 2.6],
    description: "Lemari kabinet kaca ganda berkunci dengan pencahayaan LED interior. Menyimpan seluruh aparatus eksperimen mekanika klasik, dinamika newton, fluida, dan termodinamika secara tertata dan berlabel.",
    features: [
      "Partisi busa khusus peredam benturan untuk dinamometer pegas dan jangka sorong",
      "Rel udara (linear air track), ticker timer, kereta dinamika beroda presisi",
      "Kalorimeter bejana Joule, kubus massa materi (tembaga, aluminium, besi), termometer air raksa & digital",
      "Label kode QR pada rak untuk melihat manual panduan dan video cara kerja alat"
    ],
    standard: "Klasifikasi Inventaris Alat Laboratorium Fisika: Kategori 1 (Mekanika & Kalor)."
  },
  {
    id: 14,
    name: "Lemari Alat 2: Listrik, Magnet & Elektronika",
    category: "Penyimpanan Alat",
    color: "#d97706",
    position: [5.8, 1.5, 2.5],
    cameraTarget: [5.8, 1.5, 2.5],
    cameraPos: [4.2, 1.8, 2.5],
    description: "Lemari berbingkai baja dengan lapisan proteksi anti-statis (ESD protective) untuk instrumen kelistrikan arus searah/bolak-balik, elektromagnetisme, dan modul komponen elektronika dasar.",
    features: [
      "Catu daya DC variabel regulated (Power Supply 0-30V 5A)",
      "Multimeter analog & digital presisi tinggi, kumparan solenoida induksi, transformator step-up/down",
      "Magnet batang Alnico, serbuk besi pengamat garis gaya medan magnet, galvanometer sensitif",
      "Breadboard eksperimen rangkaian seri-paralel dan komponen resistor, kapasitor, dioda"
    ],
    standard: "Klasifikasi Inventaris Alat Laboratorium Fisika: Kategori 2 (Listrik & Magnetik)."
  },
  {
    id: 15,
    name: "Lemari Alat 3: Optik, Gelombang & Bunyi",
    category: "Penyimpanan Alat",
    color: "#9333ea",
    position: [-0.8, 1.5, 4.3],
    cameraTarget: [-0.8, 1.5, 4.3],
    cameraPos: [-0.8, 1.8, 2.6],
    description: "Lemari khusus berlapis kain beludru lembut anti-debu dan seal kedap kelembapan untuk melindungi elemen optik kaca sensitif, lensa, dan instrumen gelombang akustik dari risiko goresan dan jamur kaca.",
    features: [
      "Set bangku optik aluminium 1 meter lengkap dengan dudukan geser berpenjepit",
      "Lensa cembung/cekung, prisma kaca crown dan flint, cermin sferis, kisi difraksi 100-600 garis/mm",
      "Sumber cahaya laser semikonduktor berdaya aman (<5mW Class 2) dan lampu uap natrium/spektrum",
      "Garpu tala frekuensi terkalibrasi (256Hz, 512Hz) dengan kotak resonansi kayu dan tabung resonansi bunyi"
    ],
    standard: "Klasifikasi Inventaris Alat Laboratorium Fisika: Kategori 3 (Optika & Gelombang)."
  },
  {
    id: 16,
    name: "Lemari Alat 4: Sensor, Neraca & Alat Presisi",
    category: "Penyimpanan Alat",
    color: "#059669",
    position: [1.8, 1.5, 4.3],
    cameraTarget: [1.8, 1.5, 4.3],
    cameraPos: [1.8, 1.8, 2.6],
    description: "Kabinet instrumen ukur digital tingkat lanjut (high precision instrumentation) yang memerlukan penanganan ekstra cermat dan kontrol kelembapan otomatis (electric dry cabinet / silica gel chamber).",
    features: [
      "Neraca analitik 4 lengan Ohaus 311g dan neraca digital ketelitian 0.001 gram",
      "Sensor gerak ultrasonik (motion detector) dan gerbang cahaya (photogate timer) berketelitian mikrodetik",
      "Sensor medan magnet probe Hall Effect dan lux meter digital pendeteksi intensitas cahaya",
      "Mikrometer sekrup mitutoyo berstandar kalibrasi metrologi nasional"
    ],
    standard: "Klasifikasi Inventaris Alat Laboratorium Fisika: Kategori 4 (Instrumen Sensor Presisi)."
  },
  {
    id: 17,
    name: "Fasilitas K3: Tabung APAR & Selimut Api (Fire Safety)",
    category: "Keselamatan & K3",
    color: "#dc2626",
    position: [-5.5, 1.3, 2.4],
    cameraTarget: [-5.5, 1.3, 2.4],
    cameraPos: [-4.0, 1.6, 2.4],
    description: "Peralatan pemadam api dini yang disesuaikan secara khusus untuk laboratorium fisika. Menghadapi potensi percikan listrik, hubungan arus pendek pada trafo/catu daya, atau pemanas spiritus.",
    features: [
      "Tabung APAR tipe Gas Karbon Dioksida (CO2) 5 kg: Memadamkan api tanpa meninggalkan serbuk korosif pada instrumen optik dan sensor",
      "Selimut Api (Fire Blanket) tenun fiberglass tahan temperatur hingga 550°C dalam wadah cepat buka (quick-release)",
      "Gantungan dinding dengan ketinggian 1.2m dari lantai sesuai standar ergonomi fisik siswa",
      "Kartu kontrol inspeksi bulanan dan instruksi visual bertahap (PASS System)"
    ],
    standard: "NFPA 10 Standard for Portable Fire Extinguishers & Peraturan Menteri Tenaga Kerja No. 04/MEN/1980."
  },
  {
    id: 18,
    name: "Fasilitas K3: Ranjang Medis P3K, Tandu & Eyewash",
    category: "Keselamatan & K3",
    color: "#16a34a",
    position: [-4.5, 0.8, 3.8],
    cameraTarget: [-4.5, 0.8, 3.8],
    cameraPos: [-3.2, 1.7, 3.2],
    description: "Unit sarana pertolongan medis pertama yang komprehensif di dalam Ruang K3 untuk menangani korban pingsan, cedera fisik, terkena serpihan kaca tabung gelas, atau percikan cairan panas saat eksperimen termodinamika.",
    features: [
      "Ranjang periksa medis (examination bed) beralaskan busa tebal dilapisi kulit sintetis antibakteri mudah dibersihkan",
      "Tandu lipat darurat (folding pole stretcher) aluminium ringan untuk mobilisasi cepat ke ambulans/UKS",
      "Wastafel pembilas mata (emergency eyewash bowl) bertekanan lembut dengan aktivasi pedal kaki/tuas tangan",
      "Lemari obat P3K dinding berisi larutan steril pembersih mata, perban kasa, plester, torniket, dan termometer klinis"
    ],
    standard: "Permenakertrans No. PER.15/MEN/VIII/2008 tentang Pertolongan Pertama Pada Kecelakaan di Tempat Kerja."
  },
  {
    id: 19,
    name: "Saklar Sentral Pemutus Daya Listrik (Emergency Stop)",
    category: "Keselamatan & K3",
    color: "#ea580c",
    position: [-6.0, 1.4, 2.7],
    cameraTarget: [-6.0, 1.4, 2.7],
    cameraPos: [-4.5, 1.6, 2.7],
    description: "Tombol jamur merah besar (Emergency Mushroom Push Button) berbingkai kuning peringatan kontras. Satu kali tekan dapat memutus suplai listrik ke seluruh stop kontak meja siswa dalam tempo kurang dari 50 milidetik!",
    features: [
      "Tombol 'Twist-to-Release' merah menyolok dengan pelindung pengaman transparan (anti kepencet tidak sengaja)",
      "Terhubung langsung ke Main Contactor 3-Fasa dan ELCB (Earth Leakage Circuit Breaker) berkepekaan 30mA",
      "Sirine lampu strobo darurat visual yang menyala seketika saat tombol ditekan",
      "Mekanisme isolasi daya mandiri: lampu penerangan ruangan tetap menyala saat daya praktikum diputus"
    ],
    standard: "IEC 60204-1 Safety of Machinery - Electrical Equipment & PUIL 2011 (Persyaratan Umum Instalasi Listrik)."
  },
  {
    id: 20,
    name: "Jendela Ventilasi & Pencahayaan Alami (Daylighting)",
    category: "Lingkungan & Ergonomi",
    color: "#0284c7",
    position: [-6.8, 2.2, 0.0],
    cameraTarget: [-6.8, 2.2, 0.0],
    cameraPos: [-4.5, 2.2, 0.0],
    description: "3 unit jendela kaca tempered besar berbingkai ganda di sepanjang dinding barat. Memasukkan cahaya alami terdistribusi merata untuk mereduksi kelelahan penglihatan mata siswa selama membaca skala ukur mikro.",
    features: [
      "Kaca bening ganda berlapis low-E (low emissivity) yang mereduksi panas tanpa mengurangi intensitas cahaya",
      "Kisi ventilasi jalusi di bagian atas untuk sirkulasi udara silang (cross-ventilation alami)",
      "Tirai penggelap (blackout roller blind) rel tertutup yang dapat diturunkan rapat saat praktikum optika dan laser gelap",
      "Ketinggian ambang jendela 1 meter yang aman dan menyajikan pemandangan taman luar sekolah"
    ],
    standard: "Standar Pencahayaan Ruang Belajar SNI 03-6197 (Tingkat pencahayaan laboratorium 500 lux)."
  },
  {
    id: 21,
    name: "Area Cuci & Sink Peralatan Praktikum",
    category: "Sanitasi & Perawatan",
    color: "#0369a1",
    position: [4.6, 1.0, -0.6],
    cameraTarget: [4.6, 1.0, -0.6],
    cameraPos: [3.2, 1.8, -0.6],
    description: "Wastafel ganda (double-bowl sink) berbahan Stainless Steel SUS-304 tahan karat dan bahan korosif. Digunakan untuk membersihkan tabung resonansi air, bejana massa jenis fluida, kalorimeter, serta sanitasi tangan siswa.",
    features: [
      "Bak cuci ganda dengan kran leher angsa putar 360° berfitur aerator hemat air",
      "Rak peniris alat gelas dan instrumen (drying dish rack) berbahan baja anti-karat dengan nampan tampung",
      "Dispenser sabun pembersih tangan otomatis sensor inframerah dan tempat tisu pengering higienis",
      "Pipa perangkap bau (grease & sediment trap) di bawah wastafel untuk mencegah penyumbatan residu praktikum"
    ],
    standard: "Standar Sanitasi dan Higiene Sarana Pendidikan Depdiknas & Permenkes No. 1429 Th 2006."
  }
];

const SIMULATION_PRESETS = [
  {
    id: "phet_waves",
    title: "Simulasi PhET: Gelombang Mekanik & Interferensi",
    badge: "PhET Interactive",
    description: "Visualisasi perambatan gelombang transfersal dan longitudinal, interferensi konstruktif-destruktif, dan efek Doppler.",
    formula: "v = f · λ = ω / k"
  },
  {
    id: "newton_dynamics",
    title: "Simulasi Dinamika: Hukum II Newton & Gesekan",
    badge: "Mekanika Klasik",
    description: "Perhitungan gaya kontak, bidang miring terkomputasi, tegangan tali katrol, dan grafik percepatan terhadap gaya tarik.",
    formula: "ΣF = m · a  |  f_k = μ_k · N"
  },
  {
    id: "optics_ray",
    title: "Simulasi Optika: Pembiasan Snellius & Lensa Cembung",
    badge: "Optika Geometri",
    description: "Diagram sinar istimewa pada lensa konvergen, perbesaran bayangan nyata-maya, dan dispersi cahaya prisma segitiga.",
    formula: "1/f = 1/s + 1/s'  |  n1 · sin(θ1) = n2 · sin(θ2)"
  },
  {
    id: "circuits_ohm",
    title: "Simulasi Listrik Dinamis: Hukum Ohm & Rangkaian RLC",
    badge: "Elektronika",
    description: "Aliran elektron interaktif, impedansi rangkaian AC, pembagi tegangan resistor, dan resonansi sirkuit LC.",
    formula: "V = I · R  |  P = I² · R  |  Z = √(R² + (X_L - X_C)²)"
  }
];
