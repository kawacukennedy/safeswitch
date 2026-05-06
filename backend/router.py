"""
FASTAPI ROUTE HANDLERS.

Endpoints:
  POST /analyze            — Full pipeline. Returns TransactionResponse.
  GET  /transactions       — Paginated history for dashboard table.
  GET  /dashboard/stats    — Aggregate stats for dashboard header.
  GET  /health             — Railway health check.

Pipeline order:
  1. Parallel CAMARA calls (orchestrator.py)
  2. Aggregate signals (aggregator.py)
  3. Compute risk score (scorer.py)
  4. Make decision (decision.py)
  5. Generate reasoning text (reasoning_engine.py) — pure Python, <1ms
  6. Persist to SQLite (models.py)
  7. Return structured JSON response

No streaming endpoint needed — reasoning_engine.py returns instantly.
The frontend typewriter animation is purely a CSS/JS effect on the full
text returned in the JSON response. It gives the "thinking" feel without
any backend streaming.
"""
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import TransactionRequest, TransactionResponse, TransactionListItem, DashboardStats
from orchestrator import run_parallel_checks
from aggregator import aggregate_signals
from scorer import compute_risk_score
from reasoning_engine import generate_reasoning
from decision import make_decision
import models
from typing import List

router = APIRouter()

@router.post("/analyze", response_model=TransactionResponse)
async def analyze_transaction(request: TransactionRequest, db: Session = Depends(get_db)):
    wall_start = time.time()

    # 1. Parallel CAMARA API calls
    raw_results = await run_parallel_checks(
        phone_number=request.phone_number,
        window_hours=request.sim_swap_window_hours
    )

    # 2. Aggregate
    signals = aggregate_signals(raw_results)

    # 3. Score
    score, confidence, contributions = compute_risk_score(signals)

    # 4. Decide
    decision = make_decision(score, confidence)

    # 5. Generate reasoning (pure Python, <1ms)
    reasoning_text, kinyarwanda = generate_reasoning(
        signals=signals,
        score=score,
        decision=decision,
        amount_rwf=request.amount_rwf,
        contributions=contributions,
        phone_number=request.phone_number
    )

    total_ms = int((time.time() - wall_start) * 1000)

    # 6. Persist
    transaction = models.Transaction(
        phone_number=request.phone_number,
        amount_rwf=request.amount_rwf,
        recipient_wallet=request.recipient_wallet,
        risk_score=score,
        decision=decision,
        reasoning_text=reasoning_text,
        alert_kinyarwanda=kinyarwanda,
        total_response_ms=total_ms
    )
    db.add(transaction)
    db.flush()  # Flush to get the transaction.id

    for api_name, raw in [
        ("sim_swap", raw_results["sim_swap"]),
        ("device_swap", raw_results["device_swap"]),
        ("number_verification", raw_results["number_verification"]),
        ("device_status", raw_results["device_status"])
    ]:
        db.add(models.ApiSignal(
            transaction_id=transaction.id,
            api_name=api_name,
            raw_response=raw,
            risk_contribution=contributions.get(api_name, 0),
            response_ms=raw.get("response_ms"),
            timed_out=raw.get("timed_out", False),
            error_message=raw.get("error")
        ))

    db.commit()
    db.refresh(transaction)

    # 7. Build response
    signal_responses = []
    for api_name in ["sim_swap", "device_swap", "number_verification", "device_status"]:
        raw = raw_results[api_name]
        signal_responses.append({
            "api_name": api_name,
            "risk_contribution": contributions.get(api_name, 0),
            "response_ms": raw.get("response_ms"),
            "timed_out": raw.get("timed_out", False),
            "summary": _summarise_signal(api_name, signals, raw)
        })

    return TransactionResponse(
        transaction_id=transaction.id,
        phone_number=request.phone_number,
        amount_rwf=request.amount_rwf,
        risk_score=score,
        decision=decision,
        reasoning_text=reasoning_text,
        alert_kinyarwanda=kinyarwanda,
        total_response_ms=total_ms,
        signals=signal_responses
    )


@router.get("/transactions", response_model=List[TransactionListItem])
def get_transactions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.Transaction)\
             .order_by(models.Transaction.created_at.desc())\
             .offset(skip).limit(limit).all()


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(models.Transaction).count()
    blocked = db.query(models.Transaction).filter(models.Transaction.decision == "block").count()
    challenged = db.query(models.Transaction).filter(models.Transaction.decision == "challenge").count()
    approved = db.query(models.Transaction).filter(models.Transaction.decision == "approve").count()
    avg_ms = db.query(func.avg(models.Transaction.total_response_ms)).scalar() or 0
    return DashboardStats(
        total_transactions=total, total_blocked=blocked,
        total_challenged=challenged, total_approved=approved,
        block_rate_pct=round((blocked / total * 100) if total > 0 else 0, 1),
        avg_response_ms=round(avg_ms, 0)
    )


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "SafeSwitch API", "version": "1.0.0"}


def _summarise_signal(api_name: str, signals: dict, raw: dict) -> str:
    if raw.get("timed_out"):
        return "API timeout — signal unavailable"
    if raw.get("error"):
        return f"Error: {raw['error'][:60]}"
    if api_name == "sim_swap":
        if signals.get("sim_swap_detected"):
            mins = signals.get("sim_swap_minutes_ago")
            return f"SIM replaced {mins} minutes ago" if mins else "SIM recently replaced"
        return "No SIM swap detected"
    if api_name == "device_swap":
        return "SIM moved to new device" if signals.get("device_swap_detected") else "No device swap detected"
    if api_name == "number_verification":
        v = signals.get("number_verified")
        if v is True: return "Number verified — matches session device"
        if v is False: return "Verification failed — number mismatch"
        return "Verification unavailable"
    if api_name == "device_status":
        return "Anomalous signal detected (roaming)" if signals.get("device_anomalous") else "Device status nominal"
    return "Signal processed"
