from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from .database import Base


class Admin(Base):
    """Admin users who can log in to the dashboard."""
    __tablename__ = "admins"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(50), unique=True, index=True)
    email      = Column(String(100), unique=True, index=True)
    password_hash = Column(String(128))
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime)


class AdminSession(Base):
    """Simple session tokens for admin login."""
    __tablename__ = "admin_sessions"

    id         = Column(Integer, primary_key=True, index=True)
    admin_id   = Column(Integer, index=True)
    token      = Column(String(64), unique=True, index=True)
    created_at = Column(DateTime)
    expires_at = Column(DateTime)


class PredictionHistory(Base):
    """Every individual letter prediction gets logged here."""
    __tablename__ = "prediction_history"

    id         = Column(Integer, primary_key=True, index=True)
    letter     = Column(String(1), index=True)
    confidence = Column(Float)
    timestamp  = Column(DateTime)
    session_id = Column(String(64), index=True)


class SavedSentence(Base):
    """Sentences explicitly saved by the user via the Save Sentence button."""
    __tablename__ = "saved_sentences"

    id         = Column(Integer, primary_key=True, index=True)
    text       = Column(Text)
    timestamp  = Column(DateTime)
    session_id = Column(String(64), index=True)


class Setting(Base):
    """Key-value config store."""
    __tablename__ = "settings"

    id    = Column(Integer, primary_key=True, index=True)
    key   = Column(String(100), unique=True, index=True)
    value = Column(Text)
    label = Column(String(200))