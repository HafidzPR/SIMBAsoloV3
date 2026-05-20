import base64
import os
import cv2
import numpy as np
import mediapipe as mp

# ── Patch batch_shape BEFORE importing keras ──────────────────────────────────
import tensorflow as tf
from tensorflow.python.keras.saving import hdf5_format
import h5py

def patched_load(filepath, custom_objects=None, compile=True, options=None):
    with h5py.File(filepath, mode="r") as f:
        model_config = f.attrs.get("model_config")
        if model_config and isinstance(model_config, bytes):
            model_config = model_config.decode("utf-8")
        if model_config:
            model_config = model_config.replace(
                '"batch_shape"', '"batch_input_shape"'
            )
            f.attrs["model_config"] = model_config.encode("utf-8")
    return tf.keras.models.load_model(
        filepath, custom_objects=custom_objects, compile=compile
    )

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "model_SIBI.h5")
LABELS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

# ── Load model ────────────────────────────────────────────────────────────────
print(f"[ML] Loading model from: {MODEL_PATH}")
model = None
try:
    # Strategy 1: direct load
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print(f"[ML] Model loaded OK (strategy 1) — input shape: {model.input_shape}")
except Exception as e1:
    print(f"[ML] Strategy 1 failed: {e1}")
    try:
        # Strategy 2: patch batch_shape in the file then load
        import json, shutil, tempfile
        tmp = tempfile.mktemp(suffix=".h5")
        shutil.copy2(MODEL_PATH, tmp)
        with h5py.File(tmp, "r+") as f:
            cfg = f.attrs.get("model_config")
            if isinstance(cfg, bytes):
                cfg = cfg.decode("utf-8")
            cfg = cfg.replace('"batch_shape"', '"batch_input_shape"')
            f.attrs["model_config"] = cfg.encode("utf-8")
        model = tf.keras.models.load_model(tmp, compile=False)
        os.remove(tmp)
        print(f"[ML] Model loaded OK (strategy 2) — input shape: {model.input_shape}")
    except Exception as e2:
        print(f"[ML] Strategy 2 failed: {e2}")
        try:
            # Strategy 3: load weights only by rebuilding architecture
            num_classes = 26
            inp = tf.keras.Input(shape=(63, 1))
            x = tf.keras.layers.Conv1D(32, 5, padding="causal", activation="relu")(inp)
            x = tf.keras.layers.Conv1D(32, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Conv1D(64, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.Conv1D(64, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Conv1D(128, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.Conv1D(128, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Conv1D(256, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.Conv1D(256, 5, padding="causal", activation="relu")(x)
            x = tf.keras.layers.MaxPooling1D(2)(x)
            x = tf.keras.layers.Dropout(0.2)(x)
            x = tf.keras.layers.Flatten()(x)
            x = tf.keras.layers.Dense(512, activation="relu")(x)
            out = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
            model = tf.keras.Model(inp, out)
            model.load_weights(MODEL_PATH, by_name=False, skip_mismatch=False)
            print(f"[ML] Model loaded OK (strategy 3) — input shape: {model.input_shape}")
        except Exception as e3:
            print(f"[ML] All strategies failed. Last error: {e3}")
            model = None

if model is not None:
    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

# ── MediaPipe Hands ───────────────────────────────────────────────────────────
mp_hands = mp.solutions.hands
detector = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.1,
)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="SIMBAsoloV3 ML Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    image: str


class TopPrediction(BaseModel):
    letter: str
    confidence: float


class PredictResponse(BaseModel):
    letter: str
    confidence: float
    top3: list[TopPrediction]
    hand_detected: bool
    landmarks: list[dict]


# ── Helpers ───────────────────────────────────────────────────────────────────
def decode_image(b64: str) -> np.ndarray:
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes")
    return img


def extract_landmarks(bgr: np.ndarray):
    h, w = bgr.shape[:2]
    flipped = cv2.flip(bgr, 1)
    rgb = cv2.cvtColor(flipped, cv2.COLOR_BGR2RGB)
    results = detector.process(rgb)
    if not results.multi_hand_landmarks:
        return None, []
    lm = results.multi_hand_landmarks[0].landmark
    coords = []
    for p in lm:
        coords.extend([p.x * w, p.y * h, p.z])
    coords = np.array(coords, dtype=np.float32)
    raw = [{"x": p.x, "y": p.y, "z": p.z} for p in lm]
    return coords, raw


def prepare_input(coords: np.ndarray) -> np.ndarray:
    return coords.reshape(1, 63, 1)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        bgr = decode_image(req.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bad image: {e}")

    coords, raw_lm = extract_landmarks(bgr)

    if coords is None:
        return PredictResponse(
            letter="",
            confidence=0.0,
            top3=[],
            hand_detected=False,
            landmarks=[],
        )

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    inp = prepare_input(coords)
    probs = model.predict(inp, verbose=0)[0]

    top3_idx = np.argsort(probs)[::-1][:3]
    top3 = [
        TopPrediction(
            letter=LABELS[i],
            confidence=round(float(probs[i]), 4)
        )
        for i in top3_idx
    ]
    best = int(np.argmax(probs))

    return PredictResponse(
        letter=LABELS[best],
        confidence=round(float(probs[best]), 4),
        top3=top3,
        hand_detected=True,
        landmarks=raw_lm,
    )