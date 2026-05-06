"""
RISK SCORING ENGINE.

Deterministic weighted scoring: 0–100.

Weights are based on empirically documented fraud patterns in East African
mobile money systems, specifically the SIM swap + device swap combo attack
pattern observed in the March 2026 Equity Bank Rwanda breach.

SCORING RULES:
  SIM swap < 60 min ago:        +50  (highest risk — active takeover window)
  SIM swap 60–360 min ago:      +35  (elevated risk — recent takeover)
  SIM swap > 360 min ago:       +20  (moderate risk — could be legitimate)
  Device swap (with SIM swap):  +25  (combo attack pattern — very high confidence fraud)
  Device swap (alone):          +15
  Number verification failed:   +20
  Device anomalous/roaming:     +10
  Clean number verification:    -5   (positive signal reduces baseline)
  Clean device status:          -3
  >2 APIs unavailable:          +15  (fail cautiously — uncertainty penalty)

CONFIDENCE: based on API availability (4→1.0, 3→0.85, 2→0.6, 1→0.35, 0→0.0)
Score clamped to [0, 100].
"""
from typing import Dict, Any, Tuple

CONFIDENCE_MAP = {4: 1.0, 3: 0.85, 2: 0.6, 1: 0.35, 0: 0.0}

def compute_risk_score(signals: Dict[str, Any]) -> Tuple[int, float, Dict[str, int]]:
    """Returns (score, confidence, contributions_per_signal)"""
    contributions = {}
    sim_detected = signals.get("sim_swap_detected")
    sim_minutes = signals.get("sim_swap_minutes_ago")
    dev_detected = signals.get("device_swap_detected")
    num_verified = signals.get("number_verified")
    anomalous = signals.get("device_anomalous")
    apis_available = signals.get("apis_available", 0)

    # SIM Swap — highest weight signal
    if sim_detected is True:
        if sim_minutes is not None and sim_minutes < 60:
            contributions["sim_swap"] = 50
        elif sim_minutes is not None and sim_minutes < 360:
            contributions["sim_swap"] = 35
        else:
            contributions["sim_swap"] = 20
    else:
        contributions["sim_swap"] = 0

    # Device Swap
    if dev_detected is True:
        contributions["device_swap"] = 25 if sim_detected else 15
    else:
        contributions["device_swap"] = 0

    # Number Verification
    if num_verified is False:
        contributions["number_verification"] = 20
    elif num_verified is True:
        contributions["number_verification"] = -5 if not sim_detected else 0
    else:
        contributions["number_verification"] = 0

    # Device Status
    if anomalous is True:
        contributions["device_status"] = 10
    elif anomalous is False:
        contributions["device_status"] = -3 if not sim_detected else 0
    else:
        contributions["device_status"] = 0

    # Unavailability penalty
    contributions["unavailability_penalty"] = 15 if apis_available < 2 else 0

    score = max(0, min(100, sum(contributions.values())))
    confidence = CONFIDENCE_MAP.get(apis_available, 0.0)
    return score, confidence, contributions
