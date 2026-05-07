"""
SAFESWITCH REASONING ENGINE.

This module generates rich, human-readable fraud analysis text entirely
in Python — no external AI APIs, no model weights, no network calls.

Architecture: a multi-layer template composition system.

Layer 1 — Signal classification:
  Each signal is classified into one of several named states:
    sim_swap: "critical_fresh" | "high_recent" | "moderate_old" | "clean" | "unknown"
    device_swap: "combo_attack" | "isolated" | "clean" | "unknown"
    number_verification: "failed" | "passed" | "unknown"
    device_status: "anomalous" | "normal" | "unknown"

Layer 2 — Pattern matching:
  The combination of signal states is matched against a library of known
  fraud patterns. Each pattern produces a named threat classification:
    "active_account_takeover"  — SIM + device swap within 1 hour
    "probable_sim_swap_fraud"  — SIM swap + at least one other signal
    "device_hijack"            — Device swap alone, no SIM swap
    "unverified_identity"      — Number verification failed only
    "suspicious_activity"      — Multiple moderate signals
    "low_risk"                 — No significant signals

Layer 3 — Sentence composition:
  For each signal state, a library of sentence fragments is defined.
  Fragments are chosen based on signal state and assembled into a coherent
  paragraph. Fragments are varied using a deterministic hash of the
  phone number so that different transactions produce different-sounding
  text even with similar signal patterns.

Layer 4 — Kinyarwanda alert generation (for block decisions):
  A lookup table of pre-written Kinyarwanda alert sentences, selected
  based on the primary threat classification.

This approach produces output that reads like expert fraud analysis,
is fully auditable (every sentence traces to a specific signal state),
and runs in <1ms with zero dependencies.
"""
import hashlib
from typing import Dict, Any, Tuple, Optional

# ─── SIGNAL CLASSIFIER ────────────────────────────────────────────────────────

def _classify_sim_swap(signals: Dict[str, Any]) -> str:
    detected = signals.get("sim_swap_detected")
    minutes = signals.get("sim_swap_minutes_ago")
    if detected is None:
        return "unknown"
    if not detected:
        return "clean"
    if minutes is not None and minutes < 60:
        return "critical_fresh"
    if minutes is not None and minutes < 360:
        return "high_recent"
    return "moderate_old"

def _classify_device_swap(signals: Dict[str, Any], sim_class: str) -> str:
    detected = signals.get("device_swap_detected")
    if detected is None:
        return "unknown"
    if not detected:
        return "clean"
    if sim_class in ("critical_fresh", "high_recent"):
        return "combo_attack"
    return "isolated"

def _classify_number_verification(signals: Dict[str, Any]) -> str:
    verified = signals.get("number_verified")
    if verified is None:
        return "unknown"
    return "passed" if verified else "failed"

def _classify_device_status(signals: Dict[str, Any]) -> str:
    anomalous = signals.get("device_anomalous")
    if anomalous is None:
        return "unknown"
    return "anomalous" if anomalous else "normal"

# ─── PATTERN MATCHER ──────────────────────────────────────────────────────────

def _match_threat_pattern(sim: str, device: str, number: str, status: str) -> str:
    if sim == "critical_fresh" and device == "combo_attack":
        return "active_account_takeover"
    if sim in ("critical_fresh", "high_recent") and (device in ("combo_attack", "isolated") or number == "failed"):
        return "probable_sim_swap_fraud"
    if sim == "moderate_old" and (device != "clean" or number == "failed"):
        return "probable_sim_swap_fraud"
    if device in ("combo_attack", "isolated") and sim == "clean":
        return "device_hijack"
    if number == "failed" and sim == "clean" and device == "clean":
        return "unverified_identity"
    if status == "anomalous" and sim == "clean":
        return "suspicious_activity"
    if sim in ("critical_fresh", "high_recent", "moderate_old"):
        return "probable_sim_swap_fraud"
    return "low_risk"

# ─── SENTENCE FRAGMENTS ───────────────────────────────────────────────────────

