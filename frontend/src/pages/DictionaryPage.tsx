import { useState } from "react";

interface SignEntry {
  letter: string;
  description: string;
  imagePath: string;
}

function getSIBIDescription(letter: string): string {
  const descriptions: Record<string, string> = {
    A: "Closed fist with thumb resting on the side",
    B: "Four fingers straight up, thumb folded across palm",
    C: "Hand curved to form the letter C",
    D: "Index finger pointing up, other fingers form a circle",
    E: "All fingers curled downward toward palm",
    F: "Thumb and index form a circle, other fingers straight",
    G: "Index finger and thumb pointing sideways",
    H: "Index and middle fingers extended sideways together",
    I: "Pinky finger pointing straight up",
    J: "Pinky pointing up, trace the letter J in the air",
    K: "Index and middle pointing up with thumb between them",
    L: "Thumb and index finger form an L shape",
    M: "Three fingers folded over the thumb",
    N: "Two fingers folded over the thumb",
    O: "All fingers curved to form the letter O",
    P: "Like K but pointing downward",
    Q: "Like G but pointing downward",
    R: "Index and middle fingers crossed",
    S: "Closed fist with thumb over the fingers",
    T: "Thumb tucked between index and middle fingers",
    U: "Index and middle fingers straight up together",
    V: "Index and middle fingers spread apart in a V",
    W: "Three fingers (index, middle, ring) spread open",
    X: "Index finger bent like a hook",
    Y: "Thumb and pinky extended outward",
    Z: "Index finger traces the letter Z in the air",
  };
  return descriptions[letter] || `SIBI sign for letter ${letter}`;
}

const SIGNS: SignEntry[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .map((letter) => ({
    letter,
    description: getSIBIDescription(letter),
    imagePath: `/sibi/${letter}.png`,
  }));

export function DictionaryPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<SignEntry | null>(null);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const filtered = SIGNS.filter(
    (s) =>
      s.letter.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleImgError = (letter: string) => {
    setImgError((prev) => ({ ...prev, [letter]: true }));
  };

  // Navigate between letters in the modal
  const currentIndex = modal
    ? SIGNS.findIndex((s) => s.letter === modal.letter)
    : -1;
  const goPrev = () => {
    if (currentIndex > 0) setModal(SIGNS[currentIndex - 1]);
  };
  const goNext = () => {
    if (currentIndex < SIGNS.length - 1) setModal(SIGNS[currentIndex + 1]);
  };

  return (
    <div className="page dictionary-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SIBI Dictionary</h1>
          <p className="page-subtitle">
            Indonesian Sign Language Alphabet · 26 Letters
          </p>
        </div>
      </div>

      <div className="dict-desc">
        This dictionary contains visual references for all 26 SIBI alphabet
        signs. Click any card to view the full-size image and description. Use
        the search bar to find a specific letter.
      </div>

      <div
        className="history-search"
        style={{ maxWidth: 400, marginBottom: 24 }}
      >
        <input
          className="history-search-input"
          placeholder="Search by letter or description..."
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

      {/* Grid */}
      <div className="dict-grid">
        {filtered.map((sign) => (
          <div
            key={sign.letter}
            className="dict-card"
            onClick={() => setModal(sign)}
          >
            <div className="dict-card-img-wrap">
              {imgError[sign.letter] ? (
                <div className="dict-card-placeholder">{sign.letter}</div>
              ) : (
                <img
                  src={sign.imagePath}
                  alt={`SIBI sign for letter ${sign.letter}`}
                  className="dict-card-img"
                  onError={() => handleImgError(sign.letter)}
                />
              )}
            </div>
            <div className="dict-card-letter">{sign.letter}</div>
            <div className="dict-card-desc">{sign.description}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No letters matching "{search}"</p>
        </div>
      )}

      <div className="dict-instructions">
        <p className="settings-info-title">HOW TO ADD SIGN IMAGES</p>
        <ul className="settings-info-list">
          <li>
            Place your sign images in <code>frontend/public/sibi/</code> named
            exactly <code>A.png</code>, <code>B.png</code>, etc.
          </li>
          <li>Images appear automatically on the matching card once added.</li>
          <li>If an image is missing, the letter is shown as a placeholder.</li>
        </ul>
      </div>

      {/* Modal */}
      {modal && (
        <div className="dict-modal-overlay" onClick={() => setModal(null)}>
          <div className="dict-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="dict-modal-header">
              <span className="dict-modal-letter">{modal.letter}</span>
              <button
                className="dict-modal-close"
                onClick={() => setModal(null)}
              >
                ✕
              </button>
            </div>

            {/* Image */}
            <div className="dict-modal-img-wrap">
              {imgError[modal.letter] ? (
                <div className="dict-modal-placeholder">{modal.letter}</div>
              ) : (
                <img
                  src={modal.imagePath}
                  alt={`SIBI sign for letter ${modal.letter}`}
                  className="dict-modal-img"
                  onError={() => handleImgError(modal.letter)}
                />
              )}
            </div>

            {/* Description */}
            <p className="dict-modal-desc">{modal.description}</p>

            {/* Navigation */}
            <div className="dict-modal-nav">
              <button
                className="dict-modal-nav-btn"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                ← Prev
              </button>
              <span className="dict-modal-nav-pos">
                {currentIndex + 1} / {SIGNS.length}
              </span>
              <button
                className="dict-modal-nav-btn"
                onClick={goNext}
                disabled={currentIndex === SIGNS.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
