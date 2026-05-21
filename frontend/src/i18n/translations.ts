export type Language = "en" | "id";

export const translations = {
  // ── Navbar ────────────────────────────────────────────────────────────────
  "nav.recognizer": { en: "Recognizer", id: "Penerjemah" },
  "nav.history": { en: "History", id: "Riwayat" },
  "nav.dictionary": { en: "Dictionary", id: "Kamus" },
  "nav.settings": { en: "Settings", id: "Pengaturan" },
  "nav.dashboard": { en: "Dashboard", id: "Dasbor" },
  "nav.admin": { en: "Admin", id: "Admin" },
  "nav.logout": { en: "Logout", id: "Keluar" },
  "nav.test": { en: "Test", id: "Uji" },
  "nav.about": { en: "About", id: "Tentang" },

  // ── Recognizer page ───────────────────────────────────────────────────────
  "rec.liveDetection": { en: "LIVE DETECTION", id: "DETEKSI LANGSUNG" },
  "rec.topCandidates": { en: "TOP CANDIDATES", id: "KANDIDAT TERATAS" },
  "rec.wordBuilder": { en: "WORD BUILDER", id: "PEMBUAT KATA" },
  "rec.recentSentences": { en: "RECENT SENTENCES", id: "KALIMAT TERBARU" },
  "rec.startCamera": { en: "Start Camera", id: "Mulai Kamera" },
  "rec.stopCamera": { en: "Stop Camera", id: "Hentikan Kamera" },
  "rec.cameraActive": { en: "Camera active", id: "Kamera aktif" },
  "rec.cameraOff": { en: "Camera off", id: "Kamera mati" },
  "rec.cameraInactive": { en: "Camera inactive", id: "Kamera tidak aktif" },
  "rec.showHand": { en: "Show your hand", id: "Tunjukkan tangan Anda" },
  "rec.signToBegin": {
    en: "Sign letters to begin...",
    id: "Isyaratkan huruf untuk memulai...",
  },
  "rec.delete": { en: "⌫ Delete", id: "⌫ Hapus" },
  "rec.space": { en: "␣ Space", id: "␣ Spasi" },
  "rec.clear": { en: "✕ Clear", id: "✕ Bersihkan" },
  "rec.speak": { en: "▶ Speak", id: "▶ Bicara" },
  "rec.saveSentence": { en: "✓ Save Sentence", id: "✓ Simpan Kalimat" },
  "rec.waitingDetection": {
    en: "Waiting for detection...",
    id: "Menunggu deteksi...",
  },
  "rec.lowConfidence": { en: "Low confidence", id: "Kepercayaan rendah" },
  "rec.adjustHand": {
    en: "Adjust hand position or lighting for better accuracy",
    id: "Sesuaikan posisi tangan atau pencahayaan untuk akurasi lebih baik",
  },
  "rec.scanning": { en: "SCANNING", id: "MEMINDAI" },
  "rec.analyzing": { en: "ANALYZING...", id: "MENGANALISIS..." },
  "rec.translating": { en: "TRANSLATING...", id: "MENERJEMAHKAN..." },
  "rec.done": { en: "DONE", id: "SELESAI" },

  // ── Session summary modal ─────────────────────────────────────────────────
  "sess.title": { en: "Session Summary", id: "Ringkasan Sesi" },
  "sess.duration": { en: "Duration", id: "Durasi" },
  "sess.lettersDetected": { en: "Letters Detected", id: "Huruf Terdeteksi" },
  "sess.avgConfidence": { en: "Avg Confidence", id: "Kepercayaan Rata-rata" },
  "sess.topLetter": { en: "Most Signed Letter", id: "Huruf Paling Sering" },
  "sess.wordBuilt": { en: "Word Built", id: "Kata Dibuat" },
  "sess.noActivity": {
    en: "No signs detected this session.",
    id: "Tidak ada isyarat terdeteksi sesi ini.",
  },
  "sess.close": { en: "Close", id: "Tutup" },
  "sess.seconds": { en: "sec", id: "dtk" },

  // ── Status messages ───────────────────────────────────────────────────────
  "status.starting": { en: "Starting...", id: "Memulai..." },
  "status.awaitingHand": { en: "Awaiting hand...", id: "Menunggu tangan..." },
  "status.analyzing": { en: "Analyzing...", id: "Menganalisis..." },
  "status.translating": { en: "Translating...", id: "Menerjemahkan..." },
  "status.handDetected": { en: "Hand detected", id: "Tangan terdeteksi" },
  "status.noHand": { en: "No hand in frame", id: "Tidak ada tangan" },
  "status.connError": { en: "Connection error", id: "Kesalahan koneksi" },

  // ── Error notifications ───────────────────────────────────────────────────
  "err.cameraError": { en: "Camera Error", id: "Kesalahan Kamera" },
  "err.cameraDenied": {
    en: "Camera access denied. Please allow camera permissions.",
    id: "Akses kamera ditolak. Mohon izinkan akses kamera.",
  },
  "err.connectionError": { en: "Connection Error", id: "Kesalahan Koneksi" },
  "err.mlHint": {
    en: "Check that the ML service is running on port 8001.",
    id: "Pastikan layanan ML berjalan di port 8001.",
  },

  // ── History page ──────────────────────────────────────────────────────────
  "hist.title": { en: "History", id: "Riwayat" },
  "hist.subtitle": {
    en: "{s} saved sentences · {l} letter predictions",
    id: "{s} kalimat tersimpan · {l} prediksi huruf",
  },
  "hist.refresh": { en: "↻ Refresh", id: "↻ Segarkan" },
  "hist.export": { en: "⬇ Export CSV", id: "⬇ Ekspor CSV" },
  "hist.filter": { en: "Filter...", id: "Filter..." },
  "hist.savedSentences": { en: "Saved Sentences", id: "Kalimat Tersimpan" },
  "hist.letterPredictions": { en: "Letter Predictions", id: "Prediksi Huruf" },
  "hist.sentencesDesc": {
    en: "These are sentences you intentionally saved. Click ▶ to hear them read aloud.",
    id: "Kalimat yang Anda simpan dengan sengaja. Klik ▶ untuk mendengarkan.",
  },
  "hist.lettersDesc": {
    en: "Every letter the ML model detected above the confidence threshold, grouped by session.",
    id: "Setiap huruf yang dideteksi model ML di atas ambang kepercayaan, dikelompokkan per sesi.",
  },
  "hist.clearSentences": { en: "✕ Clear Sentences", id: "✕ Hapus Kalimat" },
  "hist.clearLetters": { en: "✕ Clear Letters", id: "✕ Hapus Huruf" },
  "hist.noSentences": {
    en: "No saved sentences yet.",
    id: "Belum ada kalimat tersimpan.",
  },
  "hist.noSentencesHint": {
    en: "Use the Word Builder on the Recognizer page, then press Save Sentence.",
    id: "Gunakan Pembuat Kata di halaman Penerjemah, lalu tekan Simpan Kalimat.",
  },
  "hist.noLetters": {
    en: "No letter predictions yet.",
    id: "Belum ada prediksi huruf.",
  },
  "hist.noLettersHint": {
    en: "Start the camera on the Recognizer page and sign some letters.",
    id: "Nyalakan kamera di halaman Penerjemah dan isyaratkan beberapa huruf.",
  },
  "hist.session": { en: "Session", id: "Sesi" },
  "hist.letters": { en: "letters", id: "huruf" },
  "hist.avg": { en: "avg", id: "rata-rata" },
  "hist.confidence": { en: "Confidence Trend", id: "Tren Kepercayaan" },

  // ── Dictionary page ───────────────────────────────────────────────────────
  "dict.title": { en: "SIBI Dictionary", id: "Kamus SIBI" },
  "dict.subtitle": {
    en: "Indonesian Sign Language Alphabet · 26 Letters",
    id: "Abjad Bahasa Isyarat Indonesia · 26 Huruf",
  },
  "dict.desc": {
    en: "This dictionary contains visual references for all 26 SIBI alphabet signs. Click any card to view the full-size image and description. Use the search bar to find a specific letter.",
    id: "Kamus ini berisi referensi visual untuk 26 isyarat abjad SIBI. Klik kartu untuk melihat gambar penuh. Gunakan bilah pencarian untuk menemukan huruf tertentu.",
  },
  "dict.search": {
    en: "Search by letter or description...",
    id: "Cari berdasarkan huruf atau deskripsi...",
  },
  "dict.noResults": {
    en: "No letters matching",
    id: "Tidak ada huruf yang cocok dengan",
  },
  "dict.howToAdd": {
    en: "HOW TO ADD SIGN IMAGES",
    id: "CARA MENAMBAHKAN GAMBAR ISYARAT",
  },
  "dict.addHint1": {
    en: "Place your sign images in frontend/public/sibi/ named exactly A.png, B.png, etc.",
    id: "Tempatkan gambar isyarat di frontend/public/sibi/ dengan nama A.png, B.png, dst.",
  },
  "dict.addHint2": {
    en: "Images appear automatically on the matching card once added.",
    id: "Gambar akan muncul otomatis pada kartu yang sesuai setelah ditambahkan.",
  },
  "dict.addHint3": {
    en: "If an image is missing, the letter is shown as a placeholder.",
    id: "Jika gambar tidak ada, huruf ditampilkan sebagai placeholder.",
  },

  // ── Settings page ─────────────────────────────────────────────────────────
  "set.title": { en: "Settings", id: "Pengaturan" },
  "set.subtitle": {
    en: "Configure system behaviour · changes take effect immediately",
    id: "Konfigurasi sistem · perubahan berlaku segera",
  },
  "set.appearance": { en: "APPEARANCE", id: "TAMPILAN" },
  "set.mlSystem": { en: "ML & SYSTEM", id: "ML & SISTEM" },
  "set.themeKey": { en: "interface_theme", id: "tema_antarmuka" },
  "set.themeLabel": {
    en: "Color scheme applied across all pages. Saved in the browser.",
    id: "Skema warna yang diterapkan di semua halaman. Disimpan di browser.",
  },
  "set.darkMode": { en: "Dark Mode", id: "Mode Gelap" },
  "set.lightMode": { en: "Light Mode", id: "Mode Terang" },
  "set.fontSizeKey": { en: "display_font_size", id: "ukuran_font_tampilan" },
  "set.fontSizeLabel": {
    en: "Word Builder text size. Larger is easier to read across the counter.",
    id: "Ukuran teks Pembuat Kata. Lebih besar lebih mudah dibaca dari jauh.",
  },
  "set.fontPreviewKey": { en: "font_preview", id: "pratinjau_font" },
  "set.fontPreviewLabel": {
    en: "Live preview of how the Word Builder text will appear.",
    id: "Pratinjau langsung tampilan teks Pembuat Kata.",
  },
  "set.small": { en: "Small", id: "Kecil" },
  "set.medium": { en: "Medium", id: "Sedang" },
  "set.large": { en: "Large", id: "Besar" },
  "set.xlarge": { en: "X-Large", id: "Ekstra Besar" },
  "set.langKey": { en: "interface_language", id: "bahasa_antarmuka" },
  "set.langLabel": {
    en: "Display language for all UI text across the application.",
    id: "Bahasa tampilan untuk semua teks antarmuka aplikasi.",
  },
  "set.howItWorks": { en: "HOW SETTINGS WORK", id: "CARA KERJA PENGATURAN" },
  "set.save": { en: "Save", id: "Simpan" },
  "set.saved": { en: "✓ Saved", id: "✓ Tersimpan" },
  "set.loading": { en: "Loading settings...", id: "Memuat pengaturan..." },
  "set.confThreshDesc": {
    en: "predictions below this value are not saved to history",
    id: "prediksi di bawah nilai ini tidak disimpan ke riwayat",
  },
  "set.confirmFramesDesc": {
    en: "a letter must appear this many consecutive frames before being added",
    id: "huruf harus muncul sebanyak ini frame berturut-turut sebelum ditambahkan",
  },
  "set.pollDesc": {
    en: "how often a frame is sent to the ML service; lower = faster but heavier on CPU",
    id: "seberapa sering frame dikirim ke layanan ML; lebih rendah = lebih cepat tapi lebih berat",
  },
  "set.modelDesc": {
    en: "informational only; swap the actual file in ml-service/models/",
    id: "hanya informasi; ganti file aktual di ml-service/models/",
  },

  // ── Admin auth ────────────────────────────────────────────────────────────
  "auth.loginTitle": { en: "Admin Login", id: "Login Admin" },
  "auth.loginSubtitle": {
    en: "SIMBAsoloV3 · Dashboard Access",
    id: "SIMBAsoloV3 · Akses Dasbor",
  },
  "auth.registerTitle": { en: "Create Admin Account", id: "Buat Akun Admin" },
  "auth.registerSubtitle": {
    en: "SIMBAsoloV3 · Dashboard Registration",
    id: "SIMBAsoloV3 · Pendaftaran Dasbor",
  },
  "auth.username": { en: "Username", id: "Nama Pengguna" },
  "auth.email": { en: "Email", id: "Email" },
  "auth.password": { en: "Password", id: "Kata Sandi" },
  "auth.confirmPassword": {
    en: "Confirm Password",
    id: "Konfirmasi Kata Sandi",
  },
  "auth.login": { en: "Login", id: "Masuk" },
  "auth.loggingIn": { en: "Logging in...", id: "Sedang masuk..." },
  "auth.createAccount": { en: "Create Account", id: "Buat Akun" },
  "auth.creating": { en: "Creating account...", id: "Membuat akun..." },
  "auth.noAccount": { en: "No account?", id: "Belum punya akun?" },
  "auth.registerHere": { en: "Register here", id: "Daftar di sini" },
  "auth.hasAccount": {
    en: "Already have an account?",
    id: "Sudah punya akun?",
  },
  "auth.loginHere": { en: "Login here", id: "Masuk di sini" },
  "auth.usernamePlaceholder": {
    en: "Choose a username",
    id: "Pilih nama pengguna",
  },
  "auth.emailPlaceholder": {
    en: "Enter email address",
    id: "Masukkan alamat email",
  },
  "auth.passwordPlaceholder": {
    en: "Min. 6 characters",
    id: "Min. 6 karakter",
  },
  "auth.confirmPlaceholder": { en: "Repeat password", id: "Ulangi kata sandi" },
  "auth.loginUserPlaceholder": {
    en: "Enter username",
    id: "Masukkan nama pengguna",
  },
  "auth.loginPassPlaceholder": {
    en: "Enter password",
    id: "Masukkan kata sandi",
  },
  "auth.passNoMatch": {
    en: "Passwords do not match",
    id: "Kata sandi tidak cocok",
  },
  "auth.passTooShort": {
    en: "Password must be at least 6 characters",
    id: "Kata sandi minimal 6 karakter",
  },

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  "dash.title": { en: "Admin Dashboard", id: "Dasbor Admin" },
  "dash.loggedInAs": { en: "Logged in as", id: "Masuk sebagai" },
  "dash.refresh": { en: "↻ Refresh", id: "↻ Segarkan" },
  "dash.overview": { en: "Overview", id: "Ringkasan" },
  "dash.predictions": { en: "Predictions", id: "Prediksi" },
  "dash.sentences": { en: "Sentences", id: "Kalimat" },
  "dash.settings": { en: "Settings", id: "Pengaturan" },
  "dash.totalPredictions": { en: "Total Predictions", id: "Total Prediksi" },
  "dash.sessions": { en: "Sessions", id: "Sesi" },
  "dash.avgConfidence": { en: "Avg Confidence", id: "Kepercayaan Rata-rata" },
  "dash.mostDetected": { en: "Most Detected", id: "Paling Terdeteksi" },
  "dash.savedSentences": { en: "Saved Sentences", id: "Kalimat Tersimpan" },
  "dash.topLetters": {
    en: "TOP DETECTED LETTERS",
    id: "HURUF PALING TERDETEKSI",
  },
  "dash.noData": {
    en: "No prediction data yet. Start signing on the Recognizer page.",
    id: "Belum ada data prediksi. Mulai isyaratkan di halaman Penerjemah.",
  },
  "dash.allPredictions": {
    en: "All letter predictions recorded by the ML model above the confidence threshold.",
    id: "Semua prediksi huruf yang direkam model ML di atas ambang kepercayaan.",
  },
  "dash.sentencesDesc": {
    en: "Sentences saved by users from the Word Builder. Click ▶ to hear them read aloud.",
    id: "Kalimat yang disimpan pengguna dari Pembuat Kata. Klik ▶ untuk mendengarkan.",
  },
  "dash.settingsDesc": {
    en: "These settings are stored in SQLite and take effect immediately.",
    id: "Pengaturan ini disimpan di SQLite dan berlaku segera.",
  },
  "dash.clearAll": { en: "✕ Clear All", id: "✕ Hapus Semua" },
  "dash.noPredictions": {
    en: "No predictions yet.",
    id: "Belum ada prediksi.",
  },
  "dash.noSentences": {
    en: "No saved sentences yet.",
    id: "Belum ada kalimat tersimpan.",
  },
  "dash.loading": { en: "Loading dashboard...", id: "Memuat dasbor..." },
  "dash.id": { en: "ID", id: "ID" },
  "dash.letter": { en: "Letter", id: "Huruf" },
  "dash.confidence": { en: "Confidence", id: "Kepercayaan" },
  "dash.session": { en: "Session", id: "Sesi" },
  "dash.time": { en: "Time", id: "Waktu" },
  "dash.deleteConfirmPred": {
    en: "Delete all prediction history?",
    id: "Hapus semua riwayat prediksi?",
  },
  "dash.deleteConfirmSent": {
    en: "Delete all saved sentences?",
    id: "Hapus semua kalimat tersimpan?",
  },

  // ── Accuracy Test page ────────────────────────────────────────────────────
  "test.title": { en: "Accuracy Test", id: "Uji Akurasi" },
  "test.subtitle": {
    en: "Test the ML model's recognition accuracy across all 26 SIBI letters",
    id: "Uji akurasi pengenalan model ML untuk 26 huruf SIBI",
  },
  "test.howItWorks": { en: "HOW THE TEST WORKS", id: "CARA KERJA PENGUJIAN" },
  "test.howDesc": {
    en: "The system will prompt you to sign each letter one by one. Hold each sign steadily until it is confirmed. The test records whether each detection was correct or incorrect.",
    id: "Sistem akan meminta Anda mengisyaratkan setiap huruf satu per satu. Tahan setiap isyarat sampai dikonfirmasi. Pengujian mencatat apakah deteksi benar atau salah.",
  },
  "test.startTest": { en: "Start Accuracy Test", id: "Mulai Uji Akurasi" },
  "test.stopTest": { en: "Stop Test", id: "Hentikan Pengujian" },
  "test.signThis": { en: "Sign this letter:", id: "Isyaratkan huruf ini:" },
  "test.detected": { en: "Detected:", id: "Terdeteksi:" },
  "test.correct": { en: "✓ Correct", id: "✓ Benar" },
  "test.incorrect": { en: "✗ Incorrect", id: "✗ Salah" },
  "test.skip": { en: "Skip", id: "Lewati" },
  "test.next": { en: "Next Letter →", id: "Huruf Berikutnya →" },
  "test.progress": { en: "Progress", id: "Kemajuan" },
  "test.results": { en: "Test Results", id: "Hasil Pengujian" },
  "test.accuracy": { en: "Overall Accuracy", id: "Akurasi Keseluruhan" },
  "test.correct_count": { en: "Correct", id: "Benar" },
  "test.incorrect_count": { en: "Incorrect", id: "Salah" },
  "test.skipped": { en: "Skipped", id: "Dilewati" },
  "test.perLetter": { en: "PER-LETTER RESULTS", id: "HASIL PER HURUF" },
  "test.retake": { en: "Retake Test", id: "Ulangi Pengujian" },
  "test.exportResults": { en: "⬇ Export Results", id: "⬇ Ekspor Hasil" },
  "test.noCamera": {
    en: "Camera is required for accuracy testing.",
    id: "Kamera diperlukan untuk pengujian akurasi.",
  },
  "test.avgConf": { en: "Avg Confidence", id: "Kepercayaan Rata-rata" },
  "test.completed": { en: "Test completed!", id: "Pengujian selesai!" },
  "test.waitingSign": { en: "Waiting for sign...", id: "Menunggu isyarat..." },
  "test.confirmed": { en: "Confirmed!", id: "Dikonfirmasi!" },

  // ── About page ────────────────────────────────────────────────────────────
  "about.title": { en: "About SIMBAsoloV3", id: "Tentang SIMBAsoloV3" },
  "about.subtitle": {
    en: "Sign Language Translation System",
    id: "Sistem Penerjemah Bahasa Isyarat",
  },
  "about.whatTitle": { en: "What is SIMBAsoloV3?", id: "Apa itu SIMBAsoloV3?" },
  "about.whatDesc": {
    en: "SIMBAsoloV3 is a real-time Indonesian Sign Language (SIBI) recognition system designed to facilitate communication between hearing-impaired individuals and cashier staff. It uses a Convolutional Neural Network (CNN) with MobileNet architecture to detect and translate hand signs captured through a webcam.",
    id: "SIMBAsoloV3 adalah sistem pengenalan Bahasa Isyarat Indonesia (SIBI) secara real-time yang dirancang untuk memfasilitasi komunikasi antara individu dengan gangguan pendengaran dan kasir toko. Sistem ini menggunakan Jaringan Saraf Konvolusional (CNN) dengan arsitektur MobileNet untuk mendeteksi dan menerjemahkan isyarat tangan melalui webcam.",
  },
  "about.sibiTitle": { en: "What is SIBI?", id: "Apa itu SIBI?" },
  "about.sibiDesc": {
    en: "SIBI (Sistem Isyarat Bahasa Indonesia) is the standardized Indonesian Sign Language system. It consists of a manual alphabet of 26 hand signs corresponding to letters A through Z, used by the deaf and hard-of-hearing community in Indonesia.",
    id: "SIBI (Sistem Isyarat Bahasa Indonesia) adalah sistem bahasa isyarat Indonesia yang terstandarisasi. Terdiri dari abjad manual 26 isyarat tangan yang sesuai dengan huruf A hingga Z, digunakan oleh komunitas tuli dan tunarungu di Indonesia.",
  },
  "about.howUseTitle": { en: "How to Use", id: "Cara Penggunaan" },
  "about.howUse1": {
    en: "Click Start Camera on the Recognizer page to activate the webcam.",
    id: "Klik Mulai Kamera di halaman Penerjemah untuk mengaktifkan webcam.",
  },
  "about.howUse2": {
    en: "Position your hand clearly in front of the camera.",
    id: "Posisikan tangan Anda dengan jelas di depan kamera.",
  },
  "about.howUse3": {
    en: "Sign each letter — hold it steady for a moment until it is confirmed.",
    id: "Isyaratkan setiap huruf — tahan sejenak hingga dikonfirmasi.",
  },
  "about.howUse4": {
    en: "Letters are added to the Word Builder automatically.",
    id: "Huruf ditambahkan ke Pembuat Kata secara otomatis.",
  },
  "about.howUse5": {
    en: "Press Save Sentence to store the completed word or phrase.",
    id: "Tekan Simpan Kalimat untuk menyimpan kata atau frasa yang selesai.",
  },
  "about.howUse6": {
    en: "Press ▶ Speak to have the text read aloud.",
    id: "Tekan ▶ Bicara agar teks dibacakan dengan suara.",
  },
  "about.tipsTitle": {
    en: "Tips for Best Results",
    id: "Tips untuk Hasil Terbaik",
  },
  "about.tip1": {
    en: "Ensure good lighting — avoid backlight from windows behind you.",
    id: "Pastikan pencahayaan baik — hindari cahaya dari jendela di belakang Anda.",
  },
  "about.tip2": {
    en: "Keep your hand fully visible within the camera frame.",
    id: "Pastikan tangan Anda sepenuhnya terlihat dalam bingkai kamera.",
  },
  "about.tip3": {
    en: "Hold each sign steady for at least 1 second for best detection.",
    id: "Tahan setiap isyarat minimal 1 detik untuk deteksi terbaik.",
  },
  "about.tip4": {
    en: "Use the SIBI Dictionary page as a reference for correct hand shapes.",
    id: "Gunakan halaman Kamus SIBI sebagai referensi bentuk tangan yang benar.",
  },
  "about.tip5": {
    en: "If confidence is low, try adjusting your hand position or lighting.",
    id: "Jika kepercayaan rendah, coba sesuaikan posisi tangan atau pencahayaan.",
  },
  "about.devTitle": { en: "Developer Information", id: "Informasi Pengembang" },
  "about.capstoneTitle": { en: "Capstone Project", id: "Proyek Capstone" },
  "about.techTitle": { en: "Technology Stack", id: "Teknologi yang Digunakan" },
  "about.version": { en: "Version", id: "Versi" },
  "about.frontend": { en: "Frontend", id: "Frontend" },
  "about.backend": { en: "Backend", id: "Backend" },
  "about.mlService": { en: "ML Service", id: "Layanan ML" },
  "about.database": { en: "Database", id: "Basis Data" },

  // ── Shared ────────────────────────────────────────────────────────────────
  "common.loading": { en: "Loading...", id: "Memuat..." },
  "common.noData": { en: "No data yet.", id: "Belum ada data." },
} as const;

export type TranslationKey = keyof typeof translations;
