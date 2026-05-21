import hashlib
import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models


def hash_password(password: str) -> str:
    salt = "simba_v3_salt_2025"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def create_session(db: Session, admin_id: int) -> str:
    token = secrets.token_hex(32)
    now = datetime.now()
    session = models.AdminSession(
        admin_id=admin_id,
        token=token,
        created_at=now,
        expires_at=now + timedelta(hours=8),
    )
    db.add(session)
    db.commit()
    return token


def get_admin_by_token(db: Session, token: str):
    if not token:
        return None
    session = (
        db.query(models.AdminSession)
        .filter(models.AdminSession.token == token)
        .first()
    )
    if not session:
        return None
    if session.expires_at < datetime.now():
        db.delete(session)
        db.commit()
        return None
    admin = db.query(models.Admin).filter(
        models.Admin.id == session.admin_id,
        models.Admin.is_active == True,
    ).first()
    return admin


def delete_session(db: Session, token: str):
    session = db.query(models.AdminSession).filter(
        models.AdminSession.token == token
    ).first()
    if session:
        db.delete(session)
        db.commit()