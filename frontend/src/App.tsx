import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { RecognizerPage } from "./pages/RecognizerPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DictionaryPage } from "./pages/DictionaryPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminRegisterPage } from "./pages/AdminRegisterPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { postSentence } from "./api/client";

export interface RecentSentence {
  id: number;
  text: string;
  time: string;
}

export default function App() {
  const [recentSentences, setRecentSentences] = useState<RecentSentence[]>([]);
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("simba-theme") || "dark";
  });

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
      console.error("Failed to save sentence:", e);
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
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route
              path="/settings"
              element={<SettingsPage theme={theme} setTheme={setTheme} />}
            />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
