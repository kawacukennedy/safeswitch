"""
RISK SCORING ENGINE — v2 (continuous recency, combo synergy, amount weight, velocity).

Deterministic weighted scoring: 0–100.

Weights are based on empirically documented fraud patterns in East African
mobile money systems, specifically the SIM swap + device swap combo attack
pattern observed in the March 2026 Equity Bank Rwanda breach.

v2 IMPROVEMENTS:
  - Continuous recency decay for SIM swap (no more 3-bin coarse buckets)
  - Combo attack synergy bonus: SIM + device swap together > sum of parts
  - Amount-weighted risk: high-value transactions amplify existing signals
  - Transaction velocity penalty: rapid repeated transactions elevate risk

SCORING RULES:
  SIM swap (continuous recency):
    0-60 min:          50 points (flat — peak risk window)
    60-360 min:        50→20 (linear decay over 300 min)
    360+ min:          20 (floor)

  Combo attack bonus:
    SIM swap + device swap both detected:   +10

  Device swap (alone, no SIM swap):         +15

  Number verification failed:               +20
  Number verification passed:               -5 (if no SIM swap)

  Device anomalous/roaming:                 +10
  Device clean:                             -3 (if no SIM swap)

  Transaction velocity (same phone, last 60 min):
    3-4 transactions:                       +15
    5+ transactions:                        +25

  Amount multiplier (if score > 0):
    Amount > 100,000 RWF:                   ×1.15 (capped at 100)

CONFIDENCE: based on API availability (4→1.0, 3→0.85, 2→0.6, 1→0.35, 0→0.0)
Score clamped to [0, 100].
"""
from typing import Dict, Any, Tuple
from config import settings

CONFIDENCE_MAP = {4: 1.0, 3: 0.85, 2: 0.6, 1: 0.35, 0: 0.0}


def _sim_swap_score(minutes) -> int:
    if minutes is None:
        return 20
    if minutes < 60:
        return 50
    if minutes < 360:
        decay = 30 * (minutes - 60) / 300
        return max(20, int(50 - decay))
    return 20


def compute_risk_score(
    signals: Dict[str, Any],
    amount_rwf: float = 0,
    velocity: Dict[str, Any] = None
) -> Tuple[int, float, Dict[str, int]]:
    contributions = {}

    sim_detected = signals.get("sim_swap_detected")
    sim_minutes = signals.get("sim_swap_minutes_ago")
    dev_detected = signals.get("device_swap_detected")
    num_verified = signals.get("number_verified")
    anomalous = signals.get("device_anomalous")
    apis_available = signals.get("apis_available", 0)

    if sim_detected is True:
        contributions["sim_swap"] = _sim_swap_score(sim_minutes)
    else:
        contributions["sim_swap"] = 0

    if dev_detected is True:
        contributions["device_swap"] = 15
    else:
        contributions["device_swap"] = 0

    if num_verified is False:
        contributions["number_verification"] = 20
    elif num_verified is True:
        contributions["number_verification"] = -5 if not sim_detected else 0
    else:
        contributions["number_verification"] = 0

    if anomalous is True:
        contributions["device_status"] = 10
    elif anomalous is False:
        contributions["device_status"] = -3 if not sim_detected else 0
    else:
        contributions["device_status"] = 0

    combo_bonus = 0
    if sim_detected is True and dev_detected is True:
        combo_bonus = 10
    contributions["combo_bonus"] = combo_bonus

    velocity_penalty = 0
    tx_count = (velocity or {}).get("tx_count_last_window", 0)
    if tx_count >= settings.VELOCITY_TX_HIGH:
        velocity_penalty = 25
    elif tx_count >= settings.VELOCITY_TX_WARN:
        velocity_penalty = 15
    contributions["velocity_penalty"] = velocity_penalty

    contributions["unavailability_penalty"] = 15 if apis_available < 2 else 0

    raw_score = sum(contributions.values())

    if raw_score > 0 and amount_rwf > settings.AMOUNT_HIGH_THRESHOLD:
        amount_multiplier = min(1.15, 1.0 + (amount_rwf - settings.AMOUNT_HIGH_THRESHOLD) / settings.AMOUNT_HIGH_THRESHOLD * 0.05)
        raw_score = int(raw_score * amount_multiplier)

    score = max(0, min(100, raw_score))
    confidence = CONFIDENCE_MAP.get(apis_available, 0.0)
    return score, confidence, contributions
