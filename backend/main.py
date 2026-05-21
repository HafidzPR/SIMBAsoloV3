import os
import httpx
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from . import crud, models, schemas
from .database import engine, get_db
from .auth import verify_password, create_session, get_admin_by_token, delete_session

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SIMBAsoloV3 Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    crud.seed_settings(db)


# ── Auth helpers ──────────────────────────────────────────────────────────────
def require_admin(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    admin = get_admin_by_token(db, token)
    if not admin:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return admin


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── Admin Auth ────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/admin/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if crud.get_admin_by_username(db, req.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if crud.get_admin_by_email(db, req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    admin = crud.create_admin(db, req.username, req.email, req.password)
    return {"id": admin.id, "username": admin.username, "email": admin.email}


@app.post("/admin/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    admin = crud.get_admin_by_username(db, req.username)
    if not admin or not verify_password(req.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_session(db, admin.id)
    return {
        "token": token,
        "admin": {"id": admin.id, "username": admin.username, "email": admin.email},
    }


@app.post("/admin/logout")
def logout(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if token:
        delete_session(db, token)
    return {"status": "logged out"}


@app.get("/admin/me")
def me(admin=Depends(require_admin)):
    return {"id": admin.id, "username": admin.username, "email": admin.email}


# ── Admin Stats ───────────────────────────────────────────────────────────────
@app.get("/admin/stats")
def stats(admin=Depends(require_admin), db: Session = Depends(get_db)):
    history_stats = crud.get_history_stats(db)
    sentence_count = crud.get_sentence_count(db)
    return {**history_stats, "total_sentences": sentence_count}

@app.get("/admin/letter-frequency")
def letter_frequency(admin=Depends(require_admin), db: Session = Depends(get_db)):
    return crud.get_letter_frequency(db)


# ── Predict ───────────────────────────────────────────────────────────────────
@app.post("/predict", response_model=schemas.PredictResponse)
async def predict(req: schemas.PredictRequest, db: Session = Depends(get_db)):
    threshold_row = crud.get_setting(db, "confidence_threshold")
    threshold = float(threshold_row.value) if threshold_row else 0.70

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            ml_resp = await client.post(
                f"{ML_SERVICE_URL}/predict",
                json={"image": req.image},
            )
            ml_resp.raise_for_status()
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="ML service unreachable.")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=str(e))

    data = ml_resp.json()

    history_id = None
    if data.get("hand_detected") and data.get("confidence", 0) >= threshold:
        row = crud.save_prediction(
            db,
            letter=data["letter"],
            confidence=data["confidence"],
            session_id=req.session_id,
        )
        history_id = row.id

    return schemas.PredictResponse(
        letter=data.get("letter", ""),
        confidence=data.get("confidence", 0.0),
        top3=[schemas.TopPrediction(**t) for t in data.get("top3", [])],
        hand_detected=data.get("hand_detected", False),
        landmarks=data.get("landmarks", []),
        history_id=history_id,
    )


# ── History ───────────────────────────────────────────────────────────────────
@app.get("/history")
def get_history(
    skip: int = 0,
    limit: int = 500,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    rows = crud.get_history(db, skip=skip, limit=limit, session_id=session_id)
    return [
        {
            "id": r.id,
            "letter": r.letter,
            "confidence": r.confidence,
            "timestamp": r.timestamp.isoformat(),
            "session_id": r.session_id,
        }
        for r in rows
    ]


@app.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    count = crud.clear_history(db)
    return {"deleted": count}


# ── Sentences ─────────────────────────────────────────────────────────────────
class SaveSentenceRequest(BaseModel):
    text: str
    session_id: str


@app.post("/sentences")
def save_sentence(req: SaveSentenceRequest, db: Session = Depends(get_db)):
    row = crud.save_sentence(db, text=req.text, session_id=req.session_id)
    return {
        "id": row.id,
        "text": row.text,
        "timestamp": row.timestamp.isoformat(),
        "session_id": row.session_id,
    }


@app.get("/sentences")
def get_sentences(db: Session = Depends(get_db)):
    rows = crud.get_saved_sentences(db)
    return [
        {
            "id": r.id,
            "text": r.text,
            "timestamp": r.timestamp.isoformat(),
            "session_id": r.session_id,
        }
        for r in rows
    ]


@app.delete("/sentences")
def clear_sentences(db: Session = Depends(get_db)):
    count = crud.clear_sentences(db)
    return {"deleted": count}


# ── Settings ──────────────────────────────────────────────────────────────────
@app.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    rows = crud.get_all_settings(db)
    return [
        {"id": r.id, "key": r.key, "value": r.value, "label": r.label}
        for r in rows
    ]


@app.put("/settings/{key}")
def update_setting(
    key: str, body: schemas.SettingUpdate, db: Session = Depends(get_db)
):
    row = crud.update_setting(db, key=key, value=body.value)
    if not row:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return {"id": row.id, "key": row.key, "value": row.value, "label": row.label}