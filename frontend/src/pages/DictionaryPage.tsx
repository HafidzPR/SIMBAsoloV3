import { useState } from "react";
import { Search, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";

interface SignEntry {
  letter: string;
  descEn: string;
  descId: string;
  imagePath: string;
}

const SIGN_DATA: SignEntry[] = [
  {
    letter: "A",
    descEn: "Closed fist with thumb resting on the side",
    descId: "Kepalan tangan dengan ibu jari di sisi",
  },
  {
    letter: "B",
    descEn: "Four fingers straight up, thumb folded across palm",
    descId: "Empat jari lurus ke atas, ibu jari dilipat ke telapak",
  },
  {
    letter: "C",
    descEn: "Hand curved to form the letter C",
    descId: "Tangan melengkung membentuk huruf C",
  },
  {
    letter: "D",
    descEn: "Index finger pointing up, other fingers form a circle",
    descId: "Jari telunjuk lurus ke atas, jari lain membentuk lingkaran",
  },
  {
    letter: "E",
    descEn: "All fingers curled downward toward palm",
    descId: "Semua jari ditekuk ke bawah menuju telapak",
  },
  {
    letter: "F",
    descEn: "Thumb and index form a circle, other fingers straight",
    descId: "Ibu jari dan telunjuk membentuk lingkaran, jari lain lurus",
  },
  {
    letter: "G",
    descEn: "Index finger and thumb pointing sideways",
    descId: "Jari telunjuk dan ibu jari menunjuk ke samping",
  },
  {
    letter: "H",
    descEn: "Index and middle fingers extended sideways together",
    descId: "Jari telunjuk dan tengah lurus ke samping",
  },
  {
    letter: "I",
    descEn: "Pinky finger pointing straight up",
    descId: "Kelingking lurus ke atas",
  },
  {
    letter: "J",
    descEn: "Pinky pointing up, trace the letter J in the air",
    descId: "Kelingking lurus, buat gerakan huruf J di udara",
  },
  {
    letter: "K",
    descEn: "Index and middle pointing up with thumb between them",
    descId: "Telunjuk dan tengah ke atas dengan ibu jari di tengah",
  },
  {
    letter: "L",
    descEn: "Thumb and index finger form an L shape",
    descId: "Ibu jari dan telunjuk membentuk sudut L",
  },
  {
    letter: "M",
    descEn: "Three fingers folded over the thumb",
    descId: "Tiga jari ditekuk di atas ibu jari",
  },
  {
    letter: "N",
    descEn: "Two fingers folded over the thumb",
    descId: "Dua jari ditekuk di atas ibu jari",
  },
  {
    letter: "O",
    descEn: "All fingers curved to form the letter O",
    descId: "Semua jari membentuk lingkaran O",
  },
  {
    letter: "P",
    descEn: "Like K but pointing downward",
    descId: "Seperti K tapi menunjuk ke bawah",
  },
  {
    letter: "Q",
    descEn: "Like G but pointing downward",
    descId: "Seperti G tapi menunjuk ke bawah",
  },
  {
    letter: "R",
    descEn: "Index and middle fingers crossed",
    descId: "Jari telunjuk dan tengah bersilang",
  },
  {
    letter: "S",
    descEn: "Closed fist with thumb over the fingers",
    descId: "Kepalan tangan dengan ibu jari di depan",
  },
  {
    letter: "T",
    descEn: "Thumb tucked between index and middle fingers",
    descId: "Ibu jari diantara telunjuk dan jari tengah",
  },
  {
    letter: "U",
    descEn: "Index and middle fingers straight up together",
    descId: "Telunjuk dan tengah lurus berdampingan",
  },
  {
    letter: "V",
    descEn: "Index and middle fingers spread apart in a V",
    descId: "Telunjuk dan tengah membentuk V",
  },
  {
    letter: "W",
    descEn: "Three fingers (index, middle, ring) spread open",
    descId: "Tiga jari (telunjuk, tengah, manis) terbuka",
  },
  {
    letter: "X",
    descEn: "Index finger bent like a hook",
    descId: "Telunjuk melengkung seperti kail",
  },
  {
    letter: "Y",
    descEn: "Thumb and pinky extended outward",
    descId: "Ibu jari dan kelingking terbuka",
  },
  {
    letter: "Z",
    descEn: "Index finger traces the letter Z in the air",
    descId: "Telunjuk membuat gerakan Z di udara",
  },
].map((s) => ({ ...s, imagePath: `/sibi/${s.letter}.png` }));

// Accent colors cycling through the alphabet cards
const CARD_ACCENTS = [
  "#0ea5e9",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#6366f1",
];

export function DictionaryPage() {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const getDesc = (sign: SignEntry) =>
    lang === "id" ? sign.descId : sign.descEn;

  const filtered = SIGN_DATA.filter(
    (s) =>
      s.letter.toLowerCase().includes(search.toLowerCase()) ||
      getDesc(s).toLowerCase().includes(search.toLowerCase()),
  );

  const handleImgError = (letter: string) =>
    setImgError((prev) => ({ ...prev, [letter]: true }));

  const currentIndex = selected
    ? SIGN_DATA.findIndex((s) => s.letter === selected)
    : -1;
  const goPrev = () => {
    if (currentIndex > 0) setSelected(SIGN_DATA[currentIndex - 1].letter);
  };
  const goNext = () => {
    if (currentIndex < SIGN_DATA.length - 1)
      setSelected(SIGN_DATA[currentIndex + 1].letter);
  };
  const modalSign = selected
    ? SIGN_DATA.find((s) => s.letter === selected)
    : null;
  const modalAccent = selected
    ? CARD_ACCENTS[SIGN_DATA.findIndex((s) => s.letter === selected)]
    : "#0ea5e9";

  return (
    <div className="page dict-page">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="dict-hero">
        <div className="dict-hero-icon">
          <BookOpen size={28} />
        </div>
        <div>
          <h1 className="page-title">{t("dict.title")}</h1>
          <p className="page-subtitle">{t("dict.subtitle")}</p>
        </div>
        <div className="dict-hero-badge">26</div>
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      <p className="dict-intro">{t("dict.desc")}</p>

      {/* ── Search ───────────────────────────────────────────────────── */}
      <div className="dict-search-wrap">
        <Search size={15} className="dict-search-icon" />
        <input
          className="dict-search-input"
          placeholder={t("dict.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="dict-search-clear" onClick={() => setSearch("")}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      {!search && (
        <div className="dict-stats-row">
          <div className="dict-stat">
            <span className="dict-stat-num">26</span>
            <span className="dict-stat-label">
              {lang === "id" ? "Total Huruf" : "Total Letters"}
            </span>
          </div>
          <div className="dict-stat">
            <span className="dict-stat-num">
              {Object.keys(imgError).length === 0
                ? "26"
                : 26 - Object.keys(imgError).length}
            </span>
            <span className="dict-stat-label">
              {lang === "id" ? "Gambar Tersedia" : "Images Available"}
            </span>
          </div>
          <div className="dict-stat">
            <span className="dict-stat-num">A–Z</span>
            <span className="dict-stat-label">SIBI Alphabet</span>
          </div>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div className="dict-grid-new">
        {filtered.map((sign, idx) => {
          const accent =
            CARD_ACCENTS[SIGN_DATA.findIndex((s) => s.letter === sign.letter)];
          return (
            <div
              key={sign.letter}
              className="dict-card-new"
              style={{ "--card-accent": accent } as React.CSSProperties}
              onClick={() => setSelected(sign.letter)}
            >
              {/* Accent top bar */}
              <div className="dict-card-bar" />

              {/* Letter badge */}
              <div className="dict-card-badge">{sign.letter}</div>

              {/* Image */}
              <div className="dict-card-img-wrap-new">
                {imgError[sign.letter] ? (
                  <div className="dict-card-ph-new">{sign.letter}</div>
                ) : (
                  <img
                    src={sign.imagePath}
                    alt={`SIBI ${sign.letter}`}
                    className="dict-card-img-new"
                    onError={() => handleImgError(sign.letter)}
                  />
                )}
              </div>

              {/* Description */}
              <p className="dict-card-desc-new">{getDesc(sign)}</p>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>
            {t("dict.noResults")} "{search}"
          </p>
        </div>
      )}

      {/* ── How to add images ─────────────────────────────────────────── */}
      <div className="dict-instructions">
        <p className="settings-info-title">{t("dict.howToAdd")}</p>
        <ul className="settings-info-list">
          <li>{t("dict.addHint1")}</li>
          <li>{t("dict.addHint2")}</li>
          <li>{t("dict.addHint3")}</li>
        </ul>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      {modalSign && (
        <div className="dict-modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="dict-modal-new"
            style={{ "--modal-accent": modalAccent } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent strip */}
            <div className="dict-modal-strip" />

            <div className="dict-modal-inner">
              {/* Header */}
              <div className="dict-modal-header-new">
                <div className="dict-modal-letter-badge">
                  {modalSign.letter}
                </div>
                <div className="dict-modal-meta">
                  <p className="dict-modal-title">Letter {modalSign.letter}</p>
                  <p className="dict-modal-subtitle">SIBI Alphabet</p>
                </div>
                <button
                  className="dict-modal-close"
                  onClick={() => setSelected(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Image */}
              <div className="dict-modal-img-wrap-new">
                {imgError[modalSign.letter] ? (
                  <div className="dict-modal-ph-new">{modalSign.letter}</div>
                ) : (
                  <img
                    src={modalSign.imagePath}
                    alt={`SIBI ${modalSign.letter}`}
                    className="dict-modal-img"
                    onError={() => handleImgError(modalSign.letter)}
                  />
                )}
              </div>

              {/* Description */}
              <div className="dict-modal-desc-box">
                <p className="dict-modal-desc-text">{getDesc(modalSign)}</p>
              </div>

              {/* Navigation */}
              <div className="dict-modal-nav-new">
                <button
                  className="dict-modal-nav-btn-new"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={16} />
                  {lang === "id" ? "Sebelumnya" : "Prev"}
                </button>
                <span className="dict-modal-nav-pos">
                  {currentIndex + 1} / {SIGN_DATA.length}
                </span>
                <button
                  className="dict-modal-nav-btn-new"
                  onClick={goNext}
                  disabled={currentIndex === SIGN_DATA.length - 1}
                >
                  {lang === "id" ? "Berikutnya" : "Next"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