SIM_SWAP_FRAGMENTS = {
    "critical_fresh": [
        "The SIM Swap API returned a confirmed swap event {minutes} minutes ago — this falls within the critical fraud window where most SIM swap attacks occur.",
        "Network as Code confirms a SIM card replacement {minutes} minutes ago on this number. This timing is consistent with the account takeover pattern documented in the 2026 Equity Bank Rwanda breach.",
        "A SIM swap was detected just {minutes} minutes ago. In the East African mobile money context, swaps within the first hour represent the highest-risk window for fraudulent transfers.",
    ],
    "high_recent": [
        "The SIM Swap API confirms a card replacement {minutes} minutes ago. While outside the immediate takeover window, this remains a high-risk signal that warrants verification.",
        "A SIM swap occurred {minutes} minutes ago. The risk is elevated — fraudsters often wait several hours before initiating transfers to reduce suspicion.",
        "Network data shows this SIM was replaced {minutes} minutes ago. This is a significant fraud signal, particularly when combined with other anomalies.",
    ],
    "moderate_old": [
        "A SIM swap is on record, though it occurred more than six hours ago. This is a weaker signal individually, but its presence elevates the combined risk profile.",
        "The SIM was replaced more than {minutes} minutes ago. Older swaps carry reduced individual risk, but are still considered when evaluating overall transaction safety.",
        "A historical SIM swap is detected on this number. When combined with other signals, this contributes to an elevated risk assessment.",
    ],
    "clean": [
        "No SIM swap activity detected within the review window. This is the strongest single positive signal.",
        "The SIM Swap API returned clean — no card replacement detected. This significantly reduces fraud probability.",
        "SIM continuity confirmed. No swap events found in the specified window.",
    ],
    "unknown": [
        "The SIM Swap API did not return a result within the timeout window. This signal is treated as neutral.",
        "SIM Swap data unavailable — API timeout. The assessment proceeds on the remaining signals.",
        "No SIM Swap response received. Scoring adjusted for reduced signal confidence.",
    ]
}

DEVICE_SWAP_FRAGMENTS = {
    "combo_attack": [
        "Device Swap also confirmed — the SIM has been installed in a new physical device. This SIM swap + device swap combination is the defining signature of a mobile money account takeover.",
        "A device swap is detected alongside the SIM swap. This is a critical combination: the attacker obtained a new SIM registered to the victim's number and inserted it into their own device.",
        "Both SIM and device have changed. This two-signal combination is the exact pattern that enabled the March 2026 Equity Bank Rwanda fraud.",
    ],
    "isolated": [
        "A device swap was detected independently of any SIM change. This is a moderate risk signal — it may indicate a legitimate device upgrade or a partial account compromise.",
        "Device swap detected without a corresponding SIM event. While this can reflect legitimate behaviour, it warrants step-up verification.",
        "The SIM has been moved to a new device. In isolation this adds moderate risk to the profile.",
    ],
    "clean": [
        "No device swap detected. The SIM remains in its original device.",
        "Device continuity confirmed — no swap events.",
        "The Device Swap API returned clean.",
    ],
    "unknown": [
        "Device Swap data unavailable — signal treated as neutral.",
        "Device Swap API timed out. Assessment continues on available signals.",
        "No Device Swap result received within timeout.",
    ]
}

NUMBER_VERIFICATION_FRAGMENTS = {
    "failed": [
        "Number Verification failed — the phone number could not be confirmed as belonging to the device initiating this session. This is consistent with a SIM being used in an attacker's device.",
        "The Number Verification API returned a mismatch. This means the number is not responding from its expected device, a key indicator of account compromise.",
        "Silent network verification failed. The device sending this request does not match the registered device for this number.",
    ],
    "passed": [
        "Number Verification passed — the phone number is confirmed as belonging to the session device. This is a positive signal.",
        "The number is verified against the session device. This reduces fraud probability.",
        "Silent network authentication successful — number matches device.",
    ],
    "unknown": [
        "Number Verification unavailable — signal treated as neutral.",
        "Verification API timed out. Confidence adjusted.",
        "No verification result returned.",
    ]
}

