import type { PredictResponse, HistoryItem, SettingItem } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
): Promise<{
  id: number;
  text: string;
  timestamp: string;
  session_id: string;
}> {
  const res = await fetch(`${BASE}/sentences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to save sentence");
  return res.json();
}

export async function getSentences(): Promise<
  Array<{ id: number; text: string; timestamp: string; session_id: string }>
> {
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
