"""
AGGREGATION LAYER.

Cleans and normalises the four raw API results from orchestrator.py into a
consistent dict that scorer.py and reasoning_engine.py can work with.

Responsibilities:
- Handle nulls, errors, and timeouts gracefully
- Compute minutes_since() for swap timestamps
- Count how many APIs returned valid data (for confidence scoring)
- Pass through individual response times for the frontend signal cards

Does NOT assign risk scores — that is strictly scorer.py's job.
This separation makes scorer.py fully unit-testable with mock inputs.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone

def _minutes_since(iso_str: Optional[str]) -> Optional[int]:
    if not iso_str:
        return None
    try:
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return max(0, int((datetime.now(timezone.utc) - dt).total_seconds() / 60))
    except Exception:
        return None

def aggregate_signals(raw: Dict[str, Any]) -> Dict[str, Any]:
    sim = raw.get("sim_swap", {})
    dev_swap = raw.get("device_swap", {})
    num_verify = raw.get("number_verification", {})
    dev_status = raw.get("device_status", {})

    apis_available = sum(
        1 for r in [sim, dev_swap, num_verify, dev_status]
        if not r.get("timed_out") and r.get("error") is None
    )

    return {
        "sim_swap_detected": sim.get("detected"),
        "sim_swap_minutes_ago": _minutes_since(sim.get("swap_date")),
        "device_swap_detected": dev_swap.get("detected"),
        "device_swap_minutes_ago": _minutes_since(dev_swap.get("swap_date")),
        "number_verified": num_verify.get("verified"),
        "device_anomalous": dev_status.get("anomalous"),
        "device_roaming": dev_status.get("roaming"),
        "apis_available": apis_available,
        "any_timed_out": any(r.get("timed_out", False) for r in [sim, dev_swap, num_verify, dev_status]),
        "response_times_ms": {
            "sim_swap": sim.get("response_ms"),
            "device_swap": dev_swap.get("response_ms"),
            "number_verification": num_verify.get("response_ms"),
            "device_status": dev_status.get("response_ms"),
        }
    }