DEVICE_STATUS_FRAGMENTS = {
    "anomalous": [
        "Device Status shows anomalous connectivity — the device appears to be roaming in an unexpected location. This is inconsistent with the account's usage history.",
        "The Device Status API flags unexpected roaming activity. Combined with the other signals, this further supports a fraud determination.",
        "Anomalous device connectivity detected. Sudden roaming is sometimes used by fraudsters to obscure their location after a SIM swap.",
    ],
    "normal": [
        "Device connectivity is nominal — no anomalous roaming or status changes detected.",
        "Device Status returned clean. No connectivity anomalies.",
        "Normal device behaviour confirmed.",
    ],
    "unknown": [
        "Device Status data unavailable — signal treated as neutral.",
        "Device Status API timed out.",
        "No Device Status result received.",
    ]
}

CONFIDENCE_NOTES = {
    4: "All four Nokia Network as Code APIs responded. Confidence: high.",
    3: "Three of four APIs responded. Confidence: good.",
    2: "Two APIs responded. Confidence: moderate — treat result with appropriate caution.",
    1: "Only one API responded. Confidence: low — additional verification recommended.",
    0: "No API signals received. Assessment cannot be made reliably.",
}

KINYARWANDA_ALERTS = {
    "active_account_takeover": "Umutekano w'konti yawe ufite ikibazo gikomeye — harabaye impinduka ku SIM no ku cyuma mfite, transaction wahagaritswe.",
    "probable_sim_swap_fraud": "Konti yawe yagaragaje ibimenyetso by'uburiganya — transaction yahagaritswe kugira ngo urinde amafaranga yawe.",
    "device_hijack": "Igikoresho cyawe cyongeye gushyirwaho — transaction yahagaritswe kugirango tubyemeze nawe.",
    "unverified_identity": "Ntushobora kwemerwa kuri iri transaction — vugana na serivisi yawe ya mobile money.",
    "suspicious_activity": "Ibimenyetso by'ibikorwa bidakwiye birahari — transaction yahagaritswe kugira ngo urinde konti yawe.",
    "low_risk": "Transaction yahagaritswe ku mpamvu z'umutekano. Vugana na serivisi yawe.",
}

# ─── FRAGMENT SELECTOR ────────────────────────────────────────────────────────

def _select(fragments: list, phone_number: str, offset: int = 0) -> str:
    h = int(hashlib.md5((phone_number + str(offset)).encode()).hexdigest(), 16)
    return fragments[h % len(fragments)]

# ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

def generate_reasoning(
    signals: Dict[str, Any],
    score: int,
    decision: str,
    amount_rwf: float,
    contributions: Dict[str, int],
    phone_number: str
) -> Tuple[str, Optional[str]]:
    sim_class = _classify_sim_swap(signals)
    dev_class = _classify_device_swap(signals, sim_class)
    num_class = _classify_number_verification(signals)
    status_class = _classify_device_status(signals)

    threat = _match_threat_pattern(sim_class, dev_class, num_class, status_class)

    minutes = signals.get("sim_swap_minutes_ago", "unknown")

    sim_sentence = _select(SIM_SWAP_FRAGMENTS[sim_class], phone_number, 0)
    sim_sentence = sim_sentence.replace("{minutes}", str(minutes))

    dev_sentence = _select(DEVICE_SWAP_FRAGMENTS[dev_class], phone_number, 1)
    num_sentence = _select(NUMBER_VERIFICATION_FRAGMENTS[num_class], phone_number, 2)
    status_sentence = _select(DEVICE_STATUS_FRAGMENTS[status_class], phone_number, 3)

    apis_available = signals.get("apis_available", 0)
    confidence_note = CONFIDENCE_NOTES.get(apis_available, CONFIDENCE_NOTES[0])

    decision_line = {
        "block": f"Combined risk score: {score}/100. Decision: BLOCK — transaction prevented.",
        "challenge": f"Combined risk score: {score}/100. Decision: CHALLENGE — USSD step-up verification dispatched.",
        "approve": f"Combined risk score: {score}/100. Decision: APPROVE — transaction cleared.",
    }.get(decision, f"Score: {score}/100.")

    reasoning = (
        f"{sim_sentence} "
        f"{dev_sentence} "
        f"{num_sentence} "
        f"{status_sentence} "
        f"{confidence_note} "
        f"{decision_line}"
    )

    kinyarwanda = KINYARWANDA_ALERTS.get(threat) if decision == "block" else None

    return reasoning, kinyarwanda
