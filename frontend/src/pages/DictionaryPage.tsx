import { useState } from "react";
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

  return (
    <div className="page dictionary-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("dict.title")}</h1>
          <p className="page-subtitle">{t("dict.subtitle")}</p>
        </div>
      </div>

      <div className="dict-desc">{t("dict.desc")}</div>

      <div
        className="history-search"
        style={{ maxWidth: 400, marginBottom: 24 }}
      >
        <input
          className="history-search-input"
          placeholder={t("dict.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="history-search-clear"
            onClick={() => setSearch("")}
          >
            ✕
          </button>
        )}
      </div>

      <div className="dict-grid">
        {filtered.map((sign) => (
          <div
            key={sign.letter}
            className="dict-card"
            onClick={() => setSelected(sign.letter)}
          >
            <div className="dict-card-img-wrap">
              {imgError[sign.letter] ? (
                <div className="dict-card-placeholder">{sign.letter}</div>
              ) : (
                <img
                  src={sign.imagePath}
                  alt={`SIBI ${sign.letter}`}
                  className="dict-card-img"
                  onError={() => handleImgError(sign.letter)}
                />
              )}
            </div>
            <div className="dict-card-letter">{sign.letter}</div>
            <div className="dict-card-desc">{getDesc(sign)}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>
            {t("dict.noResults")} "{search}"
          </p>
        </div>
      )}

      <div className="dict-instructions">
        <p className="settings-info-title">{t("dict.howToAdd")}</p>
        <ul className="settings-info-list">
          <li>{t("dict.addHint1")}</li>
          <li>{t("dict.addHint2")}</li>
          <li>{t("dict.addHint3")}</li>
        </ul>
      </div>

      {modalSign && (
        <div className="dict-modal-overlay" onClick={() => setSelected(null)}>
          <div className="dict-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dict-modal-header">
              <span className="dict-modal-letter">{modalSign.letter}</span>
              <button
                className="dict-modal-close"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>
            <div className="dict-modal-img-wrap">
              {imgError[modalSign.letter] ? (
                <div className="dict-modal-placeholder">{modalSign.letter}</div>
              ) : (
                <img
                  src={modalSign.imagePath}
                  alt={`SIBI ${modalSign.letter}`}
                  className="dict-modal-img"
                  onError={() => handleImgError(modalSign.letter)}
                />
              )}
            </div>
            <p className="dict-modal-desc">{getDesc(modalSign)}</p>
            <div className="dict-modal-nav">
              <button
                className="dict-modal-nav-btn"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                ← {lang === "id" ? "Sebelumnya" : "Prev"}
              </button>
              <span className="dict-modal-nav-pos">
                {currentIndex + 1} / {SIGN_DATA.length}
              </span>
              <button
                className="dict-modal-nav-btn"
                onClick={goNext}
                disabled={currentIndex === SIGN_DATA.length - 1}
              >
                {lang === "id" ? "Berikutnya" : "Next"} →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
