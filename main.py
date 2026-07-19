import os
import io
import json
import numpy as np
import pandas as pd
import joblib
from scipy.stats import entropy
from scipy.fft import fft
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from typing import Optional

app = FastAPI(title="Kinetrace Core ML Engine", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "models"
models_cache = {}

def load_ml_systems():
    global models_cache
    models_loaded = 0
    try:
        if os.path.exists(os.path.join(MODEL_DIR, "rf_activity_classifier.pkl")):
            models_cache['rf_activity'] = joblib.load(os.path.join(MODEL_DIR, "rf_activity_classifier.pkl"))
            models_loaded += 1
    except Exception as e:
        print(f"\u26a0\ufe0f rf_activity load failed: {e}")

    try:
        if os.path.exists(os.path.join(MODEL_DIR, "rf_tug_regressor.pkl")):
            models_cache['rf_tug'] = joblib.load(os.path.join(MODEL_DIR, "rf_tug_regressor.pkl"))
            models_loaded += 1
    except Exception as e:
        print(f"\u26a0\ufe0f rf_tug load failed: {e}")

    try:
        if os.path.exists(os.path.join(MODEL_DIR, "baseline_mean.npy")):
            models_cache['baseline_mean'] = np.load(os.path.join(MODEL_DIR, "baseline_mean.npy"))
            models_loaded += 1
    except Exception as e:
        print(f"\u26a0\ufe0f baseline_mean load failed: {e}")

    try:
        if os.path.exists(os.path.join(MODEL_DIR, "baseline_cov_inv.npy")):
            models_cache['baseline_cov_inv'] = np.load(os.path.join(MODEL_DIR, "baseline_cov_inv.npy"))
            models_loaded += 1
    except Exception as e:
        print(f"\u26a0\ufe0f baseline_cov_inv load failed: {e}")

    print(f"\U0001f52e Kinetrace ML Core: {models_loaded}/4 systems mapped to memory.")

@app.on_event("startup")
async def startup_event():
    load_ml_systems()

def compute_ksi(magnitude_series, jerk_series):
    if len(magnitude_series) < 2:
        return 50.0

    mean_abs_jerk = float(np.mean(np.abs(jerk_series)))
    std_dev = float(np.std(magnitude_series))

    ksi = max(0.0, 100.0 - (50.0 * mean_abs_jerk + 20.0 * std_dev))
    return round(ksi, 2)

def process_raw_telemetry(df_raw, sampling_rate=50):
    acc_mag = np.sqrt(df_raw['ax']**2 + df_raw['ay']**2 + df_raw['az']**2)
    gyro_mag = np.sqrt(df_raw['gx']**2 + df_raw['gy']**2 + df_raw['gz']**2) if all(c in df_raw.columns for c in ['gx', 'gy', 'gz']) else None

    dt = 1.0 / sampling_rate
    jerk_acc = np.gradient(acc_mag, dt)
    jerk_gyro = np.gradient(gyro_mag, dt) if gyro_mag is not None else np.zeros_like(jerk_acc)

    ksi = compute_ksi(acc_mag, jerk_acc)

    features = {
        'Mean_Acc_Mag': [float(np.mean(acc_mag))],
        'Std_Acc_Mag': [float(np.std(acc_mag))],
        'Mean_Gyro_Mag': [float(np.mean(gyro_mag))] if gyro_mag is not None else [0.0],
        'Std_Gyro_Mag': [float(np.std(gyro_mag))] if gyro_mag is not None else [0.0],
        'Mean_Abs_Jerk_Acc_Mag': [float(np.mean(np.abs(jerk_acc)))],
        'Mean_Abs_Jerk_Gyro_Mag': [float(np.mean(np.abs(jerk_gyro)))],
        'Entropy_Acc_Mag': [float(entropy(np.histogram(acc_mag, bins=10)[0] + 1e-10))],
        'Entropy_Gyro_Mag': [float(entropy(np.histogram(gyro_mag, bins=10)[0] + 1e-10))] if gyro_mag is not None else [0.0],
        'Dominant_Freq_Acc_Mag': [int(np.abs(fft(acc_mag - np.mean(acc_mag))).argmax())]
    }

    return pd.DataFrame(features), {
        "acc_magnitude": acc_mag.tolist(),
        "gyro_magnitude": gyro_mag.tolist() if gyro_mag is not None else [],
        "jerk_acc": jerk_acc.tolist(),
        "jerk_gyro": jerk_gyro.tolist(),
        "ksi": ksi,
        "mean_abs_jerk": float(np.mean(np.abs(jerk_acc))),
        "std_dev": float(np.std(acc_mag))
    }

@app.get("/api/health")
async def health_check():
    models_loaded = sum(1 for v in models_cache.values() if v is not None)
    return {
        "status": "healthy",
        "version": "2.1.0",
        "models_loaded": models_loaded,
        "model_details": {
            "rf_activity": models_cache.get('rf_activity') is not None,
            "rf_tug": models_cache.get('rf_tug') is not None,
            "baseline_mean": models_cache.get('baseline_mean') is not None,
            "baseline_cov_inv": models_cache.get('baseline_cov_inv') is not None
        }
    }

@app.get("/api/status")
async def stream_status():
    return {
        "online": models_cache.get('rf_activity') is not None,
        "processing": False,
        "last_analysis": None
    }

@app.post("/api/ingest")
async def ingest_telemetry(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    required = ['ax', 'ay', 'az']
    if not all(c in df.columns for c in required):
        raise HTTPException(status_code=400, detail=f"Missing required columns: {required}")

    features, signals = process_raw_telemetry(df)

    activity = "Unknown"
    tug_score = 0.0

    if 'rf_activity' in models_cache:
        try:
            pred = models_cache['rf_activity'].predict(features[models_cache['rf_activity'].feature_names_in_])
            activity = str(pred[0])
        except Exception as e:
            print(f"Activity prediction failed: {e}")

    if 'rf_tug' in models_cache:
        try:
            tug_score = float(models_cache['rf_tug'].predict(features)[0])
        except Exception as e:
            print(f"TUG prediction failed: {e}")

    ksi = signals['ksi']
    jerk = signals['mean_abs_jerk']
    variance = signals['std_dev']

    if ksi >= 80:
        stability = "Optimal"
    elif ksi >= 50:
        stability = "Degraded"
    else:
        stability = "Critical"

    return {
        "status": "success",
        "predicted_activity": activity,
        "mean_kinetic_stability_index": ksi,
        "estimated_clinical_tug_score": round(tug_score, 2),
        "stabilityState": stability,
        "signals": {
            "acc_magnitude": signals['acc_magnitude'],
            "jerk_acc": signals['jerk_acc'],
            "mean_abs_jerk": signals['mean_abs_jerk'],
            "std_dev": signals['std_dev']
        },
        "windows": 1,
        "total_frames": len(df),
        "sampling_rate": 50
    }

@app.post("/api/ingest/stream")
async def ingest_stream(data: str):
    try:
        frames = json.loads(data)
        if not isinstance(frames, list) or len(frames) == 0:
            raise HTTPException(status_code=400, detail="Expected non-empty JSON array")

        df = pd.DataFrame(frames)
        features, signals = process_raw_telemetry(df)

        ksi = signals['ksi']
        jerk = signals['mean_abs_jerk']
        variance = signals['std_dev']

        if ksi >= 80:
            stability = "Optimal"
        elif ksi >= 50:
            stability = "Degraded"
        else:
            stability = "Critical"

        return {
            "status": "success",
            "mean_kinetic_stability_index": ksi,
            "stabilityState": stability,
            "signals": {
                "acc_magnitude": signals['acc_magnitude'],
                "jerk_acc": signals['jerk_acc']
            },
            "windows": 1,
            "total_frames": len(df)
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream processing failed: {str(e)}")

@app.get("/api/export/csv")
async def export_csv():
    t = np.arange(0, 5, 0.02)
    sample = pd.DataFrame({
        'timestamp_ms': (t * 1000).astype(int),
        'ax': np.sin(t * 2 * np.pi * 0.5) * 0.1 + 9.8,
        'ay': np.cos(t * 2 * np.pi * 0.5) * 0.05 + 0.1,
        'az': np.sin(t * 2 * np.pi * 0.3) * 0.08 + 0.2,
        'gx': np.sin(t * 2 * np.pi * 0.7) * 0.03 + 0.01,
        'gy': np.cos(t * 2 * np.pi * 0.4) * 0.02 + 0.005,
        'gz': np.sin(t * 2 * np.pi * 0.6) * 0.015 + 0.002
    })
    csv_content = sample.to_csv(index=False)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kinetrace_sample_data.csv"}
    )

active_connections = []

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                frames = json.loads(data)
                if not isinstance(frames, list) or len(frames) == 0:
                    await websocket.send_json({"type": "error", "message": "Expected non-empty JSON array of frames"})
                    continue

                df = pd.DataFrame(frames)
                features, signals = process_raw_telemetry(df)

                await websocket.send_json({
                    "type": "analysis",
                    "ksi": signals['ksi'],
                    "mean_abs_jerk": signals['mean_abs_jerk'],
                    "std_dev": signals['std_dev'],
                    "timestamp": pd.Timestamp.now().isoformat()
                })
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
    except WebSocketDisconnect:
        active_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)