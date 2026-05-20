from sqlalchemy.orm import Session
from datetime import datetime
from . import models


# ── Prediction history ────────────────────────────────────────────────────────
def save_prediction(db: Session, letter: str, confidence: float, session_id: str):
    row = models.PredictionHistory(
        letter=letter,
        confidence=confidence,
        timestamp=datetime.now(),
        session_id=session_id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_history(db: Session, skip: int = 0, limit: int = 500, session_id: str = None):
    q = db.query(models.PredictionHistory).order_by(
        models.PredictionHistory.timestamp.desc()
    )
    if session_id:
        q = q.filter(models.PredictionHistory.session_id == session_id)
    return q.offset(skip).limit(limit).all()


def clear_history(db: Session):
    count = db.query(models.PredictionHistory).count()
    db.query(models.PredictionHistory).delete()
    db.commit()
    return count


# ── Saved sentences ───────────────────────────────────────────────────────────
def save_sentence(db: Session, text: str, session_id: str):
    row = models.SavedSentence(
        text=text,
        timestamp=datetime.now(),
        session_id=session_id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_saved_sentences(db: Session, skip: int = 0, limit: int = 200):
    return db.query(models.SavedSentence).order_by(
        models.SavedSentence.timestamp.desc()
    ).offset(skip).limit(limit).all()


def clear_sentences(db: Session):
    count = db.query(models.SavedSentence).count()
    db.query(models.SavedSentence).delete()
    db.commit()
    return count


# ── Settings ──────────────────────────────────────────────────────────────────
DEFAULT_SETTINGS = [
    {
        "key": "confidence_threshold",
        "value": "0.70",
        "label": "Minimum confidence to save a prediction (0.0 - 1.0)",
    },
    {
        "key": "confirm_frames",
        "value": "4",
        "label": "Consecutive frames needed before a letter is confirmed",
    },
    {
        "key": "poll_interval_ms",
        "value": "200",
        "label": "Milliseconds between frames sent to the ML service",
    },
    {
        "key": "model_version",
        "value": "model_SIBI.h5",
        "label": "Active model filename (informational only)",
    },
]


def seed_settings(db: Session):
    for s in DEFAULT_SETTINGS:
        exists = db.query(models.Setting).filter(
            models.Setting.key == s["key"]
        ).first()
        if not exists:
            db.add(models.Setting(**s))
    db.commit()


def get_all_settings(db: Session):
    return db.query(models.Setting).order_by(models.Setting.key).all()


def get_setting(db: Session, key: str):
    return db.query(models.Setting).filter(models.Setting.key == key).first()


def update_setting(db: Session, key: str, value: str):
    row = get_setting(db, key)
    if row:
        row.value = value
        db.commit()
        db.refresh(row)
    return row