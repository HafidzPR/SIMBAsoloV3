import type {
  PredictResponse,
  HistoryItem,
  SettingItem,
  AdminInfo,
  AdminStats,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface SentenceItem {
  id: number;
  text: string;
  timestamp: string;
  session_id: string;
}

function getToken(): string | null {
  return localStorage.getItem("simba_admin_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postPredict(
  image: string,
  sessionId: string,
): Promise<PredictResponse> {
  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Predict failed ${res.status}`);
  return res.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${BASE}/history?limit=500`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function deleteHistory(): Promise<{ deleted: number }> {
  const res = await fetch(`${BASE}/history`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear history");
  return res.json();
}

export async function postSentence(
  text: string,
  sessionId: string,
): Promise<SentenceItem> {
  const res = await fetch(`${BASE}/sentences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to save sentence");
  return res.json();
}

export async function getSentences(): Promise<SentenceItem[]> {
  const res = await fetch(`${BASE}/sentences`);
  if (!res.ok) throw new Error("Failed to fetch sentences");
  return res.json();
}

export async function deleteSentences(): Promise<{ deleted: number }> {
  const res = await fetch(`${BASE}/sentences`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear sentences");
  return res.json();
}

export async function getSettings(): Promise<SettingItem[]> {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function putSetting(
  key: string,
  value: string,
): Promise<SettingItem> {
  const res = await fetch(`${BASE}/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`Failed to update setting '${key}'`);
  return res.json();
}

export async function adminRegister(
  username: string,
  email: string,
  password: string,
): Promise<AdminInfo> {
  const res = await fetch(`${BASE}/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<{ token: string; admin: AdminInfo }> {
  const res = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function adminLogout(): Promise<void> {
  await fetch(`${BASE}/admin/logout`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  localStorage.removeItem("simba_admin_token");
  localStorage.removeItem("simba_admin_info");
}

export async function getAdminMe(): Promise<AdminInfo> {
  const res = await fetch(`${BASE}/admin/me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE}/admin/stats`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

interface LetterFreqItem {
  letter: string;
  count: number;
}

export async function getLetterFrequency(): Promise<LetterFreqItem[]> {
  const res = await fetch(`${BASE}/admin/letter-frequency`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch letter frequency");
  return res.json();
}
