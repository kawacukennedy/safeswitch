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
                "phone_number": "+99999991000", "amount_rwf": 25000,
                "risk_score": 5, "decision": "approve",
                "created_at": now - timedelta(hours=12),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 120, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 0, "ms": 110, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 5, "ms": 95, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991000", "amount_rwf": 15000,
                "risk_score": 3, "decision": "approve",
                "created_at": now - timedelta(hours=10),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 105, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 0, "ms": 98, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 3, "ms": 88, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991000", "amount_rwf": 50000,
                "risk_score": 7, "decision": "approve",
                "created_at": now - timedelta(hours=8),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 115, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 0, "ms": 108, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 7, "ms": 92, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991234", "amount_rwf": 35000,
                "risk_score": 45, "decision": "challenge",
                "created_at": now - timedelta(hours=7),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 210, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 15, "ms": 205, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": True, "swap_date": (now - timedelta(hours=7)).isoformat()}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 0, "ms": 130, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991234", "amount_rwf": 60000,
                "risk_score": 42, "decision": "challenge",
                "created_at": now - timedelta(hours=6),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 195, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 15, "ms": 188, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": True, "swap_date": (now - timedelta(hours=7)).isoformat()}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 0, "ms": 120, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991000", "amount_rwf": 95000,
                "risk_score": 10, "decision": "approve",
                "created_at": now - timedelta(hours=5),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 118, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 0, "ms": 112, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 10, "ms": 105, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991234", "amount_rwf": 120000,
                "risk_score": 55, "decision": "challenge",
                "created_at": now - timedelta(hours=4),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 220, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 15, "ms": 215, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": True, "swap_date": (now - timedelta(hours=7)).isoformat()}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 0, "ms": 125, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991500", "amount_rwf": 80000,
                "risk_score": 72, "decision": "block",
                "created_at": now - timedelta(hours=3),
                "signals": [
                    {"name": "sim_swap", "contrib": 50, "ms": 450, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": True, "swap_date": (now - timedelta(hours=3, minutes=10)).isoformat()}},
                    {"name": "device_swap", "contrib": 0, "ms": 320, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 10, "ms": 340, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": True, "anomalous": True}},
                ]
            },
            {
                "phone_number": "+99999991500", "amount_rwf": 15000,
                "risk_score": 65, "decision": "challenge",
                "created_at": now - timedelta(hours=2),
                "signals": [
                    {"name": "sim_swap", "contrib": 35, "ms": 430, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": True, "swap_date": (now - timedelta(hours=3, minutes=10)).isoformat()}},
                    {"name": "device_swap", "contrib": 0, "ms": 310, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 10, "ms": 330, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": True, "anomalous": True}},
                ]
            },
            {
                "phone_number": "+99999991500", "amount_rwf": 250000,
                "risk_score": 85, "decision": "block",
                "created_at": now - timedelta(hours=1),
                "signals": [
                    {"name": "sim_swap", "contrib": 50, "ms": 460, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": True, "swap_date": (now - timedelta(hours=3, minutes=10)).isoformat()}},
                    {"name": "device_swap", "contrib": 0, "ms": 325, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 10, "ms": 345, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": True, "anomalous": True}},
                ]
            },
            {
                "phone_number": "+99999991234", "amount_rwf": 25000,
                "risk_score": 38, "decision": "approve",
                "created_at": now - timedelta(minutes=45),
                "signals": [
                    {"name": "sim_swap", "contrib": 0, "ms": 180, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": False, "swap_date": None}},
                    {"name": "device_swap", "contrib": 15, "ms": 175, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": True, "swap_date": (now - timedelta(hours=7)).isoformat()}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 0, "ms": 115, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": False, "anomalous": False}},
                ]
            },
            {
                "phone_number": "+99999991500", "amount_rwf": 45000,
                "risk_score": 75, "decision": "block",
                "created_at": now - timedelta(minutes=20),
                "signals": [
                    {"name": "sim_swap", "contrib": 50, "ms": 440, "timeout": False, "err": None, "raw": {"api": "sim_swap", "detected": True, "swap_date": (now - timedelta(hours=3, minutes=10)).isoformat()}},
                    {"name": "device_swap", "contrib": 0, "ms": 315, "timeout": False, "err": None, "raw": {"api": "device_swap", "detected": False, "swap_date": None}},
                    {"name": "number_verification", "contrib": 0, "ms": 0, "timeout": False, "err": None, "raw": {"api": "number_verification", "verified": None}},
                    {"name": "device_status", "contrib": 10, "ms": 335, "timeout": False, "err": None, "raw": {"api": "device_status", "roaming": True, "anomalous": True}},
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
