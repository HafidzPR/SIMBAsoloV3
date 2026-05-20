from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class TopPrediction(BaseModel):
    letter: str
    confidence: float


class PredictRequest(BaseModel):
    image: str
    session_id: str


class PredictResponse(BaseModel):
    letter: str
    confidence: float
    top3: List[TopPrediction]
    hand_detected: bool
    landmarks: List[dict]
    history_id: Optional[int] = None


class HistoryItem(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    letter: str
    confidence: float
    timestamp: datetime
    session_id: str


class SettingItem(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    key: str
    value: str
    label: str


class SettingUpdate(BaseModel):
    value: str