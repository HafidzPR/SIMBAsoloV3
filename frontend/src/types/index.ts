export interface TopPrediction {
  letter: string;
  confidence: number;
}

export interface PredictResponse {
  letter: string;
  confidence: number;
  top3: TopPrediction[];
  hand_detected: boolean;
  landmarks: Array<{ x: number; y: number; z: number }>;
  history_id: number | null;
}

export interface HistoryItem {
  id: number;
  letter: string;
  confidence: number;
  timestamp: string;
  session_id: string;
}

export interface SettingItem {
  id: number;
  key: string;
  value: string;
  label: string;
}

export interface AdminInfo {
  id: number;
  username: string;
  email: string;
}

export interface AdminStats {
  total_predictions: number;
  total_sessions: number;
  avg_confidence: number;
  top_letter: string;
  total_sentences: number;
}
