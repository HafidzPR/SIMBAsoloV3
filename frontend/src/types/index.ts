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
