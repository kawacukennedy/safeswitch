"""
Application entry point. Creates DB tables on startup, registers middleware and router.
In production, serves the built frontend via catch-all SPA route so that client-side
router paths like /dashboard and /demo work on page refresh or direct navigation.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from database import engine, Base, SessionLocal
from router import router
from config import settings
from models import Transaction, ApiSignal

Base.metadata.create_all(bind=engine)

def _seed_db():
    db = SessionLocal()
    try:
        if db.query(Transaction).count() > 0:
            return
        now = datetime.now(timezone.utc)
        seeds = [
            {
                "phone_number": "+99999991001", "amount_rwf": 95000,
                "risk_score": 8, "decision": "approve",
                "created_at": now - timedelta(hours=2),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 120, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 0, "ms": 120, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 8, "ms": 120, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991000", "amount_rwf": 95000,
                "risk_score": 55, "decision": "challenge",
                "created_at": now - timedelta(hours=1),
                "signals": [
                    {"name": "sim_swap", "contrib": 35, "ms": 450, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": True, "swap_date": (now - timedelta(hours=2)).isoformat()}},
                    {"name": "device_swap", "contrib": 15, "ms": 450, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": True, "swap_date": (now - timedelta(hours=2)).isoformat()}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 0, "ms": 120, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991000", "amount_rwf": 180000,
                "risk_score": 78, "decision": "block",
                "created_at": now - timedelta(minutes=30),
                "signals": [
                    {"name": "sim_swap", "contrib": 50, "ms": 450, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": True, "swap_date": (now - timedelta(minutes=10)).isoformat()}},
                    {"name": "device_swap", "contrib": 15, "ms": 450, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": True, "swap_date": (now - timedelta(minutes=10)).isoformat()}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 0, "ms": 120, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
        ]
        for s in seeds:
            tx = Transaction(
                id=str(uuid.uuid4()), created_at=s["created_at"],
                phone_number=s["phone_number"], amount_rwf=s["amount_rwf"],
                recipient_wallet="wallet_rw_001",
                risk_score=s["risk_score"], decision=s["decision"],
                reasoning_text="", alert_kinyarwanda=None,
                total_response_ms=max(sig["ms"] for sig in s["signals"]) + 50
            )
            db.add(tx)
            db.flush()
            for sig in s["signals"]:
                db.add(ApiSignal(
                    id=str(uuid.uuid4()), transaction_id=tx.id,
                    api_name=sig["name"], raw_response=sig["raw"],
                    risk_contribution=sig["contrib"], response_ms=sig["ms"],
                    timed_out=sig["timeout"], error_message=sig["err"],
                ))
        db.commit()
    finally:
        db.close()

_seed_db()

app = FastAPI(
    title="SafeSwitch API",
    description="Real-time fraud prevention for mobile money — Nokia Network as Code + on-device reasoning engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

static_dir = os.environ.get("STATIC_DIR", "static")
assets_dir = os.path.join(static_dir, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="static_assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)
    file_path = os.path.join(static_dir, full_path) if full_path else static_dir
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return JSONResponse({"detail": "Not Found"}, status_code=404)
