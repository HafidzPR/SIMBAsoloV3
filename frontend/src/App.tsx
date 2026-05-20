import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { RecognizerPage } from "./pages/RecognizerPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { postSentence } from "./api/client";

export interface RecentSentence {
  id: number;
  text: string;
  time: string;
}

export default function App() {
  const [recentSentences, setRecentSentences] = useState<RecentSentence[]>([]);

  // Theme lives only in localStorage — no backend dependency
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("simba-theme") || "dark";
  });

  // Keep the HTML data-theme attribute in sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("simba-theme", theme);
  }, [theme]);

  const sessionIdRef = useRef(
    `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  );

  const addSentence = async (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString();
    setRecentSentences((prev) =>
      [{ id: Date.now(), text: text.trim(), time }, ...prev].slice(0, 10),
    );
    try {
      await postSentence(text.trim(), sessionIdRef.current);
    } catch (e) {
      console.error("Failed to save sentence to backend:", e);
    }
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route
              path="/"
              element={
                <RecognizerPage
                  recentSentences={recentSentences}
                  onSaveSentence={addSentence}
                />
              }
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route
              path="/settings"
              element={<SettingsPage theme={theme} setTheme={setTheme} />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
